"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerRoutes = void 0;
// src/modules/trainer/routes/trainer.routes.ts
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
// import auth from '../../middlewares/auth';
const trainer_validation_1 = require("./trainer.validation");
const trainer_controller_1 = require("./trainer.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
//done Create/register a new trainer
router.post('/register', (0, auth_1.default)('ADMIN'), // Only admins can create trainers
(0, validateRequest_1.default)(trainer_validation_1.createTrainerZodSchema), trainer_controller_1.trainerController.createTrainer);
//done Get all trainers
router.get('/', (0, auth_1.default)('ADMIN'), trainer_controller_1.trainerController.getAllTrainers);
//done Get a single trainer by ID
router.get('/:id', (0, auth_1.default)('ADMIN'), trainer_controller_1.trainerController.getTrainerById);
//done Update a trainer by ID
router.patch('/:id', (0, auth_1.default)('ADMIN'), (0, validateRequest_1.default)(trainer_validation_1.updateTrainerZodSchema), trainer_controller_1.trainerController.updateTrainer);
//done Delete a trainer by ID
router.delete('/:id', (0, auth_1.default)('ADMIN'), trainer_controller_1.trainerController.deleteTrainer);
//done Assign a class to a trainer
router.patch('/:trainerId/assign-class', (0, auth_1.default)('ADMIN'), trainer_controller_1.trainerController.assignClass);
exports.TrainerRoutes = router;
