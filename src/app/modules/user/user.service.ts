import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; 
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
      // exclude password for security
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
      // exclude password
    },
  });
  return user;
};

const updateUserInDB = async (id: string, updates: Partial<IUser>) => {
  // We don't allow updating password here; separate function for that
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      role: updates.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
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

export const userServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserInDB,
  deleteUserFromDB,
};
