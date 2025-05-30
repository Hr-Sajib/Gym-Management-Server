// src/modules/class/class.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { classServices } from './class.service';
import mongoose from 'mongoose';

const createClass = catchAsync(async (req: Request, res: Response) => {
  const classData = req.body;

  // Restrict to ADMIN
  if (!['ADMIN'].includes(req.user?.table as string)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admins can create classes!');
  }

  const newClass = await classServices.createClassIntoDB(classData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Class created successfully',
    data: newClass,
  });
});

const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  // Restrict to ADMIN
  if (req.user?.table !== 'ADMIN') {
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
  if (!['ADMIN', 'TRAINER'].includes(req.user?.table as string)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admins or trainers can view class details!');
  }

  const classData = await classServices.getClassByIdFromDB(id);
  if (!classData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }

  // If the user is a TRAINER, ensure they are assigned to the class
  if (req.user?.table === 'TRAINER') {
    // Ensure assignedTrainerId is populated and compare with userId from JWT
    const assignedTrainerId = typeof classData.assignedTrainerId === 'object'
      ? classData.assignedTrainerId!._id.toString()
      : classData.assignedTrainerId!?.toString();
    if (assignedTrainerId !== req.user.userId) {
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
  if (req.user?.table !== 'ADMIN') {
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
    data: updatedClass,
  });
});

const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Restrict to ADMIN
  if (req.user?.table !== 'ADMIN') {
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



export const classController = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass
};