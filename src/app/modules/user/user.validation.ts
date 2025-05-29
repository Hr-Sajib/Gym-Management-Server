import { z } from 'zod';

export const createUserZodSchema = z.object({
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
    role: z.enum(['ADMIN', 'TRAINER', 'TRAINEE'], {
      required_error: 'User role is required',
    }),
  }),
});

export const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required in cookies",
    }),
  }),
});

export const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['admin', 'trainer', 'trainee']).optional(),
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