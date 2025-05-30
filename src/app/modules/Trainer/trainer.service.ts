// src/app/modules/Trainer/trainer.service.ts
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ITrainer } from './trainer.interface';
import Trainer from './trainer.model';
import Class from '../Class/class.model';
import mongoose, { Types } from 'mongoose';


const createTrainerIntoDB = async (payload: ITrainer) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newTrainer = await Trainer.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone,
    role: "TRAINER"
    
  });

  if (!newTrainer) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create trainer');
  }

  return {
    id: newTrainer.id,
    name: newTrainer.name,
    email: newTrainer.email,
    phone: newTrainer.phone,
    password: newTrainer.password, // Removed in controller response
    createdAt: newTrainer.createdAt,
    updatedAt: newTrainer.updatedAt,
    assignedClasses: newTrainer.assignedClasses,
    conductedClasses: newTrainer.conductedClasses,
  };
};

const getAllTrainersFromDB = async () => {
  const trainers = await Trainer.find();
  return trainers;
};

const getTrainerByIdFromDB = async (id: string) => {
  console.log(`[getTrainerByIdFromDB] Querying trainer with id: ${id}`);

  // Query by _id directly
  const trainer = await Trainer.findById(id);

  if (!trainer) {
    console.log(`[getTrainerByIdFromDB] Trainer not found for id: ${id}`);
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  console.log(`[getTrainerByIdFromDB] Trainer found: email=${trainer.email}, id=${trainer._id}`);
  return trainer;
};

const updateTrainerInDB = async (id: string, updates: Partial<ITrainer>) => {
  console.log(`[updateTrainerInDB] Updating trainer with id: ${id}, updates: ${JSON.stringify(updates)}`);

  // Validate that required fields aren't being modified incorrectly (e.g., role)
  if (updates.role && updates.role !== 'TRAINER') {
    console.log(`[updateTrainerInDB] Invalid role update attempt for id: ${id}`);
    throw new AppError(httpStatus.BAD_REQUEST, 'Role cannot be changed from TRAINER');
  }

  // Update the trainer
  const updatedTrainer = await Trainer.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true, select: { _id: 1, name: 1, email: 1, phone: 1, role: 1, assignedClasses: 1, conductedClasses: 1, createdAt: 1, updatedAt: 1 } }
  );

  if (!updatedTrainer) {
    console.log(`[updateTrainerInDB] Trainer not found or update failed for id: ${id}`);
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found or update failed');
  }

  console.log(`[updateTrainerInDB] Trainer updated successfully: email=${updatedTrainer.email}`);
  return updatedTrainer;
};

const deleteTrainerFromDB = async (id: string) => {
  console.log(`[deleteTrainerFromDB] Attempting to delete trainer with id: ${id}`);

 

  // Delete trainer by _id
  const result = await Trainer.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    console.log(`[deleteTrainerFromDB] Trainer not found for id: ${id}`);
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  console.log(`[deleteTrainerFromDB] Trainer deleted successfully for id: ${id}`);
  return;
};

// const assignClassToTrainerInDB = async (trainerId: string, classId: string) => {
//   // Check if trainer exists
//   const trainer = await Trainer.findOne({ id: trainerId }).select('id name email assignedClasses');

//   if (!trainer) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
//   }

//   // Check if class exists
//   const classData = await Class.findOne({ id: classId });

//   if (!classData) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
//   }

//   // Check if class is already assigned to the trainer
//   const isAssigned = trainer.assignedClasses.includes(classId);

//   if (isAssigned) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Class already assigned to trainer');
//   }

//   // Assign class to trainer by updating the assignedClasses array
//   const updatedTrainer = await Trainer.findOneAndUpdate(
//     { id: trainerId },
//     { $push: { assignedClasses: classId } },
//     { new: true, runValidators: true, select: { id: 1, name: 1, email: 1, assignedClasses: 1, _id: 0 } }
//   );

//   if (!updatedTrainer) {
//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to assign class to trainer');
//   }

//   return {
//     ...updatedTrainer.toObject(), // Convert to plain object to avoid Mongoose document methods
//     assignedClasses: updatedTrainer.assignedClasses, // Already a string array
//   };
// };


const assignClassToTrainer = async (trainerId: string, classId: string) => {
  console.log(`[assignClassToTrainer] Starting assignment: trainerId=${trainerId}, classId=${classId}`);

  // Validate ID formats
  if (!/^[0-9a-fA-F]{24}$/.test(trainerId) || !/^[0-9a-fA-F]{24}$/.test(classId)) {
    console.log(`[assignClassToTrainer] Invalid ID format: trainerId=${trainerId}, classId=${classId}`);
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid trainer or class ID format');
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the trainer
    const trainer = await Trainer.findById(trainerId).session(session);
    if (!trainer) {
      console.log(`[assignClassToTrainer] Trainer not found: trainerId=${trainerId}`);
      throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
    }

    // Fetch the class
    const classData = await Class.findById(classId).session(session);
    if (!classData) {
      console.log(`[assignClassToTrainer] Class not found: classId=${classId}`);
      throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
    }

    // Check if the class is already assigned to another trainer
    if (classData.assignedTrainerId && classData.assignedTrainerId.toString() !== trainerId) {
      console.log(`[assignClassToTrainer] Class already assigned to another trainer: classId=${classId}`);
      throw new AppError(httpStatus.BAD_REQUEST, 'Class is already assigned to another trainer');
    }

    // Check if the class is already in the trainer's assignedClasses
    if (trainer.assignedClasses.includes(classId)) {
      console.log(`[assignClassToTrainer] Class already assigned to this trainer: classId=${classId}`);
      throw new AppError(httpStatus.BAD_REQUEST, 'Class is already assigned to this trainer');
    }

    // Update the trainer's assignedClasses
    trainer.assignedClasses.push(classId);
    const updatedTrainer = await trainer.save({ session });

    // Update the class's assignedTrainerId
    classData.assignedTrainerId = trainerId ? new Types.ObjectId(trainerId) : null; // Now type-safe
    const updatedClass = await classData.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    console.log(`[assignClassToTrainer] Transaction committed: trainerId=${trainerId}, classId=${classId}`);

    return { updatedTrainer, updatedClass };
  } catch (error: any) {
    // Rollback the transaction on error
    await session.abortTransaction();
    console.log(`[assignClassToTrainer] Transaction rolled back due to error: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};


export const trainerServices = {
  createTrainerIntoDB,
  getAllTrainersFromDB,
  getTrainerByIdFromDB,
  updateTrainerInDB,
  deleteTrainerFromDB,
  assignClassToTrainer,
};