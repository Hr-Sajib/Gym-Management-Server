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
exports.classServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const class_model_1 = __importDefault(require("./class.model"));
const trainer_model_1 = __importDefault(require("../Trainer/trainer.model"));
const trainee_model_1 = __importDefault(require("../Trainee/trainee.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const timeValidation_1 = require("../../utils/timeValidation");
const createClassIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate 2-hour gap between startTime and endTime
    (0, timeValidation_1.validateTwoHourGap)(payload.startTime, payload.endTime, payload.date);
    // Validate assignedTrainerId if provided
    if (payload.assignedTrainerId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(payload.assignedTrainerId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainer ID: ${payload.assignedTrainerId}`);
        }
        const trainer = yield trainer_model_1.default.findById(payload.assignedTrainerId);
        if (!trainer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Trainer with ID ${payload.assignedTrainerId} not found`);
        }
    }
    // Validate enrolledTraineeIds if provided
    if (payload.enrolledTraineeIds && payload.enrolledTraineeIds.length > 0) {
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
    }
    const newClass = yield class_model_1.default.create(payload);
    if (!newClass) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create class');
    }
    return newClass.toJSON();
});
const getAllClassesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield class_model_1.default.find({}).lean();
});
const getClassByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${id}`);
    }
    const classData = yield class_model_1.default.findById(id).lean();
    if (!classData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    return classData;
});
const updateClassInDB = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${id}`);
    }
    // Validate 2-hour gap if both startTime and endTime are provided
    if (updates.startTime && updates.endTime && updates.date) {
        (0, timeValidation_1.validateTwoHourGap)(updates.startTime, updates.endTime, updates.date);
    }
    else if (updates.startTime || updates.endTime) {
        // Fetch existing class to get missing fields
        const existingClass = yield class_model_1.default.findById(id);
        if (!existingClass) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
        }
        const date = updates.date || existingClass.date;
        const startTime = updates.startTime || existingClass.startTime;
        const endTime = updates.endTime || existingClass.endTime;
        (0, timeValidation_1.validateTwoHourGap)(startTime, endTime, date);
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
    }
    // Validate enrolledTraineeIds if provided
    if (updates.enrolledTraineeIds && updates.enrolledTraineeIds.length > 0) {
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
    }
    const updatedClass = yield class_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!updatedClass) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    return updatedClass;
});
const deleteClassFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${id}`);
    }
    const result = yield class_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    return result;
});
const enrollTraineeInClass = (classId, traineeId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Validate classId
    if (!mongoose_1.default.Types.ObjectId.isValid(classId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class ID: ${classId}`);
    }
    // Validate traineeId
    if (!mongoose_1.default.Types.ObjectId.isValid(traineeId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainee ID: ${traineeId}`);
    }
    // Check if the class exists
    const targetClass = yield class_model_1.default.findById(classId);
    if (!targetClass) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    // Check if the trainee exists
    const trainee = yield trainee_model_1.default.findById(traineeId);
    if (!trainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    // Check if the trainee is already enrolled
    if ((_a = targetClass.enrolledTraineeIds) === null || _a === void 0 ? void 0 : _a.some((id) => id.equals(traineeId))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Trainee is already enrolled in this class');
    }
    // Enroll the trainee
    const updatedClass = yield class_model_1.default.findByIdAndUpdate(classId, { $push: { enrolledTraineeIds: traineeId } }, { new: true }).lean();
    if (!updatedClass) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to enroll trainee in class');
    }
    return updatedClass;
});
exports.classServices = {
    createClassIntoDB,
    getAllClassesFromDB,
    getClassByIdFromDB,
    updateClassInDB,
    deleteClassFromDB,
    enrollTraineeInClass,
};
