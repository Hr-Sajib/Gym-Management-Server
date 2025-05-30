// src/modules/class/class.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { classServices } from './class.service';

const createClass = catchAsync(async (req: Request, res: Response) => {
  const classData = req.body;

  // Restrict to ADMIN or TRAINER
  if (!['ADMIN', 'TRAINER'].includes(req.user?.role as string)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admins or trainers can create classes!');
  }

  const newClass = await classServices.createClassIntoDB(classData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Class created successfully',
    data: {
      id: newClass.id,
      startTime: newClass.startTime,
      endTime: newClass.endTime,
      date: newClass.date,
      assignedTrainerId: newClass.assignedTrainerId,
      conductedOrNot: newClass.conductedOrNot, // Replaced conductedTrainerId
      enrolledTraineeIds: newClass.enrolledTraineeIds,
      createdAt: newClass.createdAt,
      updatedAt: newClass.updatedAt,
    },
  });
});

const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  // Restrict to ADMIN
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can view all classes!');
  }

  const classes = await classServices.getAllClassesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Classes retrieved successfully',
    data: classes,
  });
});

const getClassById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Restrict to ADMIN or TRAINER
  if (!['ADMIN', 'TRAINER'].includes(req.user?.role as string)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admins or trainers can view class details!');
  }

  const classData = await classServices.getClassByIdFromDB(id);
  if (!classData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // If the user is a TRAINER, ensure they are assigned to the class
  if (req.user?.role === 'TRAINER') {
    if (classData.assignedTrainerId !== req.user.id) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not assigned to this class!');
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class retrieved successfully',
    data: classData,
  });
});

const updateClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Restrict to ADMIN
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can update classes!');
  }

  const targetClass = await classServices.getClassByIdFromDB(id);
  if (!targetClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  const updatedClass = await classServices.updateClassInDB(id, updates);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class updated successfully',
    data: {
      id: updatedClass.id,
      startTime: updatedClass.startTime,
      endTime: updatedClass.endTime,
      date: updatedClass.date,
      assignedTrainerId: updatedClass.assignedTrainerId,
      conductedOrNot: updatedClass.conductedOrNot, // Replaced conductedTrainerId
      enrolledTraineeIds: updatedClass.enrolledTraineeIds,
    },
  });
});

const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Restrict to ADMIN
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can delete classes!');
  }

  const targetClass = await classServices.getClassByIdFromDB(id);
  if (!targetClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  await classServices.deleteClassFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class deleted successfully',
    data: null,
  });
});

const enrollTraineeInClass = catchAsync(async (req: Request, res: Response) => {
  const { id: classId } = req.params;
  const { traineeId } = req.body;

  // Restrict to ADMIN or TRAINEE (self-enrollment)
  if (!['ADMIN', 'TRAINEE'].includes(req.user?.role as string)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admins or trainees can enroll in classes!');
  }

  const targetClass = await classServices.getClassByIdFromDB(classId);
  if (!targetClass) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // If the user is a TRAINEE, ensure they are enrolling themselves
  if (req.user?.role === 'TRAINEE' && traineeId !== req.user.id) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You can only enroll yourself in a class!');
  }

  const updatedClass = await classServices.enrollTraineeInClass(classId, traineeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainee enrolled in class successfully',
    data: {
      id: updatedClass.id,
      startTime: updatedClass.startTime,
      endTime: updatedClass.endTime,
      date: updatedClass.date,
      enrolledTraineeIds: updatedClass.enrolledTraineeIds,
    },
  });
});

export const classController = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  enrollTraineeInClass,
};