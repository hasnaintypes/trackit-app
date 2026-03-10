import { describe, it, expect } from "vitest";
import { toNum } from "@/lib/shared/decimal";

describe("toNum", () => {
  it("returns 0 for null", () => {
    expect(toNum(null)).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(toNum(undefined)).toBe(0);
  });

  it("returns the number as-is when passed a number", () => {
    expect(toNum(42)).toBe(42);
    expect(toNum(0)).toBe(0);
    expect(toNum(-5.5)).toBe(-5.5);
  });

  it("parses string values", () => {
    expect(toNum("123.45")).toBe(123.45);
    expect(toNum("0")).toBe(0);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(toNum("abc")).toBe(0);
    expect(toNum("")).toBe(0);
  });

  it("handles objects with toNumber method (Prisma Decimal)", () => {
    const fakeDecimal = { toNumber: () => 99.99 };
    expect(toNum(fakeDecimal as never)).toBe(99.99);
  });
});
