// src/app/modules/Trainee/trainee.service.ts
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import mongoose from 'mongoose';
import { createToken, verifyToken } from '../../utils/auth.utils';
import config from '../../../config';
import { ITrainee } from './trainee.interface';
import { IClass } from '../Class/class.interface';
import Class from '../Class/class.model';
import Trainee from './trainee.model';
import Trainer from '../Trainer/trainer.model';

// Helper function to check if a trainee has a conflicting class
const checkTraineeTimeConflict = async (traineeId: string, classData: IClass): Promise<void> => {
  const trainee = await Trainee.findById(traineeId).populate({
    path: 'enrolledClasses',
    select: 'date startTime endTime',
  });

  if (!trainee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
  }

  // Ensure enrolledClasses is populated and cast to IClass[]
  const enrolledClasses = trainee.enrolledClasses as unknown as IClass[];
  if (!enrolledClasses || enrolledClasses.length === 0) {
    return; // No conflicts if there are no enrolled classes
  }

  const newClassStart = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.startTime}:00`);
  const newClassEnd = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.endTime}:00`);

  for (const enrolledClass of enrolledClasses) {
    if (enrolledClass.date.toISOString().split('T')[0] !== classData.date.toISOString().split('T')[0]) {
      continue; // Skip classes on different dates
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
    role: "TRAINEE"
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

const enrollTraineeInClass = async (classId: string, traineeId: string) => {
  console.log(`[enrollTraineeInClass] Enrolling trainee ${traineeId} in class ${classId}`);

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(traineeId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid class or trainee ID');
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the class exists
    const targetClass = await Class.findById(classId)
      .populate('enrolledTraineeIds', 'name email')
      .session(session);
    if (!targetClass) {
      throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
    }

    // Check trainee limit
    if (targetClass.enrolledTraineeIds!.length >= 10) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Class schedule is full. Maximum 10 trainees allowed per schedule');
    }

    // Check if the trainee exists
    const trainee = await Trainee.findById(traineeId).session(session);
    if (!trainee) {
      throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
    }

    // Check if the trainee is already enrolled
    if (targetClass.enrolledTraineeIds!.some((t) => t._id.toString() === traineeId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Trainee is already enrolled in this class');
    }

    // Check for time conflicts
    await checkTraineeTimeConflict(traineeId, targetClass);

    // Update the Class to include the trainee
    targetClass.enrolledTraineeIds!.push(new mongoose.Types.ObjectId(traineeId));
    const updatedClass = await targetClass.save({ session });

    // Update the Trainee to include the class
    trainee.enrolledClasses.push(new mongoose.Types.ObjectId(classId));
    await trainee.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    console.log(`[enrollTraineeInClass] Transaction committed: traineeId=${traineeId}, classId=${classId}`);

    // Re-fetch the updated class with populated fields for response
    const finalClass = await Class.findById(classId)
      .populate('assignedTrainerId', 'name email')
      .populate('enrolledTraineeIds', 'name email')
      .lean();

    return finalClass;
  } catch (error: any) {
    // Rollback the transaction on error
    await session.abortTransaction();
    console.log(`[enrollTraineeInClass] Transaction rolled back due to error: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

const unenrollTraineeFromClass = async (classId: string, traineeId: string) => {
  console.log(`[unenrollTraineeFromClass] Unenrolling trainee ${traineeId} from class ${classId}`);

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(traineeId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid class or trainee ID');
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the class exists
    const targetClass = await Class.findById(classId)
      .populate('enrolledTraineeIds', 'name email')
      .session(session);
    if (!targetClass) {
      throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
    }

    // Check if the trainee exists
    const trainee = await Trainee.findById(traineeId).session(session);
    if (!trainee) {
      throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
    }

    // Check if the trainee is enrolled
    if (!targetClass.enrolledTraineeIds!.some((t) => t._id.toString() === traineeId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Trainee is not enrolled in this class');
    }

    // Update the Class to remove the trainee
    targetClass.enrolledTraineeIds = targetClass.enrolledTraineeIds!.filter(
      (t) => t._id.toString() !== traineeId
    );
    const updatedClass = await targetClass.save({ session });

    // Update the Trainee to remove the class
    trainee.enrolledClasses = trainee.enrolledClasses.filter(
      (c) => c.toString() !== classId
    );
    await trainee.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    console.log(`[unenrollTraineeFromClass] Transaction committed: traineeId=${traineeId}, classId=${classId}`);

    // Re-fetch the updated class with populated fields for response
    const finalClass = await Class.findById(classId)
      .populate('assignedTrainerId', 'name email')
      .populate('enrolledTraineeIds', 'name email')
      .lean();

    return finalClass;
  } catch (error: any) {
    // Rollback the transaction on error
    await session.abortTransaction();
    console.log(`[unenrollTraineeFromClass] Transaction rolled back due to error: ${error.message}`);
    throw error;
  } finally {
    session.endSession();
  }
};

export const traineeServices = {
  createTraineeIntoDB,
  getAllTraineesFromDB,
  getTraineeByIdFromDB,
  updateTraineeInDB,
  deleteTraineeFromDB,
  loginUserIntoDB,
  refreshTokenService,
  enrollTraineeInClass,
  unenrollTraineeFromClass,
};
