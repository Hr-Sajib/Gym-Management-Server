// src/modules/class/class.routes.ts
import express from 'express';
import { createClassZodSchema, updateClassZodSchema } from './class.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { classController } from './class.controller';


const router = express.Router();

router.post(
  '/register',
  validateRequest(createClassZodSchema),
  auth("ADMIN"), // Only admins and trainers can create classes
  classController.createClass
);

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

export const classRoutes = router;