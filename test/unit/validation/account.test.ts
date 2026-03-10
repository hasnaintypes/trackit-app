import { describe, it, expect } from "vitest";
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdParam,
} from "@/validation/account";

describe("createAccountSchema", () => {
  it("accepts valid account data", () => {
    const result = createAccountSchema.safeParse({
      name: "Savings",
      type: "BANK",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all account types", () => {
    const types = ["BANK", "CASH", "CREDIT", "INVESTMENT", "LOAN", "OTHER"];
    for (const type of types) {
      const result = createAccountSchema.safeParse({ name: "Acct", type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid account type", () => {
    const result = createAccountSchema.safeParse({
      name: "Acct",
      type: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createAccountSchema.safeParse({ name: "", type: "BANK" });
    expect(result.success).toBe(false);
  });

  it("accepts valid currency", () => {
    const result = createAccountSchema.safeParse({
      name: "Acct",
      type: "BANK",
      currency: "USD",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid currency", () => {
    const result = createAccountSchema.safeParse({
      name: "Acct",
      type: "BANK",
      currency: "XYZ",
    });
    expect(result.success).toBe(false);
  });

  it("transforms numeric balance to string", () => {
    const result = createAccountSchema.safeParse({
      name: "Acct",
      type: "BANK",
      balance: 1000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balance).toBe("1000");
    }
  });
});

describe("updateAccountSchema", () => {
  it("requires id field", () => {
    const result = updateAccountSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(false);
  });

  it("accepts partial updates with id", () => {
    const result = updateAccountSchema.safeParse({
      id: "abc123",
      name: "Updated",
    });
    expect(result.success).toBe(true);
  });
});

describe("accountIdParam", () => {
  it("accepts valid id", () => {
    const result = accountIdParam.safeParse({ id: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = accountIdParam.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });
});
