"use strict";
// // src/middlewares/auth.middleware.ts
// import { NextFunction, Request, Response } from 'express';
// import httpStatus from 'http-status';
// import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
// import config from '../../config';
// import catchAsync from '../utils/catchAsync';
// import AppError from '../errors/AppError';
// import Trainee from '../modules/Trainee/trainee.model';
// import Trainer from '../modules/Trainer/trainer.model';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const trainee_model_1 = __importDefault(require("../modules/Trainee/trainee.model"));
const trainer_model_1 = __importDefault(require("../modules/Trainer/trainer.model"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let token = req.headers.authorization;
        // console.log('🔐 [Auth Middleware] Incoming Authorization Header:', token);
        if (!token) {
            // console.log('❌ [Auth Middleware] No token provided');
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'No authorization token provided');
        }
        if (token.startsWith('Bearer ')) {
            // console.log('🔍 [Auth Middleware] Found Bearer prefix, extracting token');
            token = token.slice(7); // Remove "Bearer " prefix
        }
        else {
            // console.log('⚠️ [Auth Middleware] Token does not start with Bearer');
        }
        // console.log('🔑 [Auth Middleware] Extracted Token:', token);
        let decoded;
        try {
            // console.log('🔍 [Auth Middleware] Verifying JWT with secret:', config.jwt_access_secret);
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
            // console.log('✅ [Auth Middleware] Decoded JWT Payload:', decoded);
        }
        catch (error) {
            // console.error('❌ [Auth Middleware] JWT Verification Failed:', error);
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Token has expired');
            }
            if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid token');
            }
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Token verification failed');
        }
        const { userEmail } = decoded;
        // console.log('📧 [Auth Middleware] Extracted userEmail from JWT:', userEmail);
        let user;
        let userRole = 'TRAINEE'; // Default role
        // console.log('🔄 [Auth Middleware] Starting user lookup with default role:', userRole);
        // Step 1: Try Trainee
        // console.log('🔍 [Auth Middleware] Checking Trainee table for email:', userEmail);
        user = yield trainee_model_1.default.findOne({ email: userEmail }, { id: 1, _id: 0 });
        // console.log('👤 [Auth Middleware] Trainee lookup result:', user);
        if (user) {
            // console.log('✅ [Auth Middleware] User found in Trainee table, setting role to TRAINEE');
            userRole = 'TRAINEE';
        }
        else {
            // Step 2: Try Trainer
            // console.log('🔍 [Auth Middleware] No Trainee found, checking Trainer table for email:', userEmail);
            user = yield trainer_model_1.default.findOne({ email: userEmail }, { id: 1, _id: 0 });
            // console.log('👤 [Auth Middleware] Trainer lookup result:', user);
            if (user) {
                // console.log('✅ [Auth Middleware] User found in Trainer table');
                const normalizedEmail = userEmail.trim().toLowerCase();
                // console.log('🔄 [Auth Middleware] Normalized email for comparison:', normalizedEmail);
                if (normalizedEmail === 'admin@gym.com') {
                    // console.log('🎯 [Auth Middleware] Email matches admin@gym.com, setting role to ADMIN');
                    userRole = 'ADMIN';
                }
                else {
                    // console.log('📌 [Auth Middleware] Email does not match admin@gym.com, setting role to TRAINER');
                    userRole = 'TRAINER';
                }
            }
        }
        if (!user) {
            // console.log('❌ [Auth Middleware] No user found in either Trainee or Trainer table');
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
        }
        // console.log('✅ [Auth Middleware] Final Role Assigned:', userRole);
        // Role check based on allowed roles
        // console.log('🔐 [Auth Middleware] Checking required roles:', requiredRoles, 'against user role:', userRole);
        if (requiredRoles.length && !requiredRoles.includes(userRole)) {
            // console.log('⛔ [Auth Middleware] Role not authorized. Required:', requiredRoles, 'Found:', userRole);
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Insufficient role permissions');
        }
        // Attach user to request
        req.user = {
            email: userEmail,
            id: user.id,
            role: userRole,
        };
        // console.log('📦 [Auth Middleware] Attached user to req:', req.user);
        next();
    }));
};
exports.default = auth;
