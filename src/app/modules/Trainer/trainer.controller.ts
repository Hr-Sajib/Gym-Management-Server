// src/modules/trainer/controllers/trainer.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { trainerServices } from './trainer.service';


const createTrainer = catchAsync(async (req: Request, res: Response) => {
  const trainerData = req.body;

  const newTrainer = await trainerServices.createTrainerIntoDB(trainerData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Trainer created successfully',
    data: {
      id: newTrainer.id,
      name: newTrainer.name,
      email: newTrainer.email,
      createdAt: newTrainer.createdAt,
      updatedAt: newTrainer.updatedAt,
    },
  });
});

const assignClass = catchAsync(async (req: Request, res: Response) => {
  const { trainerId } = req.params;
  const { classId } = req.body;

  if (!classId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Class ID is required');
  }

  // Only ADMIN can assign classes
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can assign classes');
  }

  const updatedTrainer = await trainerServices.assignClassToTrainerInDB(trainerId, classId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class assigned to trainer successfully',
    data: updatedTrainer,
  });
});


const getAllTrainers = catchAsync(async (req: Request, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can view all trainers!');
  }

  const trainers = await trainerServices.getAllTrainersFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainers retrieved successfully',
    data: trainers,
  });
});

const getTrainerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const targetTrainer = await trainerServices.getTrainerByIdFromDB(id);
  if (!targetTrainer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }
  if (req.user?.userEmail !== 'admin@gym.com' && targetTrainer.email !== req.user?.userEmail) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You can't view another user's information!");
  }

  const trainer = await trainerServices.getTrainerByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainer retrieved successfully',
    data: trainer,
  });
});

const updateTrainer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const loggedInUserEmail = req.user?.userEmail;
  const loggedInUserTable = req.user?.role;

  if (loggedInUserTable !== 'TRAINER' && loggedInUserTable !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only trainers or admins can update trainer info!');
  }

  const targetTrainer = await trainerServices.getTrainerByIdFromDB(id);
  if (!targetTrainer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  if (loggedInUserTable !== 'ADMIN' && targetTrainer.email !== loggedInUserEmail) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You can't update another user's information!");
  }

  const updatedTrainer = await trainerServices.updateTrainerInDB(id, updates);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainer updated successfully',
    data: {
      id: updatedTrainer.id,
      name: updatedTrainer.name,
      email: updatedTrainer.email,
    },
  });
});

const deleteTrainer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.user?.role !== 'ADMIN') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can delete trainers!');
  }

  const targetTrainer = await trainerServices.getTrainerByIdFromDB(id);
  if (!targetTrainer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
  }

  await trainerServices.deleteTrainerFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trainer deleted successfully',
    data: null,
  });
});

export const trainerController = {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  assignClass
};