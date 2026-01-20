// Auth-related types based on Prisma schema
export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}

export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResetPasswordPayload {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  url: string;
  token: string;
}

export interface OnPasswordResetPayload {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
