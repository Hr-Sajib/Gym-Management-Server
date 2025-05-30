// src/modules/class/class.routes.ts
import express from 'express';
import { createClassZodSchema, updateClassZodSchema } from './class.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { classController } from './class.controller';

const router = express.Router();

// Create a new class
router.post(
  '/register',
  validateRequest(createClassZodSchema),
  auth('ADMIN'), // Only admins can create classes
  classController.createClass
);

// Get all classes
router.get(
  '/',
  auth('ADMIN','TRAINEE','TRAINER'), // Only admins can view all classes
  classController.getAllClasses
);

// Get a specific class by ID
router.get(
  '/:id',
  auth('ADMIN', 'TRAINER'), // Admins and trainers can view a specific class
  classController.getClassById
);

// Update a class by ID
router.patch(
  '/:id',
  validateRequest(updateClassZodSchema),
  auth('ADMIN'), // Only admins can update classes
  classController.updateClass
);

// Delete a class by ID
router.delete(
  '/:id',
  auth('ADMIN'), // Only admins can delete classes
  classController.deleteClass
);



export const classRoutes = router;