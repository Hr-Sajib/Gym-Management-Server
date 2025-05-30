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
exports.traineeServices = void 0;
// src/app/modules/Trainee/trainee.service.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_utils_1 = require("../../utils/auth.utils");
const config_1 = __importDefault(require("../../../config"));
const class_model_1 = __importDefault(require("../Class/class.model"));
const trainee_model_1 = __importDefault(require("./trainee.model"));
const trainer_model_1 = __importDefault(require("../Trainer/trainer.model"));
// Helper function to check if a trainee has a conflicting class
const checkTraineeTimeConflict = (traineeId, classData) => __awaiter(void 0, void 0, void 0, function* () {
    const trainee = yield trainee_model_1.default.findById(traineeId).populate({
        path: 'enrolledClasses',
        select: 'date startTime endTime',
    });
    if (!trainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    // Ensure enrolledClasses is populated and cast to IClass[]
    const enrolledClasses = trainee.enrolledClasses;
    if (!enrolledClasses || enrolledClasses.length === 0) {
        return; // No conflicts if there are no enrolled classes
    }
    const newClassStart = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.startTime}:00`);
    const newClassEnd = new Date(`${classData.date.toISOString().split('T')[0]}T${classData.endTime}:00`);
    for (const enrolledClass of enrolledClasses) {
        if (enrolledClass.date.toISOString().split('T')[0] !== classData.date.toISOString().split('T')[0]) {
            continue; // Skip classes on different dates
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
const createTraineeIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate enrolledClasses if provided
    if (payload.enrolledClasses && payload.enrolledClasses.length > 0) {
        const invalidIds = payload.enrolledClasses.filter((id) => !mongoose_1.default.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class IDs: ${invalidIds.join(', ')}`);
        }
        const classes = yield class_model_1.default.find({ _id: { $in: payload.enrolledClasses } });
        if (classes.length !== payload.enrolledClasses.length) {
            const foundIds = classes.map((c) => c._id.toString());
            const missingIds = payload.enrolledClasses.filter((id) => !foundIds.includes(id.toString()));
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Classes with IDs ${missingIds.join(', ')} not found`);
        }
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
    const newTrainee = yield trainee_model_1.default.create(Object.assign(Object.assign({}, payload), { password: hashedPassword, role: "TRAINEE" }));
    if (!newTrainee) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create trainee');
    }
    return newTrainee.toJSON();
});
const getAllTraineesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield trainee_model_1.default.find({}).select('id name email phone enrolledClasses').lean();
});
const getTraineeByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainee ID: ${id}`);
    }
    const trainee = yield trainee_model_1.default.findById(id).select('id name email phone enrolledClasses').lean();
    if (!trainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    return trainee;
});
const updateTraineeInDB = (userEmail, updates) => __awaiter(void 0, void 0, void 0, function* () {
    // Find trainee by email
    const trainee = yield trainee_model_1.default.findOne({ email: userEmail }).select('id name email phone enrolledClasses password role createdAt updatedAt');
    // Check if trainee exists and email matches
    if (!trainee || trainee.email !== userEmail) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    // Validate enrolledClasses if provided
    if (updates.enrolledClasses && updates.enrolledClasses.length > 0) {
        const invalidIds = updates.enrolledClasses.filter((id) => !mongoose_1.default.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Class IDs: ${invalidIds.join(', ')}`);
        }
        const classes = yield class_model_1.default.find({ _id: { $in: updates.enrolledClasses } });
        if (classes.length !== updates.enrolledClasses.length) {
            const foundIds = classes.map((c) => c._id.toString());
            const missingIds = updates.enrolledClasses.filter((id) => !foundIds.includes(id.toString()));
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Classes with IDs ${missingIds.join(', ')} not found`);
        }
    }
    let hashedPassword;
    if (updates.password) {
        hashedPassword = yield bcrypt_1.default.hash(updates.password, 10);
    }
    // Update the trainee
    const updatedTrainee = yield trainee_model_1.default.findOneAndUpdate({ email: userEmail }, {
        $set: Object.assign(Object.assign({}, updates), { password: hashedPassword || undefined }),
    }, { new: true }).select('id name email phone enrolledClasses createdAt updatedAt');
    if (!updatedTrainee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    return updatedTrainee.toJSON();
});
const deleteTraineeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid Trainee ID: ${id}`);
    }
    const result = yield trainee_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
    }
    return result;
});
const loginUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = payload;
    // Query Trainee collection
    let user = yield trainee_model_1.default.findOne({ email }).select('id name email password phone role createdAt updatedAt');
    // If not found, query Trainer collection
    if (!user) {
        user = yield trainer_model_1.default.findOne({ email }).select('id name email password role createdAt updatedAt');
    }
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid password');
    }
    const jwtPayload = {
        userEmail: user.email,
        userPhone: (_a = user.phone) !== null && _a !== void 0 ? _a : null,
        role: user.role, // Use role from user document
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return { accessToken, refreshToken };
});
const refreshTokenService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let decoded;
    try {
        decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid refresh token');
    }
    const { userEmail } = decoded;
    // Check Trainee collection
    let user = yield trainee_model_1.default.findOne({ email: userEmail }).select('id name email password phone role createdAt updatedAt');
    // If not found, query Trainer collection
    if (!user) {
        user = yield trainer_model_1.default.findOne({ email: userEmail }).select('id name email password role createdAt updatedAt');
    }
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const jwtPayload = {
        userId: user._id,
        userEmail: user.email,
        userPhone: (_a = user.phone) !== null && _a !== void 0 ? _a : null,
        role: user.role, // Use role from user document
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return { accessToken };
});
const enrollTraineeInClass = (classId, traineeId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[enrollTraineeInClass] Enrolling trainee ${traineeId} in class ${classId}`);
    // Validate IDs
    if (!mongoose_1.default.Types.ObjectId.isValid(classId) || !mongoose_1.default.Types.ObjectId.isValid(traineeId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid class or trainee ID');
    }
    // Start a session for the transaction
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Check if the class exists
        const targetClass = yield class_model_1.default.findById(classId)
            .populate('enrolledTraineeIds', 'name email')
            .session(session);
        if (!targetClass) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
        }
        // Check trainee limit
        if (targetClass.enrolledTraineeIds.length >= 10) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Class schedule is full. Maximum 10 trainees allowed per schedule');
        }
        // Check if the trainee exists
        const trainee = yield trainee_model_1.default.findById(traineeId).session(session);
        if (!trainee) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
        }
        // Check if the trainee is already enrolled
        if (targetClass.enrolledTraineeIds.some((t) => t._id.toString() === traineeId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Trainee is already enrolled in this class');
        }
        // Check for time conflicts
        yield checkTraineeTimeConflict(traineeId, targetClass);
        // Update the Class to include the trainee
        targetClass.enrolledTraineeIds.push(new mongoose_1.default.Types.ObjectId(traineeId));
        const updatedClass = yield targetClass.save({ session });
        // Update the Trainee to include the class
        trainee.enrolledClasses.push(new mongoose_1.default.Types.ObjectId(classId));
        yield trainee.save({ session });
        // Commit the transaction
        yield session.commitTransaction();
        console.log(`[enrollTraineeInClass] Transaction committed: traineeId=${traineeId}, classId=${classId}`);
        // Re-fetch the updated class with populated fields for response
        const finalClass = yield class_model_1.default.findById(classId)
            .populate('assignedTrainerId', 'name email')
            .populate('enrolledTraineeIds', 'name email')
            .lean();
        return finalClass;
    }
    catch (error) {
        // Rollback the transaction on error
        yield session.abortTransaction();
        console.log(`[enrollTraineeInClass] Transaction rolled back due to error: ${error.message}`);
        throw error;
    }
    finally {
        session.endSession();
    }
});
const unenrollTraineeFromClass = (classId, traineeId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[unenrollTraineeFromClass] Unenrolling trainee ${traineeId} from class ${classId}`);
    // Validate IDs
    if (!mongoose_1.default.Types.ObjectId.isValid(classId) || !mongoose_1.default.Types.ObjectId.isValid(traineeId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid class or trainee ID');
    }
    // Start a session for the transaction
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Check if the class exists
        const targetClass = yield class_model_1.default.findById(classId)
            .populate('enrolledTraineeIds', 'name email')
            .session(session);
        if (!targetClass) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
        }
        // Check if the trainee exists
        const trainee = yield trainee_model_1.default.findById(traineeId).session(session);
        if (!trainee) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainee not found');
        }
        // Check if the trainee is enrolled
        if (!targetClass.enrolledTraineeIds.some((t) => t._id.toString() === traineeId)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Trainee is not enrolled in this class');
        }
        // Update the Class to remove the trainee
        targetClass.enrolledTraineeIds = targetClass.enrolledTraineeIds.filter((t) => t._id.toString() !== traineeId);
        const updatedClass = yield targetClass.save({ session });
        // Update the Trainee to remove the class
        trainee.enrolledClasses = trainee.enrolledClasses.filter((c) => c.toString() !== classId);
        yield trainee.save({ session });
        // Commit the transaction
        yield session.commitTransaction();
        console.log(`[unenrollTraineeFromClass] Transaction committed: traineeId=${traineeId}, classId=${classId}`);
        // Re-fetch the updated class with populated fields for response
        const finalClass = yield class_model_1.default.findById(classId)
            .populate('assignedTrainerId', 'name email')
            .populate('enrolledTraineeIds', 'name email')
            .lean();
        return finalClass;
    }
    catch (error) {
        // Rollback the transaction on error
        yield session.abortTransaction();
        console.log(`[unenrollTraineeFromClass] Transaction rolled back due to error: ${error.message}`);
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.traineeServices = {
    createTraineeIntoDB,
    getAllTraineesFromDB,
    getTraineeByIdFromDB,
    updateTraineeInDB,
    deleteTraineeFromDB,
    loginUserIntoDB,
    refreshTokenService,
    enrollTraineeInClass,
    unenrollTraineeFromClass,
};
