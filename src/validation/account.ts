import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["BANK", "CASH", "CREDIT", "INVESTMENT", "LOAN", "OTHER"]),
  currency: z
    .enum([
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "AUD",
      "CAD",
      "CHF",
      "CNY",
      "INR",
      "SGD",
      "PKR",
    ])
    .optional(),
  balance: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (typeof v === "number" ? String(v) : v)),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAccountSchema = createAccountSchema.extend({
  id: z.string().min(1),
});

export const accountIdParam = z.object({ id: z.string().min(1) });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

// No default export
