// src/modules/class/class.service.ts
import { IClass } from './class.interface';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import Class from './class.model';
import Trainee from '../Trainee/trainee.model';

const createClassIntoDB = async (payload: IClass) => {
  const newClass = await Class.create(payload);
  if (!newClass) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create class');
  }
  return newClass;
};

const getAllClassesFromDB = async () => {
  return await Class.find();
};

const getClassByIdFromDB = async (id: string) => {
  const classData = await Class.findOne({ id });
  return classData;
};

const updateClassInDB = async (id: string, updates: Partial<IClass>) => {
  const updatedClass = await Class.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  );
  if (!updatedClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return updatedClass;
};

const deleteClassFromDB = async (id: string) => {
  const result = await Class.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return result;
};

const enrollTraineeInClass = async (classId: string, traineeId: string) => {
  // Check if the class exists
  const targetClass = await Class.findOne({ id: classId });
  if (!targetClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // Check if the trainee exists
  const trainee = await Trainee.findOne({ id: traineeId });
  if (!trainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  // Check if the trainee is already enrolled
  if (targetClass.enrolledTraineeIds?.includes(traineeId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Trainee is already enrolled in this class');
  }

  // Enroll the trainee by pushing their ID to enrolledTraineeIds
  const updatedClass = await Class.findOneAndUpdate(
    { id: classId },
    { $push: { enrolledTraineeIds: traineeId } },
    { new: true }
  );

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