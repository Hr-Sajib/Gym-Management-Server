// src/models/class.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IClass } from './class.interface';


// Define the Mongoose schema for Class
const classSchema = new Schema<IClass>(
  {
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
      type: Schema.Types.ObjectId, // Changed to ObjectId
      ref: 'Trainer', // Reference to Trainer _id
      default: null,
    },
    conductedOrNot: {
      type: Boolean,
      default: false,
    },
    enrolledTraineeIds: {
      type: [Schema.Types.ObjectId], // Changed to array of ObjectId
      ref: 'Trainee', // Reference to Trainee _id
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

// Virtual field for id (string representation of _id)
// classSchema.virtual('id').get(function (this: Document) {
//   return this._id.toString();
// });

// Create and export the Class model
const Class = mongoose.model<IClass>('Class', classSchema);

export default Class;