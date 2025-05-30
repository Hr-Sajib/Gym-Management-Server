"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const createTrainerIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
    const newTrainer = yield trainer_model_1.default.create({
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
        role: "TRAINER"
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
    const trainers = yield trainer_model_1.default.find();
    return trainers;
});
const getTrainerByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[getTrainerByIdFromDB] Querying trainer with id: ${id}`);
    // Query by _id directly
    const trainer = yield trainer_model_1.default.findById(id);
    if (!trainer) {
        console.log(`[getTrainerByIdFromDB] Trainer not found for id: ${id}`);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    console.log(`[getTrainerByIdFromDB] Trainer found: email=${trainer.email}, id=${trainer._id}`);
    return trainer;
});
const updateTrainerInDB = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[updateTrainerInDB] Updating trainer with id: ${id}, updates: ${JSON.stringify(updates)}`);
    // Validate that required fields aren't being modified incorrectly (e.g., role)
    if (updates.role && updates.role !== 'TRAINER') {
        console.log(`[updateTrainerInDB] Invalid role update attempt for id: ${id}`);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Role cannot be changed from TRAINER');
    }
    // Update the trainer
    const updatedTrainer = yield trainer_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true, select: { _id: 1, name: 1, email: 1, phone: 1, role: 1, assignedClasses: 1, conductedClasses: 1, createdAt: 1, updatedAt: 1 } });
    if (!updatedTrainer) {
        console.log(`[updateTrainerInDB] Trainer not found or update failed for id: ${id}`);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found or update failed');
    }
    console.log(`[updateTrainerInDB] Trainer updated successfully: email=${updatedTrainer.email}`);
    return updatedTrainer;
});
const deleteTrainerFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[deleteTrainerFromDB] Attempting to delete trainer with id: ${id}`);
    // Delete trainer by _id
    const result = yield trainer_model_1.default.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
        console.log(`[deleteTrainerFromDB] Trainer not found for id: ${id}`);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    console.log(`[deleteTrainerFromDB] Trainer deleted successfully for id: ${id}`);
    return;
});
// const assignClassToTrainerInDB = async (trainerId: string, classId: string) => {
//   // Check if trainer exists
//   const trainer = await Trainer.findOne({ id: trainerId }).select('id name email assignedClasses');
//   if (!trainer) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Trainer not found');
//   }
//   // Check if class exists
//   const classData = await Class.findOne({ id: classId });
//   if (!classData) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
//   }
//   // Check if class is already assigned to the trainer
//   const isAssigned = trainer.assignedClasses.includes(classId);
//   if (isAssigned) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Class already assigned to trainer');
//   }
//   // Assign class to trainer by updating the assignedClasses array
//   const updatedTrainer = await Trainer.findOneAndUpdate(
//     { id: trainerId },
//     { $push: { assignedClasses: classId } },
//     { new: true, runValidators: true, select: { id: 1, name: 1, email: 1, assignedClasses: 1, _id: 0 } }
//   );
//   if (!updatedTrainer) {
//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to assign class to trainer');
//   }
//   return {
//     ...updatedTrainer.toObject(), // Convert to plain object to avoid Mongoose document methods
//     assignedClasses: updatedTrainer.assignedClasses, // Already a string array
//   };
// };
const assignClassToTrainer = (trainerId, classId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[assignClassToTrainer] Starting assignment: trainerId=${trainerId}, classId=${classId}`);
    // Validate ID formats
    if (!/^[0-9a-fA-F]{24}$/.test(trainerId) || !/^[0-9a-fA-F]{24}$/.test(classId)) {
        console.log(`[assignClassToTrainer] Invalid ID format: trainerId=${trainerId}, classId=${classId}`);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid trainer or class ID format');
    }
    // Start a session for the transaction
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Fetch the trainer
        const trainer = yield trainer_model_1.default.findById(trainerId).session(session);
        if (!trainer) {
            console.log(`[assignClassToTrainer] Trainer not found: trainerId=${trainerId}`);
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
        }
        // Fetch the class
        const classData = yield class_model_1.default.findById(classId).session(session);
        if (!classData) {
            console.log(`[assignClassToTrainer] Class not found: classId=${classId}`);
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
        }
        // Check if the class is already assigned to another trainer
        if (classData.assignedTrainerId && classData.assignedTrainerId.toString() !== trainerId) {
            console.log(`[assignClassToTrainer] Class already assigned to another trainer: classId=${classId}`);
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Class is already assigned to another trainer');
        }
        // Check if the class is already in the trainer's assignedClasses
        if (trainer.assignedClasses.includes(classId)) {
            console.log(`[assignClassToTrainer] Class already assigned to this trainer: classId=${classId}`);
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Class is already assigned to this trainer');
        }
        // Update the trainer's assignedClasses
        trainer.assignedClasses.push(classId);
        const updatedTrainer = yield trainer.save({ session });
        // Update the class's assignedTrainerId
        classData.assignedTrainerId = trainerId ? new mongoose_1.Types.ObjectId(trainerId) : null; // Now type-safe
        const updatedClass = yield classData.save({ session });
        // Commit the transaction
        yield session.commitTransaction();
        console.log(`[assignClassToTrainer] Transaction committed: trainerId=${trainerId}, classId=${classId}`);
        return { updatedTrainer, updatedClass };
    }
    catch (error) {
        // Rollback the transaction on error
        yield session.abortTransaction();
        console.log(`[assignClassToTrainer] Transaction rolled back due to error: ${error.message}`);
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.trainerServices = {
    createTrainerIntoDB,
    getAllTrainersFromDB,
    getTrainerByIdFromDB,
    updateTrainerInDB,
    deleteTrainerFromDB,
    assignClassToTrainer,
};
