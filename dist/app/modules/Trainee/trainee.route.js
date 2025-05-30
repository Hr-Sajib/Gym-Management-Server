"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraineeRoutes = void 0;
// src/modules/trainee/routes/trainee.routes.ts
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const trainee_validation_1 = require("../Trainee/trainee.validation");
const trainee_controller_1 = require("./trainee.controller");
const router = express_1.default.Router();
// Create/register a new trainee
router.post('/register', (0, validateRequest_1.default)(trainee_validation_1.createTraineeZodSchema), trainee_controller_1.traineeController.createTrainee);
// Get all trainees
router.get('/', (0, auth_1.default)('ADMIN'), trainee_controller_1.traineeController.getAllTrainees);
// Get a single trainee by ID
router.get('/:id', (0, auth_1.default)('ADMIN', 'TRAINEE'), trainee_controller_1.traineeController.getTraineeById);
// Update a trainee by ID
router.patch('/:id', (0, auth_1.default)('ADMIN', 'TRAINEE'), (0, validateRequest_1.default)(trainee_validation_1.updateTraineeZodSchema), trainee_controller_1.traineeController.updateTrainee);
// Delete a trainee by ID
router.delete('/:id', (0, auth_1.default)('ADMIN'), trainee_controller_1.traineeController.deleteTrainee);
exports.TraineeRoutes = router;
