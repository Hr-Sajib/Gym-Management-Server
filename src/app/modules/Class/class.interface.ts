import { Types } from "mongoose";

export interface IClass {
  id?: string;
  startTime: string;
  endTime: string; 
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
  assignedTrainerId?: string | null;
  conductedOrNot?: boolean;
  enrolledTraineeIds?: Types.ObjectId[]; 
}
