//trainer.validation.ts
import { z } from 'zod';

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
    phone: z.string().optional(),
    role: z.literal("TRAINER"), // Fixed role value as per ITrainer interface
  }),
});

export const updateTrainerZodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional(),
    // role is omitted from updates since it's fixed and should not be changed
  }),
});