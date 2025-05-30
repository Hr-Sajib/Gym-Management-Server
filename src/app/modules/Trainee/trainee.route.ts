// src/modules/trainee/routes/trainee.routes.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';

import {
  createTraineeZodSchema,
  updateTraineeZodSchema,
} from '../Trainee/trainee.validation';
import { traineeController } from './trainee.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

//done register a new trainee
router.post(
  '/register',
  validateRequest(createTraineeZodSchema),
  traineeController.createTrainee,
);

//done Get all trainees
router.get('/', auth('ADMIN'), traineeController.getAllTrainees);

//done Get a single trainee by ID
router.get('/:id', auth('ADMIN'), traineeController.getTraineeById);

//done Update a trainee 
router.patch(
  '',
  auth('TRAINEE'),
  validateRequest(updateTraineeZodSchema),
  traineeController.updateTrainee,
);

// Delete a trainee by ID
router.delete('/:id', auth('TRAINEE'), traineeController.deleteTrainee);

export const TraineeRoutes = router;