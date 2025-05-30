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
exports.classServices = void 0;
// src/modules/class/class.service.ts
const mongoose_1 = __importStar(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const class_model_1 = __importDefault(require("./class.model"));
const trainer_model_1 = __importDefault(require("../Trainer/trainer.model"));
const trainee_model_1 = __importDefault(require("../Trainee/trainee.model"));
const timeValidation_1 = require("../../utils/timeValidation");
// Helper function to check the number of classes on a given date
const checkDailyClassLimit = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const classCount = yield class_model_1.default.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (classCount >= 5) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Maximum 5 classes per day allowed');
    }
});
// Helper function to check if a trainee has a conflicting class
const checkTraineeTimeConflict = (traineeId, classData) => __awaiter(void 0, void 0, void 0, function* () {
    const trainee = yield trainee_model_1.default.findById(traineeId);
    if (!trainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    // Fetch the enrolled classes manually
    const enrolledClasses = yield class_model_1.default.find({
        _id: { $in: trainee.enrolledClasses },
    }).select('date startTime endTime').lean();
    const newClassStart = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.startTime}:00`);
    const newClassEnd = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.endTime}:00`);
    for (const enrolledClass of enrolledClasses) {
        if (enrolledClass.date.toISOString().split('T')[0] !== classData.date.toISOString().split('T')[0]) {
            continue;
        }
        const enrolledStart = new Date(`${enrolledClass.date.toISOString().split('T')[0]}T${enrolledClass.startTime}:00`);
        const enrolledEnd = new Date(`${enrolledClass.date.toISOString().split('T')[0]}T${enrolledClass.endTime}:00`);
        if ((newClassStart >= enrolledStart && newClassStart < enrolledEnd) ||
            (newClassEnd > enrolledStart && newClassEnd <= enrolledEnd) ||
            (newClassStart <= enrolledStart && newClassEnd >= enrolledEnd)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Trainee already has a class scheduled in this time slot');
        }
    }
});
const createClassIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[createClassIntoDB] Creating class: ${JSON.stringify(payload)}`);
    // Validate 2-hour gap between startTime and endTime
    (0, timeValidation_1.validateTwoHourGap)(payload.startTime, payload.endTime, payload.date);
    // Check daily class limit (max 5 classes per day)
    yield checkDailyClassLimit(payload.date);
    // Validate assignedTrainerId if provided
    if (payload.assignedTrainerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(payload.assignedTrainerId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainer ID: ${payload.assignedTrainerId}`);
        }
        const trainer = yield trainer_model_1.default.findById(payload.assignedTrainerId);
        if (!trainer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Trainer with ID ${payload.assignedTrainerId} not found`);
        }
        // Update trainer's assignedClasses
        yield trainer_model_1.default.findByIdAndUpdate(payload.assignedTrainerId, { $addToSet: { assignedClasses: new mongoose_1.Types.ObjectId(payload._id) } }, { new: true });
    }
    // Validate enrolledTraineeIds if provided
    if (payload.enrolledTraineeIds && payload.enrolledTraineeIds.length > 0) {
        // Check trainee limit
        if (payload.enrolledTraineeIds.length > 10) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Maximum 10 trainees allowed per class');
        }
        const invalidIds = payload.enrolledTraineeIds.filter((id) => !mongoose_1.default.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainee IDs: ${invalidIds.join(', ')}`);
        }
        const trainees = yield trainee_model_1.default.find({ _id: { $in: payload.enrolledTraineeIds } });
        if (trainees.length !== payload.enrolledTraineeIds.length) {
            const foundIds = trainees.map((t) => t._id.toString());
            const missingIds = payload.enrolledTraineeIds.filter((id) => !foundIds.includes(id.toString()));
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Trainees with IDs ${missingIds.join(', ')} not found`);
        }
        // Check for time conflicts for each trainee
        for (const traineeId of payload.enrolledTraineeIds) {
            yield checkTraineeTimeConflict(traineeId.toString(), payload);
        }
        // Update trainees' enrolledClasses
        yield trainee_model_1.default.updateMany({ _id: { $in: payload.enrolledTraineeIds } }, { $addToSet: { enrolledClasses: new mongoose_1.Types.ObjectId(payload._id) } });
    }
    const newClass = yield class_model_1.default.create(payload);
    if (!newClass) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create class');
    }
    console.log(`[createClassIntoDB] Class created successfully: ${newClass._id}`);
    return newClass.toJSON();
});
const getAllClassesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const classes = yield class_model_1.default.find({})
        .populate('assignedTrainerId', 'name email')
        .populate('enrolledTraineeIds', 'name email')
        .lean();
    return classes;
});
const getClassByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${id}`);
    }
    const classData = yield class_model_1.default.findById(id)
        .populate('assignedTrainerId', 'name email')
        .populate('enrolledTraineeIds', 'name email')
        .lean();
    if (!classData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    return classData;
});
const updateClassInDB = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[updateClassInDB] Updating class ${id} with: ${JSON.stringify(updates)}`);
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${id}`);
    }
    const existingClass = yield class_model_1.default.findById(id);
    if (!existingClass) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    // Validate 2-hour gap if both startTime and endTime are provided
    if (updates.startTime && updates.endTime && updates.date) {
        (0, timeValidation_1.validateTwoHourGap)(updates.startTime, updates.endTime, updates.date);
    }
    else if (updates.startTime || updates.endTime || updates.date) {
        const date = updates.date || existingClass.date;
        const startTime = updates.startTime || existingClass.startTime;
        const endTime = updates.endTime || existingClass.endTime;
        (0, timeValidation_1.validateTwoHourGap)(startTime, endTime, date);
    }
    // If date is updated, recheck daily class limit (exclude current class)
    if (updates.date && updates.date.getTime() !== existingClass.date.getTime()) {
        yield checkDailyClassLimit(updates.date);
    }
    // Validate assignedTrainerId if provided
    if (updates.assignedTrainerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(updates.assignedTrainerId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainer ID: ${updates.assignedTrainerId}`);
        }
        const trainer = yield trainer_model_1.default.findById(updates.assignedTrainerId);
        if (!trainer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Trainer with ID ${updates.assignedTrainerId} not found`);
        }
        // Remove class from previous trainer's assignedClasses
        if (existingClass.assignedTrainerId && existingClass.assignedTrainerId.toString() !== updates.assignedTrainerId.toString()) {
            yield trainer_model_1.default.findByIdAndUpdate(existingClass.assignedTrainerId, { $pull: { assignedClasses: id } }, { new: true });
        }
        // Add class to new trainer's assignedClasses
        yield trainer_model_1.default.findByIdAndUpdate(updates.assignedTrainerId, { $addToSet: { assignedClasses: id } }, { new: true });
    }
    // Validate enrolledTraineeIds if provided
    if (updates.enrolledTraineeIds) {
        // Check trainee limit
        if (updates.enrolledTraineeIds.length > 10) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Maximum 10 trainees allowed per class');
        }
        const invalidIds = updates.enrolledTraineeIds.filter((id) => !mongoose_1.default.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainee IDs: ${invalidIds.join(', ')}`);
        }
        const trainees = yield trainee_model_1.default.find({ _id: { $in: updates.enrolledTraineeIds } });
        if (trainees.length !== updates.enrolledTraineeIds.length) {
            const foundIds = trainees.map((t) => t._id.toString());
            const missingIds = updates.enrolledTraineeIds.filter((id) => !foundIds.includes(id.toString()));
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Trainees with IDs ${missingIds.join(', ')} not found`);
        }
        // Check for time conflicts for new trainees
        const newTrainees = updates.enrolledTraineeIds.filter((id) => !existingClass.enrolledTraineeIds.some((existingId) => existingId.equals(id)));
        for (const traineeId of newTrainees) {
            yield checkTraineeTimeConflict(traineeId.toString(), Object.assign(Object.assign({}, existingClass), updates));
        }
        // Update trainees' enrolledClasses
        const removedTrainees = existingClass.enrolledTraineeIds.filter((id) => !updates.enrolledTraineeIds.some((newId) => newId.equals(id)));
        yield trainee_model_1.default.updateMany({ _id: { $in: removedTrainees } }, { $pull: { enrolledClasses: id } });
        yield trainee_model_1.default.updateMany({ _id: { $in: updates.enrolledTraineeIds } }, { $addToSet: { enrolledClasses: id } });
    }
    const updatedClass = yield class_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true })
        .populate('assignedTrainerId', 'name email')
        .populate('enrolledTraineeIds', 'name email')
        .lean();
    if (!updatedClass) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    console.log(`[updateClassInDB] Class updated successfully: ${id}`);
    return updatedClass;
});
const deleteClassFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[deleteClassFromDB] Deleting class: ${id}`);
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${id}`);
    }
    const classData = yield class_model_1.default.findById(id);
    if (!classData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    // Remove class from trainer's assignedClasses or conductedClasses
    if (classData.assignedTrainerId) {
        yield trainer_model_1.default.findByIdAndUpdate(classData.assignedTrainerId, {
            $pull: {
                assignedClasses: id,
                conductedClasses: id,
            },
        }, { new: true });
    }
    // Remove class from trainees' enrolledClasses
    if (classData.enrolledTraineeIds && classData.enrolledTraineeIds.length > 0) {
        yield trainee_model_1.default.updateMany({ _id: { $in: classData.enrolledTraineeIds } }, { $pull: { enrolledClasses: id } });
    }
    const result = yield class_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    console.log(`[deleteClassFromDB] Class deleted successfully: ${id}`);
    return result;
});
exports.classServices = {
    createClassIntoDB,
    getAllClassesFromDB,
    getClassByIdFromDB,
    updateClassInDB,
    deleteClassFromDB,
};
