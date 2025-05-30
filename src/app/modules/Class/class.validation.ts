// src/modules/class/validations/class.validation.ts
import { z } from 'zod';

// For creating a class
export const createClassZodSchema = z.object({
  body: z.object({
    startTime: z.string({ required_error: 'Start time is required' }),
    endTime: z.string({ required_error: 'End time is required' }),
    date: z
      .string({ required_error: 'Date is required' })
      .refine((value) => !isNaN(Date.parse(value)), {
        message: 'Invalid date format, expected a valid ISO date string (e.g., "2025-05-30T08:00:00.000Z")',
      })
      .transform((value) => new Date(value)), // Transform string to Date
    assignedTrainerId: z.string().optional().nullable(), // Removed UUID constraint
    conductedTrainerId: z.string().optional().nullable(), // Removed UUID constraint
    enrolledTraineeIds: z.array(z.string()).optional(), // Added enrolledTraineeIds
  }),
});

export const enrollTraineeZodSchema = z.object({
  body: z.object({
    traineeId: z.string({ required_error: 'Trainee ID is required' }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Trainee ID format'),
  }),
});
// For updating a class
export const updateClassZodSchema = z.object({
  body: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    date: z
      .string()
      .optional()
      .refine((value) => !value || !isNaN(Date.parse(value)), {
        message: 'Invalid date format, expected a valid ISO date string (e.g., "2025-05-30T08:00:00.000Z")',
      })
      .transform((value) => (value ? new Date(value) : undefined)), // Transform string to Date if provided
    assignedTrainerId: z.string().optional().nullable(),
    conductedTrainerId: z.string().optional().nullable(),
    enrolledTraineeIds: z.array(z.string()).optional(),
  }),
});