import { describe, it, expect } from "vitest";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionListInput,
  recurrenceSchema,
} from "@/validation/transaction";

describe("recurrenceSchema", () => {
  it("accepts valid daily recurrence", () => {
    const result = recurrenceSchema.safeParse({
      frequency: "DAILY",
      startDate: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all frequency types", () => {
    const frequencies = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
    for (const frequency of frequencies) {
      const result = recurrenceSchema.safeParse({
        frequency,
        startDate: "2024-01-01",
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid frequency", () => {
    const result = recurrenceSchema.safeParse({
      frequency: "HOURLY",
      startDate: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects interval less than 1", () => {
    const result = recurrenceSchema.safeParse({
      frequency: "DAILY",
      interval: 0,
      startDate: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("validates dayOfWeek range (0-6)", () => {
    expect(
      recurrenceSchema.safeParse({
        frequency: "WEEKLY",
        startDate: "2024-01-01",
        dayOfWeek: 0,
      }).success,
    ).toBe(true);
    expect(
      recurrenceSchema.safeParse({
        frequency: "WEEKLY",
        startDate: "2024-01-01",
        dayOfWeek: 7,
      }).success,
    ).toBe(false);
  });

  it("validates dayOfMonth range (1-31)", () => {
    expect(
      recurrenceSchema.safeParse({
        frequency: "MONTHLY",
        startDate: "2024-01-01",
        dayOfMonth: 1,
      }).success,
    ).toBe(true);
    expect(
      recurrenceSchema.safeParse({
        frequency: "MONTHLY",
        startDate: "2024-01-01",
        dayOfMonth: 32,
      }).success,
    ).toBe(false);
  });
});

describe("createTransactionSchema", () => {
  const validTransaction = {
    accountId: "acc_123",
    amount: "50.00",
    type: "DEBIT" as const,
  };

  it("accepts valid transaction", () => {
    const result = createTransactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it("rejects missing accountId", () => {
    const result = createTransactionSchema.safeParse({
      amount: "50.00",
      type: "DEBIT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive amount", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      amount: "-10",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      amount: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      amount: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all transaction types", () => {
    const types = ["DEBIT", "CREDIT", "TRANSFER"];
    for (const type of types) {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid transaction type", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      type: "REFUND",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all payment methods", () => {
    const methods = [
      "CARD",
      "CASH",
      "BANK_TRANSFER",
      "AUTO_DEBIT",
      "UPI",
      "OTHER",
    ];
    for (const paymentMethod of methods) {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        paymentMethod,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts optional nullable fields", () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      categoryId: null,
      description: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTransactionSchema", () => {
  it("requires id", () => {
    const result = updateTransactionSchema.safeParse({ amount: "50.00" });
    expect(result.success).toBe(false);
  });

  it("accepts partial update", () => {
    const result = updateTransactionSchema.safeParse({
      id: "txn_123",
      amount: "75.00",
    });
    expect(result.success).toBe(true);
  });
});

describe("transactionListInput", () => {
  it("accepts empty input with defaults", () => {
    const result = transactionListInput.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit below 1", () => {
    const result = transactionListInput.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 1000", () => {
    const result = transactionListInput.safeParse({ limit: 1001 });
    expect(result.success).toBe(false);
  });

  it("accepts search query", () => {
    const result = transactionListInput.safeParse({ q: "coffee" });
    expect(result.success).toBe(true);
  });

  it("accepts date range filters", () => {
    const result = transactionListInput.safeParse({
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(result.success).toBe(true);
  });
});
