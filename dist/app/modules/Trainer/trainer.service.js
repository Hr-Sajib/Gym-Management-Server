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
exports.trainerServices = void 0;
// src/app/modules/Trainer/trainer.service.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const trainer_model_1 = __importDefault(require("./trainer.model"));
const class_model_1 = __importDefault(require("../Class/class.model"));
const createTrainerIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
    const newTrainer = yield trainer_model_1.default.create({
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
        // role is handled by the schema default ("TRAINER")
    });
    if (!newTrainer) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create trainer');
    }
    return {
        id: newTrainer.id,
        name: newTrainer.name,
        email: newTrainer.email,
        phone: newTrainer.phone,
        password: newTrainer.password, // Removed in controller response
        createdAt: newTrainer.createdAt,
        updatedAt: newTrainer.updatedAt,
        assignedClasses: newTrainer.assignedClasses,
        conductedClasses: newTrainer.conductedClasses,
    };
});
const getAllTrainersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const trainers = yield trainer_model_1.default.find({}, { id: 1, name: 1, email: 1, _id: 0 });
    return trainers;
});
const getTrainerByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const trainer = yield trainer_model_1.default.findOne({ id }, { id: 1, name: 1, email: 1, _id: 0 });
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
    const updateData = {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
    };
    if (hashedPassword) {
        updateData.password = hashedPassword;
    }
    const updatedTrainer = yield trainer_model_1.default.findOneAndUpdate({ id }, { $set: updateData }, { new: true, runValidators: true, fields: { id: 1, name: 1, email: 1, _id: 0 } });
    if (!updatedTrainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    return updatedTrainer;
});
const deleteTrainerFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield trainer_model_1.default.deleteOne({ id });
    if (result.deletedCount === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    return;
});
const assignClassToTrainerInDB = (trainerId, classId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if trainer exists
    const trainer = yield trainer_model_1.default.findOne({ id: trainerId }).select('id name email assignedClasses');
    if (!trainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    // Check if class exists
    const classData = yield class_model_1.default.findOne({ id: classId });
    if (!classData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    // Check if class is already assigned to the trainer
    const isAssigned = trainer.assignedClasses.includes(classId);
    if (isAssigned) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Class already assigned to trainer');
    }
    // Assign class to trainer by updating the assignedClasses array
    const updatedTrainer = yield trainer_model_1.default.findOneAndUpdate({ id: trainerId }, { $push: { assignedClasses: classId } }, { new: true, runValidators: true, select: { id: 1, name: 1, email: 1, assignedClasses: 1, _id: 0 } });
    if (!updatedTrainer) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to assign class to trainer');
    }
    return Object.assign(Object.assign({}, updatedTrainer.toObject()), { assignedClasses: updatedTrainer.assignedClasses });
});
exports.trainerServices = {
    createTrainerIntoDB,
    getAllTrainersFromDB,
    getTrainerByIdFromDB,
    updateTrainerInDB,
    deleteTrainerFromDB,
    assignClassToTrainerInDB,
};
