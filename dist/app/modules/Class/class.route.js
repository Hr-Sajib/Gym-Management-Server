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
router.post('/register', (0, validateRequest_1.default)(class_validation_1.createClassZodSchema), (0, auth_1.default)("ADMIN"), // Only admins and trainers can create classes
class_controller_1.classController.createClass);
// router.get(
//   '/',
//   auth(UserRole.ADMIN), // Only admins can view all classes
//   classController.getAllClasses
// );
// router.get(
//   '/:id',
//   auth(UserRole.ADMIN, UserRole.TRAINER), // Admins and trainers can view a specific class
//   classController.getClassById
// );
// router.patch(
//   '/:id',
//   validateRequest(updateClassZodSchema),
//   auth(UserRole.ADMIN), // Only admins can update classes
//   classController.updateClass
// );
// router.delete(
//   '/:id',
//   auth(UserRole.ADMIN), // Only admins can delete classes
//   classController.deleteClass
// );
exports.classRoutes = router;
