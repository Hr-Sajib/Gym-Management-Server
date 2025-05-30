"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTrainerZodSchema = exports.createTrainerZodSchema = void 0;
// src/modules/trainer/validations/trainer.validation.ts
const zod_1 = require("zod");
exports.createTrainerZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }).min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string({
            required_error: 'Email is required',
        }).email('Invalid email format'),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }).min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().optional(),
    }),
});
exports.updateTrainerZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
        email: zod_1.z.string().email('Invalid email format').optional(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
        phone: zod_1.z.string().optional(),
    }),
});
