// src/modules/user/interfaces/trainee.interface.ts
import { Types } from 'mongoose';

export interface ITrainee {
  id: string; // String representation of _id
  name: string;
  email: string;
  role: 'TRAINEE'; // Literal type for role
  password: string;
  phone?: string; // Optional field
  enrolledClasses: Types.ObjectId[]; // Array of Class _id references
  createdAt: Date; // Non-optional, managed by Mongoose
  updatedAt: Date; // Non-optional, managed by Mongoose
}