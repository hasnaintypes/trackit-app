import { z } from "zod";

export const getLatestNotificationsSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});

export const markAsReadSchema = z.object({
  id: z.string(),
});

export type GetLatestNotificationsInput = z.infer<
  typeof getLatestNotificationsSchema
>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
