import { Types } from "mongoose";

export interface IClass {
  _id: string;
  startTime: string;
  endTime: string; 
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
  assignedTrainerId?: Types.ObjectId | null;  // <-- updated here
  conductedOrNot?: boolean;
  enrolledTraineeIds?: Types.ObjectId[]; 
}