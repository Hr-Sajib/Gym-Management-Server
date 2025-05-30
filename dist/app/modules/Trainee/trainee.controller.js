"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traineeController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const trainee_service_1 = require("./trainee.service");
const createTrainee = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const traineeData = req.body;
    const newTrainee = yield trainee_service_1.traineeServices.createTraineeIntoDB(traineeData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Trainee created successfully',
        data: newTrainee,
    });
}));
const getAllTrainees = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Restrict to ADMIN
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can view all trainees!');
    }
    const trainees = yield trainee_service_1.traineeServices.getAllTraineesFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainees retrieved successfully',
        data: trainees,
    });
}));
const getTraineeById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    // Restrict to ADMIN or the trainee themselves
    const targetTrainee = yield trainee_service_1.traineeServices.getTraineeByIdFromDB(id);
    if (!targetTrainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' && targetTrainee.email !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You can't view another user's information!");
    }
    const trainee = yield trainee_service_1.traineeServices.getTraineeByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainee retrieved successfully',
        data: trainee,
    });
}));
const updateTrainee = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const updates = req.body;
    const loggedInUserEmail = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || '';
    const loggedInUserRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    // Restrict to TRAINEE or ADMIN
    if (loggedInUserRole !== 'TRAINEE' && loggedInUserRole !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only trainees or admins can update trainee info!');
    }
    // Prevent role updates
    if (updates.role) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Role cannot be updated!');
    }
    const updatedTrainee = yield trainee_service_1.traineeServices.updateTraineeInDB(loggedInUserEmail, updates);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainee updated successfully by himself',
        data: {
            id: updatedTrainee.id,
            name: updatedTrainee.name,
            email: updatedTrainee.email,
            phone: updatedTrainee.phone,
        },
    });
}));
const deleteTrainee = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    // Restrict to ADMIN
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can delete trainees!');
    }
    const targetTrainee = yield trainee_service_1.traineeServices.getTraineeByIdFromDB(id);
    if (!targetTrainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    yield trainee_service_1.traineeServices.deleteTraineeFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainee deleted successfully',
        data: null,
    });
}));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield trainee_service_1.traineeServices.loginUserIntoDB({ email, password });
    const { refreshToken, accessToken } = result;
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === 'production',
        sameSite: config_1.default.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User logged in successfully',
        data: { accessToken },
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!token) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Refresh token not provided');
    }
    const result = yield trainee_service_1.traineeServices.refreshTokenService(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Access token refreshed successfully',
        data: result,
    });
}));
const enrollTraineeInClass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { classId } = req.params;
    const { traineeId } = req.body;
    const loggedInUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    // Restrict to ADMIN or TRAINEE (self-enrollment)
    if (loggedInUserRole !== 'ADMIN' && loggedInUserRole !== 'TRAINEE') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admins or trainees can enroll in a class!');
    }
    if (loggedInUserRole === 'TRAINEE' && traineeId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Trainee can only enroll themselves!');
    }
    const updatedClass = yield trainee_service_1.traineeServices.enrollTraineeInClass(classId, traineeId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainee enrolled in class successfully',
        data: updatedClass,
    });
}));
const unenrollTraineeFromClass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { classId } = req.params;
    const { traineeId } = req.body;
    const loggedInUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    // Restrict to ADMIN or TRAINEE (self-unenrollment)
    if (loggedInUserRole !== 'ADMIN' && loggedInUserRole !== 'TRAINEE') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admins or trainees can unenroll from a class!');
    }
    if (loggedInUserRole === 'TRAINEE' && traineeId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Trainee can only unenroll themselves!');
    }
    const updatedClass = yield trainee_service_1.traineeServices.unenrollTraineeFromClass(classId, traineeId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainee unenrolled from class successfully',
        data: updatedClass,
    });
}));
exports.traineeController = {
    createTrainee,
    getAllTrainees,
    getTraineeById,
    updateTrainee,
    deleteTrainee,
    loginUser,
    refreshToken,
    enrollTraineeInClass,
    unenrollTraineeFromClass,
};
// // src/modules/trainee/controllers/trainee.controller.ts
// import { Request, Response } from 'express';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
// import httpStatus from 'http-status';
// import config from '../../../config';
// import AppError from '../../errors/AppError';
// import { traineeServices } from './trainee.service';
// const createTrainee = catchAsync(async (req: Request, res: Response) => {
//   const traineeData = req.body;
//   const newTrainee = await traineeServices.createTraineeIntoDB(traineeData);
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Trainee created successfully',
//     data: newTrainee,
//   });
// });
// const getAllTrainees = catchAsync(async (req: Request, res: Response) => {
//   // Restrict to ADMIN
//   if (req.user?.role !== 'ADMIN') {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can view all trainees!');
//   }
//   const trainees = await traineeServices.getAllTraineesFromDB();
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Trainees retrieved successfully',
//     data: trainees,
//   });
// });
// const getTraineeById = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   // Restrict to ADMIN or the trainee themselves
//   const targetTrainee = await traineeServices.getTraineeByIdFromDB(id);
//   if (!targetTrainee) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
//   }
//   if (req.user?.role !== 'ADMIN' && targetTrainee.email !== req.user?.userEmail) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "You can't view another user's information!");
//   }
//   const trainee = await traineeServices.getTraineeByIdFromDB(id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Trainee retrieved successfully',
//     data: trainee,
//   });
// });
// const updateTrainee = catchAsync(async (req: Request, res: Response) => {
//   const updates = req.body;
//   const loggedInUserEmail = req.user?.email || '';
//   const loggedInUserRole = req.user?.role;
//   // Restrict to TRAINEE or ADMIN
//   if (loggedInUserRole !== 'TRAINEE' && loggedInUserRole !== 'ADMIN') {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Only trainees or admins can update trainee info!');
//   }
//   // Prevent role updates
//   if (updates.role) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Role cannot be updated!');
//   }
//   const updatedTrainee = await traineeServices.updateTraineeInDB(loggedInUserEmail, updates);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Trainee updated successfully by himself',
//     data: {
//       id: updatedTrainee.id,
//       name: updatedTrainee.name,
//       email: updatedTrainee.email,
//       phone: updatedTrainee.phone,
//     },
//   });
// });
// const deleteTrainee = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   // Restrict to ADMIN
//   if (req.user?.role !== 'ADMIN') {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Only admin can delete trainees!');
//   }
//   const targetTrainee = await traineeServices.getTraineeByIdFromDB(id);
//   if (!targetTrainee) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Trainee not found');
//   }
//   await traineeServices.deleteTraineeFromDB(id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Trainee deleted successfully',
//     data: null,
//   });
// });
// const loginUser = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const result = await traineeServices.loginUserIntoDB({ email, password });
//   const { refreshToken, accessToken } = result;
//   res.cookie('refreshToken', refreshToken, {
//     httpOnly: true,
//     secure: config.NODE_ENV === 'production',
//     sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
//     maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
//   });
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User logged in successfully',
//     data: { accessToken },
//   });
// });
// const refreshToken = catchAsync(async (req: Request, res: Response) => {
//   const token = req.cookies?.refreshToken;
//   if (!token) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token not provided');
//   }
//   const result = await traineeServices.refreshTokenService(token);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Access token refreshed successfully',
//     data: result,
//   });
// });
// export const traineeController = {
//   createTrainee,
//   getAllTrainees,
//   getTraineeById,
//   updateTrainee,
//   deleteTrainee,
//   loginUser,
//   refreshToken,
// };
