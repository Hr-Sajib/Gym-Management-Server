import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userServices } from "../../../app/modules/User/user.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import config from "../../../config";
import AppError from "../../errors/AppError";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;

    if(userData.role == "TRAINER" && req.user.role !== "ADMIN"){
        throw new AppError(httpStatus.UNAUTHORIZED, "Only admin can create Trainer account!");
    }
    // if(userData.role == "ADMIN"){
    //     throw new AppError(httpStatus.UNAUTHORIZED, "Admin accounts can only be created manually in DB!");
    // }


  const newUser = await userServices.createUserIntoDB(userData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: newUser,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userServices.getAllUsersFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userServices.getUserByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedUser = await userServices.updateUserInDB(id, updates);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userServices.deleteUserFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await userServices.loginUserIntoDB({email, password});
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production', // False for localhost
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax', // Lax for development
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
    }
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
      res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Refresh token is not gained!",
    });
  }

  const result = await userServices.refreshTokenService(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

export const userController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  refreshToken
};
