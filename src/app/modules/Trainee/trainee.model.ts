// src/models/trainee.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITrainee } from './trainee.interface';

// Define the Mongoose schema for Trainee
const traineeSchema = new Schema<ITrainee>(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null, // Optional field, default to null to match the interface
    },
    role: {
      type: String,
      default: "TRAINEE", // Fixed default value
      enum: ["TRAINEE"], // Enforce only "TRAINEE" as a valid value
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Create and export the Trainee model
const Trainee = mongoose.model<ITrainee>('Trainee', traineeSchema); // Note: Should be ITrainee, not ITrainer
export default Trainee;