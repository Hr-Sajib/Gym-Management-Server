"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassZodSchema = exports.createClassZodSchema = void 0;
const zod_1 = require("zod");
// For creating a class
exports.createClassZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        schedule: zod_1.z.string({ required_error: 'Schedule is required' }),
        date: zod_1.z.string({ required_error: 'Date is required' }).refine((value) => !isNaN(Date.parse(value)), { message: 'Invalid date format' }),
        assignedTrainerId: zod_1.z.string().uuid().optional().nullable(),
        conductedTrainerId: zod_1.z.string().uuid().optional().nullable(),
    }),
});
// For updating a class
exports.updateClassZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        schedule: zod_1.z.string().optional(),
        date: zod_1.z
            .string()
            .optional()
            .refine((value) => !value || !isNaN(Date.parse(value)), {
            message: 'Invalid date format',
        }),
        assignedTrainerId: zod_1.z.string().uuid().optional().nullable(),
        conductedTrainerId: zod_1.z.string().uuid().optional().nullable(),
    }),
});
