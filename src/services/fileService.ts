/**
 * File Service
 * Handles CSV parsing and transaction validation
 */

import type { ColumnMapping, ImportError } from "@/types/bulk-import";
import type { Transaction } from "@/types/transaction";

const TRANSACTION_TYPE_MAP: Record<string, "DEBIT" | "CREDIT" | "TRANSFER"> = {
  debit: "DEBIT",
  credit: "CREDIT",
  transfer: "TRANSFER",
  expense: "DEBIT",
  income: "CREDIT",
  in: "CREDIT",
  out: "DEBIT",
};

interface ParseResult {
  transactions: Partial<Transaction>[];
  errors: ImportError[];
}

export async function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  return parseCSVText(text);
}

export function parseCSVText(text: string): Record<string, unknown>[] {
  const lines = text.trim().split("\n");

  if (lines.length === 0) {
    return [];
  }

  // Parse header
  const headerLine = lines[0];
  if (!headerLine) {
    return [];
  }
  const headers = parseCSVLine(headerLine);

  if (headers.length === 0) {
    return [];
  }

  // Parse data rows
  const data: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = parseCSVLine(line);

    // Skip empty lines
    if (values.length === 0 || values.every((v) => !v)) {
      continue;
    }

    // Create object for this row
    const row: Record<string, unknown> = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (header) {
        row[header] = values[j] ?? "";
      }
    }

    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

export function validateAndParseTransactions(
  csvData: Record<string, unknown>[],
  mapping: ColumnMapping,
): ParseResult {
  const transactions: Partial<Transaction>[] = [];
  const errors: ImportError[] = [];

  csvData.forEach((row, rowIndex) => {
    const transaction: Partial<Transaction> = {};
    const rowErrors: Omit<ImportError, "rowIndex">[] = [];

    // Parse each mapped field
    Object.entries(mapping).forEach(([csvCol, field]) => {
      if (field === "skip") return;

      const value = row[csvCol];

      try {
        switch (field) {
          case "description":
            if (!value || typeof value !== "string" || value.trim() === "") {
              rowErrors.push({
                field: "description",
                message:
                  "Description is required and must be a non-empty string",
              });
            } else {
              transaction.description = value.trim();
            }
            break;

          case "type": {
            const valueStr =
              typeof value === "string"
                ? value
                : typeof value === "number"
                  ? String(value)
                  : "";
            const typeStr = valueStr.toLowerCase().trim();
            const mappedType = TRANSACTION_TYPE_MAP[typeStr];
            if (!mappedType) {
              rowErrors.push({
                field: "type",
                message: `Invalid type: "${valueStr}". Must be: Debit, Credit, or Transfer`,
              });
            } else {
              transaction.type = mappedType;
            }
            break;
          }

          case "amount":
            const amount = parseAmount(String(value).trim());
            if (amount === null) {
              rowErrors.push({
                field: "amount",
                message: "Amount must be a valid number",
              });
            } else {
              transaction.amount = amount;
            }
            break;

          case "date":
            const date = parseDate(String(value).trim());
            if (!date) {
              rowErrors.push({
                field: "date",
                message:
                  "Invalid date format. Use YYYY-MM-DD or common formats",
              });
            } else {
              transaction.date = date;
            }
            break;

          case "category":
            if (value && typeof value === "string" && value.trim() !== "") {
              // Store the category name, will be resolved to ID later
              (transaction as Record<string, unknown>).categoryName =
                value.trim();
            }
            break;

          case "notes":
            if (value && typeof value === "string" && value.trim() !== "") {
              transaction.notes = value.trim();
            }
            break;

          case "paymentMethod":
            // Store in notes for now if payment method field not available
            if (value && typeof value === "string" && value.trim() !== "") {
              transaction.notes = transaction.notes
                ? `${transaction.notes} [${value.trim()}]`
                : `[${value.trim()}]`;
            }
            break;
        }
      } catch (err) {
        rowErrors.push({
          field,
          message: err instanceof Error ? err.message : "Validation error",
        });
      }
    });

    // Add row errors
    rowErrors.forEach((err) => {
      errors.push({
        rowIndex,
        ...err,
      });
    });

    // Only add transaction if no errors for this row
    if (rowErrors.length === 0) {
      // Set defaults for required fields if not provided
      transaction.isRecurring ??= false;
      transactions.push(transaction);
    }
  });

  return { transactions, errors };
}

/**
 * Parse amount string to decimal string
 */
function parseAmount(value: string): string | null {
  // Remove common currency symbols and whitespace
  let cleaned = value
    .replace(/[$€£¥₹]/g, "")
    .replace(/\s/g, "")
    .trim();

  // Handle parentheses for negative numbers (accounting format)
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = "-" + cleaned.slice(1, -1);
  }

  // Parse as number
  const num = parseFloat(cleaned);

  // Validate
  if (isNaN(num)) {
    return null;
  }

  // Return as string with 2 decimal places
  return num.toFixed(2);
}

/**
 * Parse date string to ISO format
 */
function parseDate(value: string): string | null {
  // Try various date formats
  const formats = [
    // ISO format
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // US format
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    // EU format
    /^(\d{2})-(\d{2})-(\d{4})$/,
    // Text format
    /^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/,
  ];

  for (const format of formats) {
    const match = value.match(format);
    if (match) {
      try {
        let year = 0;
        let month = 0;
        let day = 0;

        if (format === formats[0]) {
          // ISO: YYYY-MM-DD
          const matched = match.map(Number);
          year = matched[1] ?? 0;
          month = matched[2] ?? 0;
          day = matched[3] ?? 0;
        } else if (format === formats[1]) {
          // US: MM/DD/YYYY
          const matched = match.map(Number);
          month = matched[1] ?? 0;
          day = matched[2] ?? 0;
          year = matched[3] ?? 0;
        } else if (format === formats[2]) {
          // EU: DD-MM-YYYY
          const matched = match.map(Number);
          day = matched[1] ?? 0;
          month = matched[2] ?? 0;
          year = matched[3] ?? 0;
        } else if (format === formats[3]) {
          // Text: Month DD, YYYY
          const monthStr = match[1];
          day = Number(match[2]) || 0;
          year = Number(match[3]) || 0;
          const monthMap: Record<string, number> = {
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
            july: 7,
            august: 8,
            september: 9,
            october: 10,
            november: 11,
            december: 12,
          };
          month =
            monthStr && typeof monthStr === "string"
              ? (monthMap[monthStr.toLowerCase()] ?? 0)
              : 0;
        } else {
          continue;
        }

        // Validate date
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          continue;
        }

        const date = new Date(year, month - 1, day);
        if (date.getMonth() !== month - 1) {
          // Invalid day for month
          continue;
        }

        return date.toISOString();
      } catch {
        continue;
      }
    }
  }

  return null;
}
