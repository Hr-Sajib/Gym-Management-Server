// src/models/class.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IClass } from './class.interface';


// Define the Mongoose schema for Class
const classSchema = new Schema<IClass>(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    assignedTrainerId: {
      type: String,
      default: null,
    },
    conductedOrNot: {
      type: Boolean,
      default: false,
    },
    enrolledTraineeIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Create and export the Class model
const Class = mongoose.model<IClass>('Class', classSchema);

export default Class;