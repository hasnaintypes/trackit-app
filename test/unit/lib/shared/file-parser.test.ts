import { describe, it, expect } from "vitest";
import {
  parseCSVText,
  validateAndParseTransactions,
} from "@/lib/shared/file-parser";
import type { ColumnMapping } from "@/types/bulk-import";

describe("parseCSVText", () => {
  it("parses simple CSV data", () => {
    const csv = `name,amount,date
Coffee,5.00,2024-01-15
Lunch,12.50,2024-01-16`;
    const result = parseCSVText(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "Coffee",
      amount: "5.00",
      date: "2024-01-15",
    });
  });

  it("handles quoted values with commas", () => {
    const csv = `desc,amount
"Coffee, large",5.00`;
    const result = parseCSVText(csv);
    expect(result[0]!.desc).toBe("Coffee, large");
  });

  it("handles escaped quotes", () => {
    const csv = `desc,amount
"He said ""hello""",5.00`;
    const result = parseCSVText(csv);
    expect(result[0]!.desc).toBe('He said "hello"');
  });

  it("returns empty array for empty string", () => {
    expect(parseCSVText("")).toEqual([]);
  });

  it("returns empty array for header-only CSV", () => {
    expect(parseCSVText("name,amount")).toEqual([]);
  });

  it("skips blank lines", () => {
    const csv = `name,amount
Coffee,5.00

Lunch,12.50`;
    const result = parseCSVText(csv);
    expect(result).toHaveLength(2);
  });
});

describe("validateAndParseTransactions", () => {
  const baseMapping: ColumnMapping = {
    Description: "description",
    Amount: "amount",
    Type: "type",
    Date: "date",
  };

  it("parses valid transaction rows", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "2024-01-15",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.transactions[0]!.description).toBe("Coffee");
    expect(result.transactions[0]!.amount).toBe("5.00");
    expect(result.transactions[0]!.type).toBe("DEBIT");
  });

  it("maps type aliases correctly", () => {
    const cases = [
      { input: "expense", expected: "DEBIT" },
      { input: "income", expected: "CREDIT" },
      { input: "in", expected: "CREDIT" },
      { input: "out", expected: "DEBIT" },
      { input: "transfer", expected: "TRANSFER" },
    ];

    for (const { input, expected } of cases) {
      const result = validateAndParseTransactions(
        [
          {
            Description: "Test",
            Amount: "10.00",
            Type: input,
            Date: "2024-01-15",
          },
        ],
        baseMapping,
      );
      expect(result.transactions[0]!.type).toBe(expected);
    }
  });

  it("returns errors for invalid type", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "invalid",
        Date: "2024-01-15",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("type");
  });

  it("returns errors for missing description", () => {
    const csvData = [
      { Description: "", Amount: "5.00", Type: "debit", Date: "2024-01-15" },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("description");
  });

  it("returns errors for invalid amount", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "abc",
        Type: "debit",
        Date: "2024-01-15",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("amount");
  });

  it("handles currency symbols in amounts", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "$5.00",
        Type: "debit",
        Date: "2024-01-15",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]!.amount).toBe("5.00");
  });

  it("handles parentheses for negative amounts", () => {
    const csvData = [
      {
        Description: "Refund",
        Amount: "(100.00)",
        Type: "credit",
        Date: "2024-01-15",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]!.amount).toBe("-100.00");
  });

  it("returns errors for invalid date", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "not-a-date",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.field).toBe("date");
  });

  it("parses US date format MM/DD/YYYY", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "01/15/2024",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]!.date).toContain("2024");
  });

  it("parses text date format", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "January 15, 2024",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions).toHaveLength(1);
  });

  it("skips columns mapped to 'skip'", () => {
    const mapping: ColumnMapping = {
      Description: "description",
      Amount: "amount",
      Type: "type",
      Date: "date",
      Extra: "skip",
    };
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "2024-01-15",
        Extra: "ignored",
      },
    ];
    const result = validateAndParseTransactions(csvData, mapping);
    expect(result.transactions).toHaveLength(1);
  });

  it("parses optional category and notes fields", () => {
    const mapping: ColumnMapping = {
      Description: "description",
      Amount: "amount",
      Type: "type",
      Date: "date",
      Category: "category",
      Notes: "notes",
    };
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "2024-01-15",
        Category: "Food",
        Notes: "Morning brew",
      },
    ];
    const result = validateAndParseTransactions(csvData, mapping);
    expect(result.transactions[0]!.categoryName).toBe("Food");
    expect(result.transactions[0]!.notes).toBe("Morning brew");
  });

  it("sets isRecurring default to false", () => {
    const csvData = [
      {
        Description: "Coffee",
        Amount: "5.00",
        Type: "debit",
        Date: "2024-01-15",
      },
    ];
    const result = validateAndParseTransactions(csvData, baseMapping);
    expect(result.transactions[0]!.isRecurring).toBe(false);
  });
});
