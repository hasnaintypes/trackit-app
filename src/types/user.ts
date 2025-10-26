// User types based on Prisma schema
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
