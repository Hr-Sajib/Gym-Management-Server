"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraineeRoutes = void 0;
// src/modules/trainee/routes/trainee.routes.ts
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const trainee_validation_1 = require("../Trainee/trainee.validation");
const trainee_controller_1 = require("./trainee.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// Register a new trainee
router.post('/register', (0, validateRequest_1.default)(trainee_validation_1.createTraineeZodSchema), trainee_controller_1.traineeController.createTrainee);
// Get all trainees
router.get('/', (0, auth_1.default)('ADMIN'), trainee_controller_1.traineeController.getAllTrainees);
// Get a single trainee by ID
router.get('/:id', (0, auth_1.default)('ADMIN', 'TRAINEE'), // Allow self-access or admin
trainee_controller_1.traineeController.getTraineeById);
// Update a trainee by ID
router.patch('/:id', (0, validateRequest_1.default)(trainee_validation_1.updateTraineeZodSchema), (0, auth_1.default)('ADMIN', 'TRAINEE'), // Allow self-update or admin
trainee_controller_1.traineeController.updateTrainee);
// Delete a trainee by ID
router.delete('/:id', (0, auth_1.default)('ADMIN'), // Only admins can delete
trainee_controller_1.traineeController.deleteTrainee);
// Enroll in a class
router.post('/enroll-in-class/:classId', (0, validateRequest_1.default)(trainee_validation_1.enrollTraineeZodSchema), (0, auth_1.default)('ADMIN', 'TRAINEE'), // Only admins or trainees (self-enrollment) can enroll
trainee_controller_1.traineeController.enrollTraineeInClass);
// Cancel enrollment from a class
router.post('/cancel-enroll/:classId', (0, validateRequest_1.default)(trainee_validation_1.unenrollTraineeZodSchema), (0, auth_1.default)('ADMIN', 'TRAINEE'), // Only admins or trainees (self-unenrollment) can unenroll
trainee_controller_1.traineeController.unenrollTraineeFromClass);
exports.TraineeRoutes = router;
