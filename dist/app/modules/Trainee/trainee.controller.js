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
        data: {
            id: newTrainee.id,
            name: newTrainee.name,
            email: newTrainee.email,
            phone: newTrainee.phone,
            createdAt: newTrainee.createdAt,
            updatedAt: newTrainee.updatedAt,
        },
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
    const { id } = req.params;
    const updates = req.body;
    // Get the logged-in user's email and role
    const loggedInUserEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
    const loggedInUserRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    console.log("in cont: ", loggedInUserEmail, loggedInUserRole);
    // Restrict to TRAINEE or ADMIN
    if (loggedInUserRole !== 'TRAINEE' && loggedInUserRole !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only trainees or admins can update trainee info!');
    }
    // Fetch the target trainee
    const targetTrainee = yield trainee_service_1.traineeServices.getTraineeByIdFromDB(id);
    if (!targetTrainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    // Restrict non-admins from updating other users
    if (loggedInUserRole !== 'ADMIN' && targetTrainee.email !== loggedInUserEmail) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You can't update another user's information!");
    }
    // Prevent role updates
    if (updates.role) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Role cannot be updated!');
    }
    const updatedTrainee = yield trainee_service_1.traineeServices.updateTraineeInDB(id, updates);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainee updated successfully',
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
exports.traineeController = {
    createTrainee,
    getAllTrainees,
    getTraineeById,
    updateTrainee,
    deleteTrainee,
    loginUser,
    refreshToken,
};
