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
exports.classController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const class_service_1 = require("./class.service");
const createClass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const classData = req.body;
    // Restrict to ADMIN
    if (!['ADMIN'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.table)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admins can create classes!');
    }
    const newClass = yield class_service_1.classServices.createClassIntoDB(classData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Class created successfully',
        data: newClass,
    });
}));
const getAllClasses = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Restrict to ADMIN
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.table) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can view all classes!');
    }
    const classes = yield class_service_1.classServices.getAllClassesFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Classes retrieved successfully',
        data: classes,
    });
}));
const getClassById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params;
    // Restrict to ADMIN or TRAINER
    if (!['ADMIN', 'TRAINER'].includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.table)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admins or trainers can view class details!');
    }
    const classData = yield class_service_1.classServices.getClassByIdFromDB(id);
    if (!classData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    // If the user is a TRAINER, ensure they are assigned to the class
    if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.table) === 'TRAINER') {
        // Ensure assignedTrainerId is populated and compare with userId from JWT
        const assignedTrainerId = typeof classData.assignedTrainerId === 'object'
            ? classData.assignedTrainerId._id.toString()
            : (_c = classData.assignedTrainerId) === null || _c === void 0 ? void 0 : _c.toString();
        if (assignedTrainerId !== req.user.userId) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not assigned to this class!');
        }
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class retrieved successfully',
        data: classData,
    });
}));
const updateClass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const updates = req.body;
    // Restrict to ADMIN
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.table) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can update classes!');
    }
    const targetClass = yield class_service_1.classServices.getClassByIdFromDB(id);
    if (!targetClass) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    const updatedClass = yield class_service_1.classServices.updateClassInDB(id, updates);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class updated successfully',
        data: updatedClass,
    });
}));
const deleteClass = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    // Restrict to ADMIN
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.table) !== 'ADMIN') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Only admin can delete classes!');
    }
    const targetClass = yield class_service_1.classServices.getClassByIdFromDB(id);
    if (!targetClass) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Class not found');
    }
    yield class_service_1.classServices.deleteClassFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Class deleted successfully',
        data: null,
    });
}));
exports.classController = {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass
};
