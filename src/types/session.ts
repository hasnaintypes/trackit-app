export type SessionItem = {
  id: string;
  device: string;
  location?: string;
  ip: string;
  lastActivity: string;
  expiresAt?: string | null;
  token?: string;
};
