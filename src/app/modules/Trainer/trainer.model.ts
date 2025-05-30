// src/models/trainer.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITrainer } from './trainer.interface';

// Define the Mongoose schema for Trainer
const trainerSchema = new Schema<ITrainer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, default: "TRAINER", enum: ["TRAINER"] }, // Enforce "TRAINER" role
    assignedClasses: { type: [String], ref: 'Class', default: [] }, // Reference to Class id (string)
    conductedClasses: { type: [String], ref: 'Class', default: [] }, // Reference to Class id (string)
  },
  { timestamps: true }
);

// Create and export the Trainer model
const Trainer = mongoose.model<ITrainer>('Trainer', trainerSchema);

export default Trainer;