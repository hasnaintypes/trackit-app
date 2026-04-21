export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  linkedUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
