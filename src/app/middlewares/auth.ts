// // src/middlewares/auth.middleware.ts
// import { NextFunction, Request, Response } from 'express';
// import httpStatus from 'http-status';
// import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
// import config from '../../config';
// import catchAsync from '../utils/catchAsync';
// import AppError from '../errors/AppError';
// import Trainee from '../modules/Trainee/trainee.model';
// import Trainer from '../modules/Trainer/trainer.model';


// export type TUserRole = 'ADMIN' | 'TRAINER' | 'TRAINEE';

// const auth = (...requiredRoles: TUserRole[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     let token = req.headers.authorization;

//     // console.log('🔐 Incoming Authorization Header:', token);

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'No authorization token provided');
//     }

//     if (token.startsWith('Bearer ')) {
//       token = token.slice(7); // Remove "Bearer " prefix
//     }

//     let decoded: JwtPayload;

//     try {
//       decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
//     } catch (error) {
//       // console.error('❌ JWT Verification Failed:', error);
//       if (error instanceof TokenExpiredError) {
//         throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired');
//       }
//       if (error instanceof JsonWebTokenError) {
//         throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
//       }
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Token verification failed');
//     }

//     // console.log('✅ Decoded User:', decoded);

//     const { userEmail } = decoded;

//     let user;
//     let userRole: TUserRole = 'TRAINEE'; // Default role

//     // Step 1: Try Trainee
//     user = await Trainee.findOne({ email: userEmail }, { id: 1, _id: 0 });

//     if (user) {
//       // // console.log('👤 User found in Trainee table:', userEmail);
//       userRole = 'TRAINEE';
//     } else {
//       // Step 2: Try Trainer
//       user = await Trainer.findOne({ email: userEmail }, { id: 1, _id: 0 });

//       if (user) {
//         // // console.log('👤 User found in Trainer table:', userEmail);

//         const normalizedEmail = userEmail.trim().toLowerCase();
//         // // console.log('🔍 Normalized email for comparison:', normalizedEmail);

//         if (normalizedEmail === 'admin@gym.com') {
//           // // console.log('🎯 Email matches ADMIN, setting role to ADMIN');
//           userRole = 'ADMIN';
//         } else {
//           // // console.log('📌 Email does not match ADMIN, setting role to TRAINER');
//           userRole = 'TRAINER';
//         }
//       }
//     }

//     if (!user) {
//       // console.log('❌ No user found in either table.');
//       throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
//     }

//     // // console.log('✅ Final Role:', userRole);

//     // Role check based on allowed roles
//     if (requiredRoles.length && !requiredRoles.includes(userRole)) {
//       // // console.log('⛔ Role not authorized. Required:', requiredRoles, 'Found:', userRole);
//       throw new AppError(httpStatus.UNAUTHORIZED, 'Insufficient role permissions');
//     }

//     // Attach user to request
//     req.user = {
//       email: userEmail,
//       id: user.id,
//       role: userRole,
//     };

//     // console.log('📦 Attached user to req:', req.user);

//     next();
//   });
// };

// export default auth;
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

    // console.log('🔐 [Auth Middleware] Incoming Authorization Header:', token);

    if (!token) {
      // console.log('❌ [Auth Middleware] No token provided');
      throw new AppError(httpStatus.UNAUTHORIZED, 'No authorization token provided');
    }

    if (token.startsWith('Bearer ')) {
      // console.log('🔍 [Auth Middleware] Found Bearer prefix, extracting token');
      token = token.slice(7); // Remove "Bearer " prefix
    } else {
      // console.log('⚠️ [Auth Middleware] Token does not start with Bearer');
    }

    // console.log('🔑 [Auth Middleware] Extracted Token:', token);

    let decoded: JwtPayload;

    try {
      // console.log('🔍 [Auth Middleware] Verifying JWT with secret:', config.jwt_access_secret);
      decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
      // console.log('✅ [Auth Middleware] Decoded JWT Payload:', decoded);
    } catch (error) {
      // console.error('❌ [Auth Middleware] JWT Verification Failed:', error);
      if (error instanceof TokenExpiredError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token verification failed');
    }

    const { userEmail } = decoded;
    // console.log('📧 [Auth Middleware] Extracted userEmail from JWT:', userEmail);

    let user;
    let userRole: TUserRole = 'TRAINEE'; // Default role
    // console.log('🔄 [Auth Middleware] Starting user lookup with default role:', userRole);

    // Step 1: Try Trainee
    // console.log('🔍 [Auth Middleware] Checking Trainee table for email:', userEmail);
    user = await Trainee.findOne({ email: userEmail }, { id: 1, _id: 0 });
    // console.log('👤 [Auth Middleware] Trainee lookup result:', user);

    if (user) {
      // console.log('✅ [Auth Middleware] User found in Trainee table, setting role to TRAINEE');
      userRole = 'TRAINEE';
    } else {
      // Step 2: Try Trainer
      // console.log('🔍 [Auth Middleware] No Trainee found, checking Trainer table for email:', userEmail);
      user = await Trainer.findOne({ email: userEmail }, { id: 1, _id: 0 });
      // console.log('👤 [Auth Middleware] Trainer lookup result:', user);

      if (user) {
        // console.log('✅ [Auth Middleware] User found in Trainer table');
        const normalizedEmail = userEmail.trim().toLowerCase();
        // console.log('🔄 [Auth Middleware] Normalized email for comparison:', normalizedEmail);

        if (normalizedEmail === 'admin@gym.com') {
          // console.log('🎯 [Auth Middleware] Email matches admin@gym.com, setting role to ADMIN');
          userRole = 'ADMIN';
        } else {
          // console.log('📌 [Auth Middleware] Email does not match admin@gym.com, setting role to TRAINER');
          userRole = 'TRAINER';
        }
      }
    }

    if (!user) {
      // console.log('❌ [Auth Middleware] No user found in either Trainee or Trainer table');
      throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    // console.log('✅ [Auth Middleware] Final Role Assigned:', userRole);

    // Role check based on allowed roles
    // console.log('🔐 [Auth Middleware] Checking required roles:', requiredRoles, 'against user role:', userRole);
    if (requiredRoles.length && !requiredRoles.includes(userRole)) {
      // console.log('⛔ [Auth Middleware] Role not authorized. Required:', requiredRoles, 'Found:', userRole);
      throw new AppError(httpStatus.UNAUTHORIZED, 'Insufficient role permissions');
    }


    // Attach user to request
    req.user = {
      email: userEmail,
      id: user.id,
      role: userRole,
    };
    // console.log('📦 [Auth Middleware] Attached user to req:', req.user);

    next();
  });
};

export default auth;