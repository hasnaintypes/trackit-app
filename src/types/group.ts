export type GroupType =
  | "ROOMMATES"
  | "TRIP"
  | "COUPLE"
  | "FRIENDS"
  | "FAMILY"
  | "WORK"
  | "OTHER";

export type GroupRole = "OWNER" | "MEMBER";

export interface GroupMember {
  id: string;
  groupId: string;
  contactId: string | null;
  userId: string;
  role: GroupRole;
  joinedAt: string;
  contact: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface Group {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: GroupType;
  currency: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members?: GroupMember[];
}
