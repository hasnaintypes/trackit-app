import type { Gender } from "@/types/user";

/**
 * Default avatar URLs for the application.
 * These are used as fallbacks when no custom avatar is provided.
 */
export const DEFAULT_AVATARS = {
  BOY: "https://avatar.iran.liara.run/public/boy",
  GIRL: "https://avatar.iran.liara.run/public/girl",
} as const;

/**
 * Generate a URL for a user's avatar using their name
 * This creates a consistent avatar based on the user's name.
 */
export function generateNamedAvatar(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

/**
 * Resolve which avatar URL to use for a user.
 * Client-side safe version that can be used in React components.
 */
export function getAvatarUrl(opts: {
  image?: string | null;
  name?: string | null;
  gender?: Gender | null;
}): string {
  const { image, name, gender } = opts;

  // If there's an explicit image URL, use it
  if (image) return image;

  // If there's a name, generate an avatar based on it
  if (name) return generateNamedAvatar(name);

  // Fall back to gender-based default avatars
  if (gender === "FEMALE") return DEFAULT_AVATARS.GIRL;

  // Default to boy avatar for all other cases
  return DEFAULT_AVATARS.BOY;
}
