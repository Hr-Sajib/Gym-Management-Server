// src/utils/timeValidation.ts
import httpStatus from 'http-status';
import AppError from '../errors/AppError';

export const validateTwoHourGap = (startTime: string, endTime: string, date: Date): void => {
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
    throw new AppError(httpStatus.BAD_REQUEST, 'The time gap between startTime and endTime must be exactly 2 hours.');
  }
};