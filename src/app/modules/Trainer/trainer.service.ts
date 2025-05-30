// src/app/modules/Trainer/trainer.service.ts
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ITrainer } from './trainer.interface';
import Trainer from './trainer.model';
import Class from '../Class/class.model';


const createTrainerIntoDB = async (payload: ITrainer) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newTrainer = await Trainer.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone,
    // role is handled by the schema default ("TRAINER")
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
  const trainers = await Trainer.find(
    {},
    { id: 1, name: 1, email: 1, _id: 0 }
  );
  return trainers;
};

const getTrainerByIdFromDB = async (id: string) => {
  const trainer = await Trainer.findOne(
    { id },
    { id: 1, name: 1, email: 1, _id: 0 }
  );

  if (!trainer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  return trainer;
};

const updateTrainerInDB = async (id: string, updates: Partial<ITrainer>) => {
  let hashedPassword: string | undefined;

  if (updates.password) {
    hashedPassword = await bcrypt.hash(updates.password, 10);
  }

  const updateData: Partial<ITrainer> = {
    name: updates.name,
    email: updates.email,
    phone: updates.phone,
  };

  if (hashedPassword) {
    updateData.password = hashedPassword;
  }

  const updatedTrainer = await Trainer.findOneAndUpdate(
    { id },
    { $set: updateData },
    { new: true, runValidators: true, fields: { id: 1, name: 1, email: 1, _id: 0 } }
  );

  if (!updatedTrainer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  return updatedTrainer;
};

const deleteTrainerFromDB = async (id: string) => {
  const result = await Trainer.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }
  return;
};

const assignClassToTrainerInDB = async (trainerId: string, classId: string) => {
  // Check if trainer exists
  const trainer = await Trainer.findOne({ id: trainerId }).select('id name email assignedClasses');

  if (!trainer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  // Check if class exists
  const classData = await Class.findOne({ id: classId });

  if (!classData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // Check if class is already assigned to the trainer
  const isAssigned = trainer.assignedClasses.includes(classId);

  if (isAssigned) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Class already assigned to trainer');
  }

  // Assign class to trainer by updating the assignedClasses array
  const updatedTrainer = await Trainer.findOneAndUpdate(
    { id: trainerId },
    { $push: { assignedClasses: classId } },
    { new: true, runValidators: true, select: { id: 1, name: 1, email: 1, assignedClasses: 1, _id: 0 } }
  );

  if (!updatedTrainer) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to assign class to trainer');
  }

  return {
    ...updatedTrainer.toObject(), // Convert to plain object to avoid Mongoose document methods
    assignedClasses: updatedTrainer.assignedClasses, // Already a string array
  };
};

export const trainerServices = {
  createTrainerIntoDB,
  getAllTrainersFromDB,
  getTrainerByIdFromDB,
  updateTrainerInDB,
  deleteTrainerFromDB,
  assignClassToTrainerInDB,
};