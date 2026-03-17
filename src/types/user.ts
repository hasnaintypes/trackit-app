// User types - import enums from Prisma instead of manual definitions
import {
  type Gender,
  type Currency,
  type Country,
  type Timezone,
} from "@prisma/client";

export type { Gender, Currency, Country, Timezone };

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
