export interface TransactionForAI {
  index: number;
  description: string;
  amount: string;
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  date?: string;
  notes?: string;
}

export interface CategorizationResult {
  index: number;
  categoryId: string;
  confidence?: number;
}

export interface CategorizationResponse {
  results: CategorizationResult[];
  errors?: Array<{ index: number; error: string }>;
}

export interface ReceiptScanResult {
  description?: string | null;
  merchant?: string | null;
  amount?: string | null;
  date?: string | null;
  paymentMethod?: string | null;
  isRecurring?: boolean;
  recurrence?: {
    frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
    interval?: number | null;
    dayOfMonth?: number | null;
    dayOfWeek?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    timezone?: string | null;
  } | null;
  extractedText?: string | null;
  categoryId?: string | null;
  categoryConfidence?: number | null;
}

export interface BudgetRecommendation {
  categoryId: string;
  categoryName: string;
  currentSpending: number;
  recommendedBudget: number;
  reasoning: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface SpendingInsights {
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  patterns: string[];
  suggestions: string[];
}

export interface AnomalyDetection {
  anomalies: Array<{
    transactionDate: string;
    category: string;
    amount: number;
    reason: string;
    severity: "low" | "medium" | "high";
  }>;
  summary: string;
}

export interface FinancialAdvice {
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
  }>;
  healthScore: number;
}
