import type { User } from "@/types/user";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUser(obj: unknown): obj is User {
  if (typeof obj !== "object" || obj === null) return false;
  const u = obj as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.name === "string" &&
    typeof u.email === "string" &&
    typeof u.emailVerified === "boolean" &&
    typeof u.role === "string" &&
    u.createdAt != null &&
    u.updatedAt != null
  );
}

export function mapHomeTestimonials(home?: Array<Record<string, unknown>>) {
  return (home ?? []).map((t) => {
    const item = t ?? {};
    const quote = typeof item.quote === "string" ? item.quote : "";
    const author =
      typeof item.name === "string"
        ? item.name
        : typeof item.role === "string"
          ? item.role
          : "";
    const avatar = typeof item.image === "string" ? item.image : "";

    return { quote, author, avatar };
  });
}
