import type { Currency } from "./user";

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

export interface Category {
  id: string;
  userId: string;
  parentCategoryId?: string | null;
  name: string;
  color?: string | null;
  icon?: string | null;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
  startDate: Date;
  endDate?: Date | null;
  spentAmount: string;
  threshold_70_alert_sent: boolean;
  threshold_90_alert_sent: boolean;
  threshold_100_alert_sent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string | null;
  contactId?: string | null;
  groupId?: string | null;
  amount: string;
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  description?: string | null;
  notes?: string | null;
  date: Date;
  isRecurring: boolean;
  recurringRuleId?: string | null;
  receipt_url?: string | null;
  receipt_extracted_text?: string | null;
  ai_category_suggestion?: string | null;
  ai_notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// No default export — types are exported by name
