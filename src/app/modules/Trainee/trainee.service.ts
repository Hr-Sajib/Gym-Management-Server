// src/app/modules/Trainee/trainee.service.ts
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import mongoose from 'mongoose';
import { createToken, verifyToken } from '../../utils/auth.utils';
import config from '../../../config';
import { ITrainee } from './trainee.interface';
import Class from '../Class/class.model';
import Trainee from './trainee.model';
import Trainer from '../Trainer/trainer.model';


const createTraineeIntoDB = async (payload: ITrainee) => {
  // Validate enrolledClasses if provided
  if (payload.enrolledClasses && payload.enrolledClasses.length > 0) {
    const invalidIds = payload.enrolledClasses.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class IDs: ${invalidIds.join(', ')}`);
    }
    const classes = await Class.find({ _id: { $in: payload.enrolledClasses } });
    if (classes.length !== payload.enrolledClasses.length) {
      const foundIds = classes.map((c) => c._id.toString());
      const missingIds = payload.enrolledClasses.filter((id) => !foundIds.includes(id.toString()));
      throw new AppError(httpStatus.NOT_FOUND, `Classes with IDs ${missingIds.join(', ')} not found`);
    }
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const newTrainee = await Trainee.create({
    ...payload,
    password: hashedPassword,
  });

  if (!newTrainee) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create trainee');
  }

  return newTrainee.toJSON();
};

const getAllTraineesFromDB = async () => {
  return await Trainee.find({}).select('id name email phone enrolledClasses').lean();
};

const getTraineeByIdFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainee ID: ${id}`);
  }
  const trainee = await Trainee.findById(id).select('id name email phone enrolledClasses').lean();
  if (!trainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }
  return trainee;
};

const updateTraineeInDB = async (userEmail: string, updates: Partial<ITrainee>) => {
  // Find trainee by email
  const trainee = await Trainee.findOne({ email: userEmail }).select(
    'id name email phone enrolledClasses password role createdAt updatedAt'
  );

  // Check if trainee exists and email matches
  if (!trainee || trainee.email !== userEmail) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  // Validate enrolledClasses if provided
  if (updates.enrolledClasses && updates.enrolledClasses.length > 0) {
    const invalidIds = updates.enrolledClasses.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid Class IDs: ${invalidIds.join(', ')}`);
    }
    const classes = await Class.find({ _id: { $in: updates.enrolledClasses } });
    if (classes.length !== updates.enrolledClasses.length) {
      const foundIds = classes.map((c) => c._id.toString());
      const missingIds = updates.enrolledClasses.filter((id) => !foundIds.includes(id.toString()));
      throw new AppError(httpStatus.NOT_FOUND, `Classes with IDs ${missingIds.join(', ')} not found`);
    }
  }

  let hashedPassword: string | undefined;
  if (updates.password) {
    hashedPassword = await bcrypt.hash(updates.password, 10);
  }

  // Update the trainee
  const updatedTrainee = await Trainee.findOneAndUpdate(
    { email: userEmail },
    {
      $set: {
        ...updates,
        password: hashedPassword || undefined,
      },
    },
    { new: true }
  ).select('id name email phone enrolledClasses createdAt updatedAt');

  if (!updatedTrainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  return updatedTrainee.toJSON();
};

const deleteTraineeFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid Trainee ID: ${id}`);
  }
  const result = await Trainee.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }
  return result;
};

const loginUserIntoDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  // Query Trainee collection
  let user = await Trainee.findOne({ email }).select('id name email password phone role createdAt updatedAt');

  // If not found, query Trainer collection
  if (!user) {
    user = await Trainer.findOne({ email }).select('id name email password role createdAt updatedAt');
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  const jwtPayload = {
    userEmail: user.email,
    userPhone: user.phone ?? null,
    role: user.role, // Use role from user document
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

  return { accessToken, refreshToken };
};

const refreshTokenService = async (token: string) => {
  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string) as {
      userEmail: string;
      userPhone: string | null;
      role: string;
    };
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const { userEmail } = decoded;

  // Check Trainee collection
  let user = await Trainee.findOne({ email: userEmail }).select(
    'id name email password phone role createdAt updatedAt'
  );

  // If not found, query Trainer collection
  if (!user) {
    user = await Trainer.findOne({ email: userEmail }).select(
      'id name email password role createdAt updatedAt'
    );
   
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const jwtPayload = {
    userId: user._id,
    userEmail: user.email,
    userPhone: user.phone ?? null,
    role: user.role, // Use role from user document
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