"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoutes = void 0;
// src/modules/class/class.routes.ts
const express_1 = __importDefault(require("express"));
const class_validation_1 = require("./class.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const class_controller_1 = require("./class.controller");
const router = express_1.default.Router();
// Create a new class
router.post('/register', (0, validateRequest_1.default)(class_validation_1.createClassZodSchema), (0, auth_1.default)('ADMIN'), // Only admins can create classes
class_controller_1.classController.createClass);
// Get all classes
router.get('/', (0, auth_1.default)('ADMIN', 'TRAINEE', 'TRAINER'), // Only admins can view all classes
class_controller_1.classController.getAllClasses);
// Get a specific class by ID
router.get('/:id', (0, auth_1.default)('ADMIN', 'TRAINER'), // Admins and trainers can view a specific class
class_controller_1.classController.getClassById);
// Update a class by ID
router.patch('/:id', (0, validateRequest_1.default)(class_validation_1.updateClassZodSchema), (0, auth_1.default)('ADMIN'), // Only admins can update classes
class_controller_1.classController.updateClass);
// Delete a class by ID
router.delete('/:id', (0, auth_1.default)('ADMIN'), // Only admins can delete classes
class_controller_1.classController.deleteClass);
exports.classRoutes = router;
