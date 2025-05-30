export interface ITrainer {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: "TRAINER"
  assignedClasses: string[];
  conductedClasses: string[];
}