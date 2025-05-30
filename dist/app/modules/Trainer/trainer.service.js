"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.trainerServices = void 0;
// src/app/modules/Trainer/trainer.service.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma = new client_1.PrismaClient();
const createTrainerIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
    const newTrainer = yield prisma.trainer.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
        },
    });
    return {
        id: newTrainer.id,
        name: newTrainer.name,
        email: newTrainer.email,
        phone: newTrainer.phone,
        password: newTrainer.password, // Removed in controller response
        createdAt: newTrainer.createdAt,
        updatedAt: newTrainer.updatedAt,
        assignedClasses: [], // Already string[]
        conductedClasses: [], // Already string[]
    };
});
const getAllTrainersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const trainers = yield prisma.trainer.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    return trainers;
});
const getTrainerByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const trainer = yield prisma.trainer.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    if (!trainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    return trainer;
});
const updateTrainerInDB = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    let hashedPassword;
    if (updates.password) {
        hashedPassword = yield bcrypt_1.default.hash(updates.password, 10);
    }
    const updatedTrainer = yield prisma.trainer.update({
        where: { id },
        data: {
            name: updates.name,
            email: updates.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    return updatedTrainer;
});
const deleteTrainerFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.trainer.delete({
        where: { id },
    });
});
const assignClassToTrainerInDB = (trainerId, classId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if trainer exists
    const trainer = yield prisma.trainer.findUnique({
        where: { id: trainerId },
        include: {
            assignedClasses: {
                select: { id: true }, // Fetch only class IDs
            },
        },
    });
    if (!trainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    // Check if class exists
    const classData = yield prisma.class.findUnique({
        where: { id: classId },
    });
    if (!classData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    // Map assignedClasses to string array of IDs
    const assignedClassIds = trainer.assignedClasses.map((cls) => cls.id);
    // Check if class is already assigned to the trainer
    const isAssigned = assignedClassIds.includes(classId);
    if (isAssigned) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Class already assigned to trainer');
    }
    // Assign class to trainer
    const updatedTrainer = yield prisma.trainer.update({
        where: { id: trainerId },
        data: {
            assignedClasses: {
                connect: { id: classId }, // Use connect to link the class
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            assignedClasses: {
                select: { id: true }, // Return only class IDs
            },
        },
    });
    // Transform assignedClasses to string[] for response
    return Object.assign(Object.assign({}, updatedTrainer), { assignedClasses: updatedTrainer.assignedClasses.map((cls) => cls.id) });
});
exports.trainerServices = {
    createTrainerIntoDB,
    getAllTrainersFromDB,
    getTrainerByIdFromDB,
    updateTrainerInDB,
    deleteTrainerFromDB,
    assignClassToTrainerInDB
};
