"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTrainerZodSchema = exports.createTrainerZodSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
// Custom validator for ObjectId strings
const objectIdString = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), { message: 'Invalid ObjectId format' });
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
        phone: zod_1.z.string().optional().nullable(),
        role: zod_1.z.literal('TRAINER', {
            errorMap: () => ({ message: 'Role must be "TRAINER"' }),
        }),
        assignedClasses: zod_1.z.array(objectIdString).optional().default([]),
        conductedClasses: zod_1.z.array(objectIdString).optional().default([]),
    }),
});
exports.updateTrainerZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
        email: zod_1.z.string().email('Invalid email format').optional(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
        phone: zod_1.z.string().optional().nullable(),
        assignedClasses: zod_1.z.array(objectIdString).optional(),
        conductedClasses: zod_1.z.array(objectIdString).optional(),
    }),
});
