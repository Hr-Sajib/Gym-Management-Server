// src/modules/user/interfaces/user.interface.ts
export type UserRole = 'ADMIN' | 'TRAINER' | 'TRAINEE';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string; // Optional field
  createdAt: Date; // Non-optional, managed by Prisma
  updatedAt: Date; // Non-optional, managed by Prisma
}