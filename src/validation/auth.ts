import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain a number" })
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
    message: "Password must contain a special character",
  });

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(100, { message: "Name must be at most 100 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
