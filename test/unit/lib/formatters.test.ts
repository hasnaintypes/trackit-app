import { describe, it, expect, vi } from "vitest";

// Mock @prisma/client enums used by formatters.ts so tests don't require
// a generated Prisma client.
vi.mock("@prisma/client", () => ({
  Currency: {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    JPY: "JPY",
    AUD: "AUD",
    CAD: "CAD",
    CHF: "CHF",
    CNY: "CNY",
    INR: "INR",
    SGD: "SGD",
    PKR: "PKR",
  },
  DateFormat: {
    MM_DD_YYYY: "MM_DD_YYYY",
    DD_MM_YYYY: "DD_MM_YYYY",
    YYYY_MM_DD: "YYYY_MM_DD",
  },
  CurrencyPosition: {
    BEFORE: "BEFORE",
    AFTER: "AFTER",
  },
  ThousandSeparator: {
    COMMA: "COMMA",
    SPACE: "SPACE",
    NONE: "NONE",
  },
}));

import { formatAmount, formatDate } from "@/lib/formatters";

describe("formatAmount", () => {
  it("formats USD with default options", () => {
    const result = formatAmount(1234.5, {});
    expect(result).toBe("$1,234.50");
  });

  it("formats amount with symbol after", () => {
    const result = formatAmount(1234.5, {
      currency: "EUR" as never,
      currencyPosition: "AFTER" as never,
    });
    expect(result).toBe("1,234.50 €");
  });

  it("returns --- for NaN input", () => {
    expect(formatAmount("abc", {})).toBe("---");
  });

  it("formats string amounts", () => {
    expect(formatAmount("42.5", {})).toBe("$42.50");
  });

  it("handles negative amounts", () => {
    const result = formatAmount(-500, {});
    expect(result).toBe("-$500.00");
  });

  it("respects decimalPlaces option", () => {
    const result = formatAmount(99.999, { decimalPlaces: 0 });
    expect(result).toBe("$100");
  });

  it("uses space as thousand separator", () => {
    const result = formatAmount(1000000, {
      thousandSeparator: "SPACE" as never,
    });
    expect(result).toBe("$1 000 000.00");
  });

  it("uses no separator when NONE", () => {
    const result = formatAmount(1000000, {
      thousandSeparator: "NONE" as never,
    });
    expect(result).toBe("$1000000.00");
  });

  it("compact mode abbreviates large numbers", () => {
    const result = formatAmount(1500000, { compactNumbers: true });
    expect(result).toContain("1.5M");
    expect(result).toContain("$");
  });

  it("compact mode with symbol after", () => {
    const result = formatAmount(2500, {
      compactNumbers: true,
      currency: "GBP" as never,
      currencyPosition: "AFTER" as never,
    });
    expect(result).toContain("£");
    expect(result).toMatch(/\d.*£/);
  });

  it("formats INR currency symbol", () => {
    const result = formatAmount(100, { currency: "INR" as never });
    expect(result).toBe("₹100.00");
  });

  it("formats PKR currency symbol", () => {
    const result = formatAmount(100, { currency: "PKR" as never });
    expect(result).toBe("₨100.00");
  });

  it("negative amount in compact mode", () => {
    const result = formatAmount(-1500, { compactNumbers: true });
    expect(result).toMatch(/^-\$/);
  });
});

describe("formatDate", () => {
  it("formats date in default MM/DD/YYYY", () => {
    const result = formatDate(new Date(2024, 0, 15));
    expect(result).toBe("01/15/2024");
  });

  it("formats date in DD/MM/YYYY", () => {
    const result = formatDate(
      new Date(2024, 0, 15),
      "DD_MM_YYYY" as never,
    );
    expect(result).toBe("15/01/2024");
  });

  it("formats date in YYYY-MM-DD", () => {
    const result = formatDate(
      new Date(2024, 0, 15),
      "YYYY_MM_DD" as never,
    );
    expect(result).toBe("2024-01-15");
  });

  it("formats string date input", () => {
    const result = formatDate("2024-06-01");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("returns --- for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("---");
  });
});
