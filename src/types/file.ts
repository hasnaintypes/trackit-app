import type { ImportError, ImportTransaction } from "./bulk-import";

export interface ParseResult {
  transactions: ImportTransaction[];
  errors: ImportError[];
}
