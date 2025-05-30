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
exports.traineeServices = exports.refreshTokenService = exports.loginUserIntoDB = void 0;
// src/app/modules/Trainee/trainee.service.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const auth_utils_1 = require("../../utils/auth.utils");
const config_1 = __importDefault(require("../../../config"));
const prisma = new client_1.PrismaClient();
const createTraineeIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
    const newUser = yield prisma.trainee.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
            phone: payload.phone,
        },
    });
    if (!newUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "No Trainee created!");
    }
    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };
});
const getAllTraineesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const trainees = yield prisma.trainee.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
        },
    });
    return trainees;
});
const getTraineeByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.trainee.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
        },
    });
    return user;
});
const updateTraineeInDB = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    let hashedPassword = undefined;
    // If password is being updated, hash it
    if (updates.password) {
        const saltRounds = 10;
        hashedPassword = yield bcrypt_1.default.hash(updates.password, saltRounds);
    }
    const updatedTrainee = yield prisma.trainee.update({
        where: { id },
        data: {
            name: updates.name,
            email: updates.email,
            phone: updates.phone,
            password: hashedPassword, // if undefined, Prisma skips update
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            password: true, // Return hashed password (never plaintext)
        },
    });
    return updatedTrainee;
});
const deleteTraineeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.trainee.delete({
        where: { id },
    });
    return;
});
const loginUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = payload;
    // Query Trainee table
    let user = yield prisma.trainee.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            // phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    let role = 'TRAINEE';
    // If not found, query Trainer table
    if (!user) {
        user = yield prisma.trainer.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (user) {
            user = Object.assign(Object.assign({}, user), { phone: null }); // Add phone: null for type compatibility
        }
        role = 'TRAINER';
    }
    if (!user) {
        throw new AppError_1.default(404, 'User not found', 'No user found with the provided email');
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(401, 'Unauthorized access', 'Invalid password');
    }
    const jwtPayload = {
        userEmail: user.email,
        userPhone: (_a = user.phone) !== null && _a !== void 0 ? _a : null,
        role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
exports.loginUserIntoDB = loginUserIntoDB;
const refreshTokenService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Verify the refresh token
    let decoded;
    try {
        decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    }
    catch (error) {
        throw new AppError_1.default(401, 'Unauthorized access', 'Invalid refresh token');
    }
    const { userEmail } = decoded;
    // Check if user exists in Trainee table
    let user = yield prisma.trainee.findUnique({
        where: { email: userEmail },
        select: {
            id: true,
            name: true,
            email: true,
            password: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    let role = 'TRAINEE';
    // If not found, check Trainer table
    if (!user) {
        user = yield prisma.trainer.findUnique({
            where: { email: userEmail },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (user) {
            user = Object.assign(Object.assign({}, user), { phone: null }); // Add phone: null for type compatibility
        }
        role = 'TRAINER';
    }
    if (!user) {
        throw new AppError_1.default(404, 'User not found', 'No user found with the provided email');
    }
    // Assume admins are in Trainer table with specific logic
    if (user.email === 'admin@example.com') {
        role = 'ADMIN';
    }
    // Prepare payload for new access token
    const jwtPayload = {
        userId: user.id,
        userEmail: user.email,
        userPhone: (_a = user.phone) !== null && _a !== void 0 ? _a : null,
        role,
    };
    // Generate new access token
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return { accessToken };
});
exports.refreshTokenService = refreshTokenService;
exports.traineeServices = {
    createTraineeIntoDB,
    getAllTraineesFromDB,
    getTraineeByIdFromDB,
    updateTraineeInDB,
    deleteTraineeFromDB,
    loginUserIntoDB: exports.loginUserIntoDB,
    refreshTokenService: exports.refreshTokenService
};
