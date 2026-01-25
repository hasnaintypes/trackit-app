// User types based on Prisma schema
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Currency =
  | "PKR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "CHF"
  | "CNY"
  | "INR"
  | "SGD";
export type Country =
  | "PK"
  | "US"
  | "GB"
  | "CA"
  | "AU"
  | "DE"
  | "FR"
  | "JP"
  | "SG"
  | "IN"
  | "AE";
export type Timezone =
  | "UTC"
  | "EST"
  | "CST"
  | "MST"
  | "PST"
  | "GMT"
  | "CET"
  | "JST"
  | "AEST"
  | "IST";

export interface UpdateProfileInput {
  name: string;
  gender?: Gender;
  country?: Country;
  timezone?: Timezone;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  /** Optional gender enum - matches Prisma Gender */
  gender: Gender | null;
  /** Location and preferences */
  country: Country | null;
  timezone: Timezone | null;
  /** Admin/ban fields */
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  role: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Serialized version of User for API responses (dates are strings)
 */
export type ApiUser = Omit<User, "createdAt" | "updatedAt" | "banExpires"> & {
  createdAt: string;
  updatedAt: string;
  banExpires: string | null;
};
