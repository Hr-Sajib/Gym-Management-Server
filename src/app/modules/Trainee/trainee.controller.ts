// src/modules/trainee/controllers/trainee.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { traineeServices } from './trainee.service';

const createTrainee = catchAsync(async (req: Request, res: Response) => {
  const traineeData = req.body;

  const newTrainee = await traineeServices.createTraineeIntoDB(traineeData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Trainee created successfully',
    data: newTrainee,
  });
});

const getAllTrainees = catchAsync(async (req: Request, res: Response) => {
  // Restrict to ADMIN
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can view all trainees!');
  }

  const trainees = await traineeServices.getAllTraineesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainees retrieved successfully',
    data: trainees,
  });
});

const getTraineeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Restrict to ADMIN or the trainee themselves
  const targetTrainee = await traineeServices.getTraineeByIdFromDB(id);
  if (!targetTrainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }
  if (req.user?.role !== 'ADMIN' && targetTrainee.email !== req.user?.userEmail) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You can't view another user's information!");
  }

  const trainee = await traineeServices.getTraineeByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainee retrieved successfully',
    data: trainee,
  });
});

const updateTrainee = catchAsync(async (req: Request, res: Response) => {
  const updates = req.body;
  const loggedInUserEmail = req.user?.email || '';
  const loggedInUserRole = req.user?.role;


  // Restrict to TRAINEE or ADMIN
  if (loggedInUserRole !== 'TRAINEE' && loggedInUserRole !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only trainees or admins can update trainee info!');
  }

  // Prevent role updates
  if (updates.role) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Role cannot be updated!');
  }

  const updatedTrainee = await traineeServices.updateTraineeInDB(loggedInUserEmail, updates);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainee updated successfully by himself',
    data: {
      id: updatedTrainee.id,
      name: updatedTrainee.name,
      email: updatedTrainee.email,
      phone: updatedTrainee.phone,
    },
  });
});

const deleteTrainee = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Restrict to ADMIN
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can delete trainees!');
  }

  const targetTrainee = await traineeServices.getTraineeByIdFromDB(id);
  if (!targetTrainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  await traineeServices.deleteTraineeFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainee deleted successfully',
    data: null,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await traineeServices.loginUserIntoDB({ email, password });
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: { accessToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token not provided');
  }

  const result = await traineeServices.refreshTokenService(token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  });
});

export const traineeController = {
  createTrainee,
  getAllTrainees,
  getTraineeById,
  updateTrainee,
  deleteTrainee,
  loginUser,
  refreshToken,
};