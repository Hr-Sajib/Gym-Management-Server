// src/modules/trainee/validations/trainee.validation.ts
import { z } from 'zod';

export const createTraineeZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(), // Added phone as optional
  }),
});

export const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required in cookies",
    }),
  }),
});

export const updateTraineeZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional(), // Added phone as optional
    // role is omitted from updates since it's fixed and should not be changed
  }),
});
// src/modules/trainee/validations/trainee.validation.ts
export const enrollTraineeZodSchema = z.object({
  body: z.object({
    traineeId: z.string({
      required_error: 'Trainee ID is required',
    }),
  }),
});

export const unenrollTraineeZodSchema = z.object({
  body: z.object({
    traineeId: z.string({
      required_error: 'Trainee ID is required',
    }),
  }),
});
export const loginUserZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Email must be a valid email address'),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});