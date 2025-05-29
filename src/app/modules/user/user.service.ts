import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; 
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { createToken, verifyToken } from "../../utils/auth.utils";
import config from "../../../config";
import { IUser } from "./user.interface";


const prisma = new PrismaClient();

const createUserIntoDB = async (payload: IUser) => {

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      phone: payload.phone,
    },
  });

  if (!newUser) {
    throw new AppError(404, "No users created!");
  }

  return newUser;
};

const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
    },
  });
  return users;
};

const getUserByIdFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
    },
  });
  return user;
};

const updateUserInDB = async (id: string, updates: Partial<IUser>) => {
  let hashedPassword: string | undefined = undefined;

  // If password is being updated, hash it
  if (updates.password) {
    const saltRounds = 10;
    hashedPassword = await bcrypt.hash(updates.password, saltRounds);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      role: updates.role,
      password: hashedPassword, // if undefined, Prisma skips update
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      password: true, // Return hashed password (never plaintext)
    },
  });

  return updatedUser;
};

const deleteUserFromDB = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });
  return;
};

// Helper to fetch user by email or phone
const findUserByEmailOrPhone = async (email?: string, phone?: string) => {
  if (email) {
    return await prisma.user.findUnique({ where: { email } });
  }
  if (phone) {
    return await prisma.user.findUnique({ where: { phone } });
  }
  return null;
};

const loginUserIntoDB = async (payload: {email: string, password: string}) => {
  const { email, password } = payload;

  const user = await findUserByEmailOrPhone(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  const jwtPayload = {
    userEmail: user.email,
    userPhone: user.phone,
    role: user.role,
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

const refreshTokenService = async (token: string) => {
  // Verify the refresh token
  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string);
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const { userEmail } = decoded as { userEmail: string; role: string };

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Prepare payload for new access token
  const jwtPayload = {
    userEmail: user.email,
    userPhone: user.phone,
    role: user.role,
  };

  // Generate new access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

export const userServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserInDB,
  deleteUserFromDB,
  loginUserIntoDB, 
  refreshTokenService
};
