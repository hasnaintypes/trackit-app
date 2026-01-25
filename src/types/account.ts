import type { Currency } from "./user";
import type { Prisma } from "@prisma/client";

export type AccountType =
  | "BANK"
  | "CASH"
  | "CREDIT"
  | "INVESTMENT"
  | "LOAN"
  | "OTHER";

export interface BankAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: string; // use string to represent Decimal from API layer
  color?: string | null;
  icon?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Serialized version of BankAccount for API responses (dates are strings)
 */
export type ApiBankAccount = Omit<BankAccount, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

/**
 * Raw account data matched to Prisma schema for internal router use
 */
export interface RawAccount {
  id: string;
  userId?: string | null;
  name: string;
  type: string;
  currency: string;
  balance: Prisma.Decimal | number | string;
  color: string | null;
  icon: string | null;
  isDefault: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

// No default export — types are exported by name
