import { z } from "zod";
import { Currency, GroupType } from "@prisma/client";

export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
  type: z.nativeEnum(GroupType).default("OTHER"),
  currency: z.nativeEnum(Currency).default("USD"),
  memberContactIds: z.array(z.string().min(1)).optional(),
});

export const updateGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  type: z.nativeEnum(GroupType).optional(),
  currency: z.nativeEnum(Currency).optional(),
});

export const addMemberSchema = z.object({
  groupId: z.string().min(1),
  contactId: z.string().min(1),
});

export const removeMemberSchema = z.object({
  groupId: z.string().min(1),
  memberId: z.string().min(1),
});

export const listGroupsSchema = z.object({
  includeArchived: z.boolean().default(false),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
