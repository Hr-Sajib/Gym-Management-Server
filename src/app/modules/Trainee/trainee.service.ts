// src/app/modules/Trainee/trainee.service.ts
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { createToken, verifyToken } from '../../utils/auth.utils';
import config from '../../../config';
import { ITrainee } from './trainee.interface';
import Trainee from './trainee.model';
import Trainer from '../Trainer/trainer.model';

// Define a union type for user to accommodate both Trainee and Trainer shapes
type UserType = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const createTraineeIntoDB = async (payload: ITrainee) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newTrainee = await Trainee.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone,
  });

  if (!newTrainee) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create trainee');
  }

  return {
    id: newTrainee.id,
    name: newTrainee.name,
    email: newTrainee.email,
    phone: newTrainee.phone,
    createdAt: newTrainee.createdAt,
    updatedAt: newTrainee.updatedAt,
  };
};

const getAllTraineesFromDB = async () => {
  const trainees = await Trainee.find(
    {},
    { id: 1, name: 1, email: 1, phone: 1, _id: 0 }
  );
  return trainees;
};

const getTraineeByIdFromDB = async (id: string) => {
  const trainee = await Trainee.findOne(
    { id },
    { id: 1, name: 1, email: 1, phone: 1, _id: 0 }
  );

  if (!trainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  return trainee;
};

const updateTraineeInDB = async (id: string, updates: Partial<ITrainee>) => {
  let hashedPassword: string | undefined = undefined;

  if (updates.password) {
    const saltRounds = 10;
    hashedPassword = await bcrypt.hash(updates.password, saltRounds);
  }

  const updateData: Partial<ITrainee> = {
    name: updates.name,
    email: updates.email,
    phone: updates.phone,
  };

  if (hashedPassword) {
    updateData.password = hashedPassword;
  }

  const updatedTrainee = await Trainee.findOneAndUpdate(
    { id },
    { $set: updateData },
    { new: true, runValidators: true, fields: { id: 1, name: 1, email: 1, phone: 1, password: 1, _id: 0 } }
  );

  if (!updatedTrainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  return updatedTrainee;
};

const deleteTraineeFromDB = async (id: string) => {
  const result = await Trainee.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }
  return;
};

export const loginUserIntoDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  // Query Trainee collection
  let user: UserType | null = await Trainee.findOne(
    { email },
    { id: 1, name: 1, email: 1, password: 1, phone: 1, createdAt: 1, updatedAt: 1, _id: 0 }
  );
  let role: 'TRAINEE' | 'TRAINER' = 'TRAINEE';

  // If not found, query Trainer collection
  if (!user) {
    user = await Trainer.findOne(
      { email },
      { id: 1, name: 1, email: 1, password: 1, phone: 1, createdAt: 1, updatedAt: 1, _id: 0 }
    );
    if (user) {
      role = 'TRAINER';
    }
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', 'No user found with the provided email');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized access', 'Invalid password');
  }

  const jwtPayload = {
    userEmail: user.email,
    userPhone: user.phone ?? null,
    role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (token: string) => {
  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string) as {
      userId: string;
      userEmail: string;
      userPhone: string | null;
      role: string;
    };
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized access', 'Invalid refresh token');
  }

  const { userEmail } = decoded;

  // Check if user exists in Trainee collection
  let user: UserType | null = await Trainee.findOne(
    { email: userEmail },
    { id: 1, name: 1, email: 1, password: 1, phone: 1, createdAt: 1, updatedAt: 1, _id: 0 }
  );
  let role: 'TRAINEE' | 'TRAINER' | 'ADMIN' = 'TRAINEE';

  // If not found, check Trainer collection
  if (!user) {
    user = await Trainer.findOne(
      { email: userEmail },
      { id: 1, name: 1, email: 1, password: 1, phone: 1, createdAt: 1, updatedAt: 1, _id: 0 }
    );
    role = 'TRAINER';
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found', 'No user found with the provided email');
  }

  if (user.email === 'admin@example.com') {
    role = 'ADMIN';
  }

  const jwtPayload = {
    userId: user.id,
    userEmail: user.email,
    userPhone: user.phone ?? null,
    role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return { accessToken };
};

export const traineeServices = {
  createTraineeIntoDB,
  getAllTraineesFromDB,
  getTraineeByIdFromDB,
  updateTraineeInDB,
  deleteTraineeFromDB,
  loginUserIntoDB,
  refreshTokenService,
};