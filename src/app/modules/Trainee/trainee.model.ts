// src/models/trainee.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITrainee } from './trainee.interface';


// Define the Mongoose schema for Trainee
const traineeSchema = new Schema<ITrainee>(
  {
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
      default: null,
    },
    role: {
      type: String,
      default: 'TRAINEE',
      enum: ['TRAINEE'],
    },
    enrolledClasses: {
      type: [Schema.Types.ObjectId],
      ref: 'Class',
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for id (string representation of _id)
// traineeSchema.virtual('id').get(function (this: Document) {
//   return this._id.toString();
// });

// Create and export the Trainee model
const Trainee = mongoose.model<ITrainee>('Trainee', traineeSchema);
export default Trainee;