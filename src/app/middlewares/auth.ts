// src/middlewares/auth.middleware.ts
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import config from '../../config';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import Trainee from '../modules/Trainee/trainee.model';
import Trainer from '../modules/Trainer/trainer.model';


export type TUserRole = 'ADMIN' | 'TRAINER' | 'TRAINEE';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;

    console.log('🔐 Incoming Authorization Header:', token);

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'No authorization token provided');
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7); // Remove "Bearer " prefix
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
    } catch (error) {
      console.error('❌ JWT Verification Failed:', error);
      if (error instanceof TokenExpiredError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token verification failed');
    }

    // console.log('✅ Decoded Token:', decoded);

    const { userEmail } = decoded;

    let user;
    let userRole: TUserRole = 'TRAINEE'; // Default role

    // Step 1: Try Trainee
    user = await Trainee.findOne({ email: userEmail }, { id: 1, _id: 0 });

    if (user) {
      // console.log('👤 User found in Trainee table:', userEmail);
      userRole = 'TRAINEE';
    } else {
      // Step 2: Try Trainer
      user = await Trainer.findOne({ email: userEmail }, { id: 1, _id: 0 });

      if (user) {
        // console.log('👤 User found in Trainer table:', userEmail);

        const normalizedEmail = userEmail.trim().toLowerCase();
        // console.log('🔍 Normalized email for comparison:', normalizedEmail);

        if (normalizedEmail === 'admin@gym.com') {
          // console.log('🎯 Email matches ADMIN, setting role to ADMIN');
          userRole = 'ADMIN';
        } else {
          // console.log('📌 Email does not match ADMIN, setting role to TRAINER');
          userRole = 'TRAINER';
        }
      }
    }

    if (!user) {
      console.log('❌ No user found in either table.');
      throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    // console.log('✅ Final Role:', userRole);

    // Role check based on allowed roles
    if (requiredRoles.length && !requiredRoles.includes(userRole)) {
      // console.log('⛔ Role not authorized. Required:', requiredRoles, 'Found:', userRole);
      throw new AppError(httpStatus.UNAUTHORIZED, 'Insufficient role permissions');
    }

    // Attach user to request
    req.user = {
      email: userEmail,
      id: user.id,
      role: userRole,
    };

    console.log('📦 Attached user to req:', req.user);

    next();
  });
};

export default auth;