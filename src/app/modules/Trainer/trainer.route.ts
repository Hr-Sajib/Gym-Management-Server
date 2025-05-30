// src/modules/trainer/routes/trainer.routes.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
// import auth from '../../middlewares/auth';
import { createTrainerZodSchema, updateTrainerZodSchema } from './trainer.validation';
import { trainerController } from './trainer.controller';


const router = express.Router();

// Create/register a new trainer
router.post(
  '/register',
  // auth('ADMIN'), // Only admins can create trainers
  validateRequest(createTrainerZodSchema),
  trainerController.createTrainer,
);

// Get all trainers
// router.get('/', auth('ADMIN'), trainerController.getAllTrainers);

// // Get a single trainer by ID
// router.get('/:id', auth('ADMIN', 'TRAINER'), trainerController.getTrainerById);

// // Update a trainer by ID
// router.patch(
//   '/:id',
//   auth('ADMIN'),
//   validateRequest(updateTrainerZodSchema),
//   trainerController.updateTrainer,
// );

// // Delete a trainer by ID
// router.delete('/:id', auth('ADMIN'), trainerController.deleteTrainer);

// // ✅ Assign a class to a trainer
// router.patch(
//   '/:trainerId/assign-class',
//   auth('ADMIN'),
//   trainerController.assignClass
// );

export const TrainerRoutes = router;
