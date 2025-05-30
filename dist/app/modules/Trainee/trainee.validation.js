"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserZodSchema = exports.unenrollTraineeZodSchema = exports.enrollTraineeZodSchema = exports.updateTraineeZodSchema = exports.refreshTokenZodSchema = exports.createTraineeZodSchema = void 0;
// src/modules/trainee/validations/trainee.validation.ts
const zod_1 = require("zod");
exports.createTraineeZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        password: zod_1.z
            .string({
            required_error: 'Password is required',
        })
            .min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().optional(), // Added phone as optional
    }),
});
exports.refreshTokenZodSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({
            required_error: "Refresh token is required in cookies",
        }),
    }),
});
exports.updateTraineeZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email('Invalid email format').optional(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
        phone: zod_1.z.string().optional(), // Added phone as optional
        // role is omitted from updates since it's fixed and should not be changed
    }),
});
// src/modules/trainee/validations/trainee.validation.ts
exports.enrollTraineeZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        traineeId: zod_1.z.string({
            required_error: 'Trainee ID is required',
        }),
    }),
});
exports.unenrollTraineeZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        traineeId: zod_1.z.string({
            required_error: 'Trainee ID is required',
        }),
    }),
});
exports.loginUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Email must be a valid email address'),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
    }),
});
