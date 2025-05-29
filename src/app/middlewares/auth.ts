import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import config from '../../config';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import prisma from '../utils/prismaClient';

export type TUserRole = 'ADMIN' | 'TRAINER' | 'TRAINEE';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'No authorization token provided'
      );
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7); // Remove "Bearer " prefix
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token verification failed');
    }

    const { role, userEmail } = decoded;

    console.log("AUTH: ", role, userEmail)
    // Check if user exists in DB
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found in authentication');
    }



    // Role check
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Insufficient role permissions');
    }

    // Attach user to request
    req.user = {
      email: userEmail,
      role: role as TUserRole,
      id: user.id, // Prisma default ID field
    };

    next();
  });
};

export default auth;
