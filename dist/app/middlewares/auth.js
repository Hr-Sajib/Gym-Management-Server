"use strict";
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
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let token = req.headers.authorization;
        console.log('🔐 Incoming Authorization Header:', token);
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'No authorization token provided');
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7); // Remove "Bearer " prefix
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
        }
        catch (error) {
            console.error('❌ JWT Verification Failed:', error);
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Token has expired');
            }
            if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid token');
            }
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Token verification failed');
        }
        // console.log('✅ Decoded Token:', decoded);
        const { userEmail } = decoded;
        let user;
        let userTable = 'TRAINEE'; // Default
        // Step 1: Try trainee
        user = yield prismaClient_1.default.trainee.findUnique({ where: { email: userEmail } });
        if (user) {
            // console.log('👤 User found in TRAINEE table:', user.email);
            userTable = 'TRAINEE';
        }
        else {
            // Step 2: Try trainer
            user = yield prismaClient_1.default.trainer.findUnique({ where: { email: userEmail } });
            if (user) {
                // console.log('👤 User found in TRAINER table:', user.email);
                const normalizedEmail = user.email.trim().toLowerCase();
                // console.log('🔍 Normalized email for comparison:', normalizedEmail);
                if (normalizedEmail === 'admin@gym.com') {
                    // console.log('🎯 Email matches ADMIN, setting role to ADMIN');
                    userTable = 'ADMIN';
                }
                else {
                    // console.log('📌 Email does not match ADMIN, setting role to TRAINER');
                    userTable = 'TRAINER';
                }
            }
        }
        if (!user) {
            console.log('❌ No user found in either table.');
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
        }
        // console.log('✅ Final Role:', userTable);
        // Role check based on allowed roles
        if (requiredRoles.length && !requiredRoles.includes(userTable)) {
            // console.log('⛔ Role not authorized. Required:', requiredRoles, 'Found:', userTable);
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Insufficient role permissions');
        }
        // Attach user to request
        req.user = {
            email: userEmail,
            id: user.id,
            role: userTable,
        };
        console.log('📦 Attached user to req:', req.user);
        next();
    }));
};
exports.default = auth;
