import type { Decimal } from "@prisma/client/runtime/client";

/**
 * Safely convert a Prisma Decimal (or number/string) to a JavaScript number.
 */
export function toNum(
  value: Decimal | number | string | null | undefined,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return Number(value) || 0;
}
