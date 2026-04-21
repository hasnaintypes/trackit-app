export type SplitMethod = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  contactId: string | null;
  isPayer: boolean;
  paidAmount: number;
  owedAmount: number;
  contact: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export interface Expense {
  id: string;
  groupId: string;
  createdById: string;
  description: string;
  notes: string | null;
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string;
  receiptUrl: string | null;
  splitMethod: SplitMethod;
  isSettlement: boolean;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ExpenseParticipant[];
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}
