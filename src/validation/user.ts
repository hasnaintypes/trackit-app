import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  country: z
    .enum(["PK", "US", "GB", "CA", "AU", "DE", "FR", "JP", "SG", "IN", "AE"])
    .optional(),
  timezone: z
    .enum([
      "UTC",
      "EST",
      "CST",
      "MST",
      "PST",
      "GMT",
      "CET",
      "JST",
      "AEST",
      "IST",
    ])
    .optional(),
});

export const uploadProfileImageSchema = z.object({
  file: z.string().min(1),
  fileName: z.string().optional(),
  folder: z.string().optional(),
});

export const searchUserSchema = z.object({
  q: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UploadProfileImageInput = z.infer<typeof uploadProfileImageSchema>;
export type SearchUserInput = z.infer<typeof searchUserSchema>;
