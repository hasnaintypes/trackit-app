import { z } from "zod";

export const revokeSessionSchema = z.object({
  id: z.string().min(1),
});

export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;
