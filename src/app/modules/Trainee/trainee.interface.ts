// src/modules/user/interfaces/trainee.interface.ts


export interface ITrainee {
  id: string;
  name: string;
  email: string;
  role: "TRAINEE"
  password: string;
  phone?: string; // Optional field
  createdAt: Date; // Non-optional, managed by Prisma
  updatedAt: Date; // Non-optional, managed by Prisma
}