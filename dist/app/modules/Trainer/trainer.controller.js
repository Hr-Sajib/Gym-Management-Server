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
exports.trainerController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const trainer_service_1 = require("./trainer.service");
const createTrainer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trainerData = req.body;
    const newTrainer = yield trainer_service_1.trainerServices.createTrainerIntoDB(trainerData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Trainer created successfully',
        data: {
            id: newTrainer.id,
            name: newTrainer.name,
            email: newTrainer.email,
            createdAt: newTrainer.createdAt,
            updatedAt: newTrainer.updatedAt,
        },
    });
}));
const assignClass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { trainerId } = req.params;
    const { classId } = req.body;
    if (!classId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Class ID is required');
    }
    // Only ADMIN can assign classes
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can assign classes');
    }
    const updatedTrainer = yield trainer_service_1.trainerServices.assignClassToTrainerInDB(trainerId, classId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class assigned to trainer successfully',
        data: updatedTrainer,
    });
}));
const getAllTrainers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can view all trainers!');
    }
    const trainers = yield trainer_service_1.trainerServices.getAllTrainersFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainers retrieved successfully',
        data: trainers,
    });
}));
const getTrainerById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const targetTrainer = yield trainer_service_1.trainerServices.getTrainerByIdFromDB(id);
    if (!targetTrainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail) !== 'admin@gym.com' && targetTrainer.email !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userEmail)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You can't view another user's information!");
    }
    const trainer = yield trainer_service_1.trainerServices.getTrainerByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer retrieved successfully',
        data: trainer,
    });
}));
const updateTrainer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const updates = req.body;
    const loggedInUserEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userEmail;
    const loggedInUserTable = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (loggedInUserTable !== 'TRAINER' && loggedInUserTable !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only trainers or admins can update trainer info!');
    }
    const targetTrainer = yield trainer_service_1.trainerServices.getTrainerByIdFromDB(id);
    if (!targetTrainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    if (loggedInUserTable !== 'ADMIN' && targetTrainer.email !== loggedInUserEmail) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You can't update another user's information!");
    }
    const updatedTrainer = yield trainer_service_1.trainerServices.updateTrainerInDB(id, updates);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer updated successfully',
        data: {
            id: updatedTrainer.id,
            name: updatedTrainer.name,
            email: updatedTrainer.email,
        },
    });
}));
const deleteTrainer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can delete trainers!');
    }
    const targetTrainer = yield trainer_service_1.trainerServices.getTrainerByIdFromDB(id);
    if (!targetTrainer) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Trainer not found');
    }
    yield trainer_service_1.trainerServices.deleteTrainerFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Trainer deleted successfully',
        data: null,
    });
}));
exports.trainerController = {
    createTrainer,
    getAllTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
    assignClass
};
