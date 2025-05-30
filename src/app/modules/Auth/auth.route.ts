// src/modules/trainee/routes/trainee.routes.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { traineeController } from '../Trainee/trainee.controller';
import { loginUserZodSchema, refreshTokenZodSchema } from '../Trainee/trainee.validation';


const router = express.Router();

// Login
router.post(
  '/login',
  validateRequest(loginUserZodSchema),
  traineeController.loginUser,
);

// Refresh token
router.post(
  '/refresh-token',
  validateRequest(refreshTokenZodSchema),
  traineeController.refreshToken,
);



export const AuthRoutes = router;