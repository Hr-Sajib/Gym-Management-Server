// src/modules/class/class.service.ts
import mongoose, { Types } from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import Class from './class.model';
import Trainer from '../Trainer/trainer.model';
import Trainee from '../Trainee/trainee.model';
import { IClass } from './class.interface';
import { validateTwoHourGap } from '../../utils/timeValidation';

// Helper function to check the number of classes on a given date
const checkDailyClassLimit = async (date: Date): Promise<void> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const classCount = await Class.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (classCount >= 5) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Maximum 5 classes per day allowed');
  }
};

// Helper function to check if a trainee has a conflicting class
const checkTraineeTimeConflict = async (traineeId: string, classData: IClass): Promise<void> => {
  const trainee = await Trainee.findById(traineeId);
  if (!trainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  // Fetch the enrolled classes manually
  const enrolledClasses = await Class.find({
    _id: { $in: trainee.enrolledClasses },
  }).select('date startTime endTime').lean();

  const newClassStart = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.startTime}:00`);
  const newClassEnd = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.endTime}:00`);

  for (const enrolledClass of enrolledClasses as IClass[]) {
    if (enrolledClass.date.toISOString().split('T')[0] !== classData.date.toISOString().split('T')[0]) {
      continue;
    }

    const enrolledStart = new Date(`${enrolledClass.date.toISOString().split('T')[0]}T${enrolledClass.startTime}:00`);
    const enrolledEnd = new Date(`${enrolledClass.date.toISOString().split('T')[0]}T${enrolledClass.endTime}:00`);

    if (
      (newClassStart >= enrolledStart && newClassStart < enrolledEnd) ||
      (newClassEnd > enrolledStart && newClassEnd <= enrolledEnd) ||
      (newClassStart <= enrolledStart && newClassEnd >= enrolledEnd)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Trainee already has a class scheduled in this time slot');
    }
  }
};

const createClassIntoDB = async (payload: IClass) => {
  console.log(`[createClassIntoDB] Creating class: ${JSON.stringify(payload)}`);

  // Validate 2-hour gap between startTime and endTime
  validateTwoHourGap(payload.startTime, payload.endTime, payload.date);

  // Check daily class limit (max 5 classes per day)
  await checkDailyClassLimit(payload.date);

  // Validate assignedTrainerId if provided
  if (payload.assignedTrainerId) {
    if (!mongoose.Types.ObjectId.isValid(payload.assignedTrainerId)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainer ID: ${payload.assignedTrainerId}`);
    }
    const trainer = await Trainer.findById(payload.assignedTrainerId);
    if (!trainer) {
      throw new AppError(httpStatus.NOT_FOUND, `Trainer with ID ${payload.assignedTrainerId} not found`);
    }
    // Update trainer's assignedClasses
    await Trainer.findByIdAndUpdate(
      payload.assignedTrainerId,
      { $addToSet: { assignedClasses: new Types.ObjectId(payload._id) } },
      { new: true }
    );
  }

  // Validate enrolledTraineeIds if provided
  if (payload.enrolledTraineeIds && payload.enrolledTraineeIds.length > 0) {
    // Check trainee limit
    if (payload.enrolledTraineeIds.length > 10) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Maximum 10 trainees allowed per class');
    }

    const invalidIds = payload.enrolledTraineeIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainee IDs: ${invalidIds.join(', ')}`);
    }

    const trainees = await Trainee.find({ _id: { $in: payload.enrolledTraineeIds } });
    if (trainees.length !== payload.enrolledTraineeIds.length) {
      const foundIds = trainees.map((t) => t._id.toString());
      const missingIds = payload.enrolledTraineeIds.filter((id) => !foundIds.includes(id.toString()));
      throw new AppError(httpStatus.NOT_FOUND, `Trainees with IDs ${missingIds.join(', ')} not found`);
    }

    // Check for time conflicts for each trainee
    for (const traineeId of payload.enrolledTraineeIds) {
      await checkTraineeTimeConflict(traineeId.toString(), payload);
    }

    // Update trainees' enrolledClasses
    await Trainee.updateMany(
      { _id: { $in: payload.enrolledTraineeIds } },
      { $addToSet: { enrolledClasses: new Types.ObjectId(payload._id) } }
    );
  }

  const newClass = await Class.create(payload);
  if (!newClass) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create class');
  }

  console.log(`[createClassIntoDB] Class created successfully: ${newClass._id}`);
  return newClass.toJSON();
};

const getAllClassesFromDB = async () => {
  const classes = await Class.find({})
    .populate('assignedTrainerId', 'name email')
    .populate('enrolledTraineeIds', 'name email')
    .lean();
  return classes;
};

const getClassByIdFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${id}`);
  }
  const classData = await Class.findById(id)
    .populate('assignedTrainerId', 'name email')
    .populate('enrolledTraineeIds', 'name email')
    .lean();
  if (!classData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return classData;
};

const updateClassInDB = async (id: string, updates: Partial<IClass>) => {
  console.log(`[updateClassInDB] Updating class ${id} with: ${JSON.stringify(updates)}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${id}`);
  }

  const existingClass = await Class.findById(id);
  if (!existingClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // Validate 2-hour gap if both startTime and endTime are provided
  if (updates.startTime && updates.endTime && updates.date) {
    validateTwoHourGap(updates.startTime, updates.endTime, updates.date);
  } else if (updates.startTime || updates.endTime || updates.date) {
    const date = updates.date || existingClass.date;
    const startTime = updates.startTime || existingClass.startTime;
    const endTime = updates.endTime || existingClass.endTime;
    validateTwoHourGap(startTime, endTime, date);
  }

  // If date is updated, recheck daily class limit (exclude current class)
  if (updates.date && updates.date.getTime() !== existingClass.date.getTime()) {
    await checkDailyClassLimit(updates.date);
  }

  // Validate assignedTrainerId if provided
  if (updates.assignedTrainerId) {
    if (!mongoose.Types.ObjectId.isValid(updates.assignedTrainerId)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainer ID: ${updates.assignedTrainerId}`);
    }
    const trainer = await Trainer.findById(updates.assignedTrainerId);
    if (!trainer) {
      throw new AppError(httpStatus.NOT_FOUND, `Trainer with ID ${updates.assignedTrainerId} not found`);
    }
    // Remove class from previous trainer's assignedClasses
    if (existingClass.assignedTrainerId && existingClass.assignedTrainerId.toString() !== updates.assignedTrainerId.toString()) {
      await Trainer.findByIdAndUpdate(
        existingClass.assignedTrainerId,
        { $pull: { assignedClasses: id } },
        { new: true }
      );
    }
    // Add class to new trainer's assignedClasses
    await Trainer.findByIdAndUpdate(
      updates.assignedTrainerId,
      { $addToSet: { assignedClasses: id } },
      { new: true }
    );
  }

  // Validate enrolledTraineeIds if provided
  if (updates.enrolledTraineeIds) {
    // Check trainee limit
    if (updates.enrolledTraineeIds.length > 10) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Maximum 10 trainees allowed per class');
    }

    const invalidIds = updates.enrolledTraineeIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainee IDs: ${invalidIds.join(', ')}`);
    }

    const trainees = await Trainee.find({ _id: { $in: updates.enrolledTraineeIds } });
    if (trainees.length !== updates.enrolledTraineeIds.length) {
      const foundIds = trainees.map((t) => t._id.toString());
      const missingIds = updates.enrolledTraineeIds.filter((id) => !foundIds.includes(id.toString()));
      throw new AppError(httpStatus.NOT_FOUND, `Trainees with IDs ${missingIds.join(', ')} not found`);
    }

    // Check for time conflicts for new trainees
    const newTrainees = updates.enrolledTraineeIds.filter(
      (id) => !existingClass.enrolledTraineeIds!.some((existingId) => existingId.equals(id))
    );
    for (const traineeId of newTrainees) {
      await checkTraineeTimeConflict(traineeId.toString(), { ...existingClass, ...updates });
    }

    // Update trainees' enrolledClasses
    const removedTrainees = existingClass.enrolledTraineeIds!.filter(
      (id) => !updates.enrolledTraineeIds!.some((newId) => newId.equals(id))
    );
    await Trainee.updateMany(
      { _id: { $in: removedTrainees } },
      { $pull: { enrolledClasses: id } }
    );
    await Trainee.updateMany(
      { _id: { $in: updates.enrolledTraineeIds } },
      { $addToSet: { enrolledClasses: id } }
    );
  }

  const updatedClass = await Class.findByIdAndUpdate(id, { $set: updates }, { new: true })
    .populate('assignedTrainerId', 'name email')
    .populate('enrolledTraineeIds', 'name email')
    .lean();

  if (!updatedClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  console.log(`[updateClassInDB] Class updated successfully: ${id}`);
  return updatedClass;
};

const deleteClassFromDB = async (id: string) => {
  console.log(`[deleteClassFromDB] Deleting class: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${id}`);
  }

  const classData = await Class.findById(id);
  if (!classData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // Remove class from trainer's assignedClasses or conductedClasses
  if (classData.assignedTrainerId) {
    await Trainer.findByIdAndUpdate(
      classData.assignedTrainerId,
      {
        $pull: {
          assignedClasses: id,
          conductedClasses: id,
        },
      },
      { new: true }
    );
  }

  // Remove class from trainees' enrolledClasses
  if (classData.enrolledTraineeIds && classData.enrolledTraineeIds.length > 0) {
    await Trainee.updateMany(
      { _id: { $in: classData.enrolledTraineeIds } },
      { $pull: { enrolledClasses: id } }
    );
  }

  const result = await Class.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  console.log(`[deleteClassFromDB] Class deleted successfully: ${id}`);
  return result;
};



export const classServices = {
  createClassIntoDB,
  getAllClassesFromDB,
  getClassByIdFromDB,
  updateClassInDB,
  deleteClassFromDB,

};



