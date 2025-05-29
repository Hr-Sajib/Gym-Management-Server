/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import config from '../../config';
import AppError from '../errors/AppError';
import handleDuplicateError from '../errors/handleDuplicateError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import handlePrismaClientError from '../errors/handlePrismaError';
import { TErrorSources } from '../errors/interface/error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Define the global error handler
const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // Zod validation error
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;

  // Mongoose validation error
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;

  // MongoDB duplicate key error
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;

  // Prisma known request error
  } else if (err instanceof PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;

  // Custom application error
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];

  // Other built-in JS errors
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  // Final error response
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.NODE_ENV === 'development' ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
