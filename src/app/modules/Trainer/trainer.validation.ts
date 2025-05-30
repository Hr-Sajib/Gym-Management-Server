
import { z } from 'zod';
import mongoose from 'mongoose';

// Custom validator for ObjectId strings
const objectIdString = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format' }
);

export const createTrainerZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(2, 'Name must be at least 2 characters'),
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email format'),
    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional().nullable(),
    role: z.literal('TRAINER', {
      errorMap: () => ({ message: 'Role must be "TRAINER"' }),
    }).optional(),
    assignedClasses: z.array(objectIdString).optional().default([]),
    conductedClasses: z.array(objectIdString).optional().default([]),
  }),
});

export const updateTrainerZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional().nullable(),
    assignedClasses: z.array(objectIdString).optional(),
    conductedClasses: z.array(objectIdString).optional(),
  }),
});
