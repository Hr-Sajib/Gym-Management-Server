"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassZodSchema = exports.enrollTraineeZodSchema = exports.createClassZodSchema = void 0;
// src/modules/class/validations/class.validation.ts
const zod_1 = require("zod");
// For creating a class
exports.createClassZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        startTime: zod_1.z.string({ required_error: 'Start time is required' }),
        endTime: zod_1.z.string({ required_error: 'End time is required' }),
        date: zod_1.z
            .string({ required_error: 'Date is required' })
            .refine((value) => !isNaN(Date.parse(value)), {
            message: 'Invalid date format, expected a valid ISO date string (e.g., "2025-05-30T08:00:00.000Z")',
        })
            .transform((value) => new Date(value)), // Transform string to Date
        assignedTrainerId: zod_1.z.string().optional().nullable(), // Removed UUID constraint
        conductedTrainerId: zod_1.z.string().optional().nullable(), // Removed UUID constraint
        enrolledTraineeIds: zod_1.z.array(zod_1.z.string()).optional(), // Added enrolledTraineeIds
    }),
});
exports.enrollTraineeZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        traineeId: zod_1.z.string({ required_error: 'Trainee ID is required' }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Trainee ID format'),
    }),
});
// For updating a class
exports.updateClassZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        startTime: zod_1.z.string().optional(),
        endTime: zod_1.z.string().optional(),
        date: zod_1.z
            .string()
            .optional()
            .refine((value) => !value || !isNaN(Date.parse(value)), {
            message: 'Invalid date format, expected a valid ISO date string (e.g., "2025-05-30T08:00:00.000Z")',
        })
            .transform((value) => (value ? new Date(value) : undefined)), // Transform string to Date if provided
        assignedTrainerId: zod_1.z.string().optional().nullable(),
        conductedTrainerId: zod_1.z.string().optional().nullable(),
        enrolledTraineeIds: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
