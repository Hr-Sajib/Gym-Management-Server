"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTwoHourGap = void 0;
// src/utils/timeValidation.ts
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const validateTwoHourGap = (startTime, endTime, date) => {
    // Parse startTime and endTime (HH:mm format)
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    // Create Date objects for start and end times
    const startDateTime = new Date(date);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    const endDateTime = new Date(date);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    // Calculate time difference in milliseconds
    const timeDiffMs = endDateTime.getTime() - startDateTime.getTime();
    const timeDiffMinutes = timeDiffMs / (1000 * 60); // Convert to minutes
    // Check if the gap is exactly 2 hours (120 minutes)
    if (timeDiffMinutes !== 120) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'The time gap between startTime and endTime must be exactly 2 hours.');
    }
};
exports.validateTwoHourGap = validateTwoHourGap;
