import type { Transaction } from "@/types/transaction";

export interface ImportTransaction extends Partial<Transaction> {
  categoryName?: string;
}

export interface BulkImportState {
  file: File | null;
  csvData: Record<string, string>[];
  columnMapping: Record<string, string>;
  parsedTransactions: ImportTransaction[];
  selectedAccountId: string | null;
  importProgress: number;
  totalToImport: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

export interface ImportError {
  rowIndex: number;
  field: string;
  message: string;
}

export interface CSVColumn {
  name: string;
  sampleValue: string;
}

export type TransactionField =
  | "skip"
  | "description"
  | "type"
  | "amount"
  | "date"
  | "category"
  | "notes"
  | "paymentMethod";

export type ColumnMapping = Record<string, TransactionField>;
