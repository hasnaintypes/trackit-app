export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string | null;
  contactId?: string | null;
  groupId?: string | null;
  amount: string; // decimal as string
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  description?: string | null;
  notes?: string | null;
  date: string; // ISO date string
  isRecurring: boolean;
  recurringRuleId?: string | null;
  receipt_url?: string | null;
  receipt_extracted_text?: string | null;
  ai_category_suggestion?: string | null;
  ai_notes?: string | null;
  paymentMethod?:
    | "CARD"
    | "CASH"
    | "BANK_TRANSFER"
    | "AUTO_DEBIT"
    | "UPI"
    | "OTHER"
    | null;
  recurringRule?: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    nextRunAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringRule {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string | null;
  amount: string;
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  description?: string | null;
  notes?: string | null;
  startDate: string;
  endDate?: string | null;
  timezone?: string | null;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  nextRunAt: string;
  lastRunAt?: string | null;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "ENDED";
  lastTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
}
