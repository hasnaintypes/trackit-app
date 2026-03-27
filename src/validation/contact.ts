import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d][\d\s\-()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const updateContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d][\d\s\-()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const listContactsSchema = z.object({
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsInput = z.infer<typeof listContactsSchema>;
