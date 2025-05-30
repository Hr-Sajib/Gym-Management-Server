"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
// src/modules/trainee/routes/trainee.routes.ts
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const trainee_controller_1 = require("../Trainee/trainee.controller");
const trainee_validation_1 = require("../Trainee/trainee.validation");
const router = express_1.default.Router();
// Login
router.post('/login', (0, validateRequest_1.default)(trainee_validation_1.loginUserZodSchema), trainee_controller_1.traineeController.loginUser);
// Refresh token
router.post('/refresh-token', (0, validateRequest_1.default)(trainee_validation_1.refreshTokenZodSchema), trainee_controller_1.traineeController.refreshToken);
exports.AuthRoutes = router;
