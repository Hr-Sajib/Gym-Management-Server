// src/modules/trainee/routes/trainee.routes.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';

import {
  createTraineeZodSchema,
  enrollTraineeZodSchema,
  unenrollTraineeZodSchema,
  updateTraineeZodSchema,
} from '../Trainee/trainee.validation';
import { traineeController } from './trainee.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Register a new trainee
router.post(
  '/register',
  validateRequest(createTraineeZodSchema),
  traineeController.createTrainee
);

// Get all trainees
router.get(
  '/',
  auth('ADMIN'),
  traineeController.getAllTrainees
);

// Get a single trainee by ID
router.get(
  '/:id',
  auth('ADMIN', 'TRAINEE'), // Allow self-access or admin
  traineeController.getTraineeById
);

// Update a trainee by ID
router.patch(
  '/:id',
  validateRequest(updateTraineeZodSchema),
  auth('ADMIN', 'TRAINEE'), // Allow self-update or admin
  traineeController.updateTrainee
);

// Delete a trainee by ID
router.delete(
  '/:id',
  auth('ADMIN'), // Only admins can delete
  traineeController.deleteTrainee
);

// Enroll in a class
router.post(
  '/enroll-in-class/:classId',
  validateRequest(enrollTraineeZodSchema),
  auth('ADMIN', 'TRAINEE'), // Only admins or trainees (self-enrollment) can enroll
  traineeController.enrollTraineeInClass
);

// Cancel enrollment from a class
router.post(
  '/cancel-enroll/:classId',
  validateRequest(unenrollTraineeZodSchema),
  auth('ADMIN', 'TRAINEE'), // Only admins or trainees (self-unenrollment) can unenroll
  traineeController.unenrollTraineeFromClass
);

export const TraineeRoutes = router;