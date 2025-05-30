// src/modules/class/class.service.ts
import { IClass } from './class.interface';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import Class from './class.model';
import Trainer from '../Trainer/trainer.model';
import Trainee from '../Trainee/trainee.model';
import mongoose from 'mongoose';
import { validateTwoHourGap } from '../../utils/timeValidation';

const createClassIntoDB = async (payload: IClass) => {
  // Validate 2-hour gap between startTime and endTime
  validateTwoHourGap(payload.startTime, payload.endTime, payload.date);

  // Validate assignedTrainerId if provided
  if (payload.assignedTrainerId) {
    if (!mongoose.Types.ObjectId.isValid(payload.assignedTrainerId)) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainer ID: ${payload.assignedTrainerId}`);
    }
    const trainer = await Trainer.findById(payload.assignedTrainerId);
    if (!trainer) {
      throw new AppError(httpStatus.NOT_FOUND, `Trainer with ID ${payload.assignedTrainerId} not found`);
    }
  }

  // Validate enrolledTraineeIds if provided
  if (payload.enrolledTraineeIds && payload.enrolledTraineeIds.length > 0) {
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
  }

  const newClass = await Class.create(payload);
  if (!newClass) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create class');
  }
  return newClass.toJSON();
};

const getAllClassesFromDB = async () => {
  return await Class.find({}).lean();
};

const getClassByIdFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${id}`);
  }
  const classData = await Class.findById(id).lean();
  if (!classData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return classData;
};

const updateClassInDB = async (id: string, updates: Partial<IClass>) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${id}`);
  }

  // Validate 2-hour gap if both startTime and endTime are provided
  if (updates.startTime && updates.endTime && updates.date) {
    validateTwoHourGap(updates.startTime, updates.endTime, updates.date);
  } else if (updates.startTime || updates.endTime) {
    // Fetch existing class to get missing fields
    const existingClass = await Class.findById(id);
    if (!existingClass) {
      throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
    }
    const date = updates.date || existingClass.date;
    const startTime = updates.startTime || existingClass.startTime;
    const endTime = updates.endTime || existingClass.endTime;
    validateTwoHourGap(startTime, endTime, date);
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
  }

  // Validate enrolledTraineeIds if provided
  if (updates.enrolledTraineeIds && updates.enrolledTraineeIds.length > 0) {
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
  }

  const updatedClass = await Class.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!updatedClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return updatedClass;
};

const deleteClassFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${id}`);
  }
  const result = await Class.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return result;
};

const enrollTraineeInClass = async (classId: string, traineeId: string) => {
  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class ID: ${classId}`);
  }

  // Validate traineeId
  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainee ID: ${traineeId}`);
  }

  // Check if the class exists
  const targetClass = await Class.findById(classId);
  if (!targetClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // Check if the trainee exists
  const trainee = await Trainee.findById(traineeId);
  if (!trainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  // Check if the trainee is already enrolled
  if (targetClass.enrolledTraineeIds?.some((id) => id.equals(traineeId))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Trainee is already enrolled in this class');
  }

  // Enroll the trainee
  const updatedClass = await Class.findByIdAndUpdate(
    classId,
    { $push: { enrolledTraineeIds: traineeId } },
    { new: true }
  ).lean();

  if (!updatedClass) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to enroll trainee in class');
  }

  return updatedClass;
};

export const classServices = {
  createClassIntoDB,
  getAllClassesFromDB,
  getClassByIdFromDB,
  updateClassInDB,
  deleteClassFromDB,
  enrollTraineeInClass,
};