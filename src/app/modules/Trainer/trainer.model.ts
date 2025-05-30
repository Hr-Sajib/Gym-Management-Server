// src/models/trainer.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITrainer } from './trainer.interface';

// Define the Mongoose schema for Trainer
const trainerSchema = new Schema<ITrainer>(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, default: "TRAINER", enum: ["TRAINER"] }, // Enforce "TRAINER" role
    assignedClasses: { type: [String], default: [] },
    conductedClasses: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Create and export the Trainer model
const Trainer = mongoose.model<ITrainer>('Trainer', trainerSchema);

export default Trainer;