/**
 * OFX/QFX Bank File Parser
 *
 * OFX (Open Financial Exchange) is an SGML-based format used by banks
 * for exporting transaction data. QFX is Quicken's variant with the
 * same structure. This parser extracts transaction blocks via regex
 * since OFX is not valid XML.
 */

import type { ImportTransaction } from "@/types/bulk-import";

/** Map OFX transaction types to our internal types */
const OFX_TYPE_MAP: Record<string, "DEBIT" | "CREDIT" | "TRANSFER"> = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
  DEP: "CREDIT",
  INT: "CREDIT",
  DIV: "CREDIT",
  SRVCHG: "DEBIT",
  FEE: "DEBIT",
  PAYMENT: "DEBIT",
  CASH: "DEBIT",
  DIRECTDEP: "CREDIT",
  DIRECTDEBIT: "DEBIT",
  REPEATPMT: "DEBIT",
  CHECK: "DEBIT",
  POS: "DEBIT",
  ATM: "DEBIT",
  XFER: "TRANSFER",
  OTHER: "DEBIT",
};

/**
 * Extract a tag value from an OFX transaction block.
 * OFX tags are like `<TAGNAME>value` (no closing tag for leaf elements).
 */
function extractTag(block: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, "i");
  const match = block.match(regex);
  return match?.[1]?.trim() ?? null;
}

/**
 * Parse OFX date format (YYYYMMDD or YYYYMMDDHHMMSS[.XXX:TZ]) to ISO string.
 */
function parseOFXDate(dateStr: string): string | null {
  // Strip timezone info like [0:GMT] or [-5:EST]
  const cleaned = dateStr.replace(/\[.*\]/, "").trim();

  if (cleaned.length < 8) return null;

  const year = parseInt(cleaned.slice(0, 4), 10);
  const month = parseInt(cleaned.slice(4, 6), 10);
  const day = parseInt(cleaned.slice(6, 8), 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1) return null;

  return date.toISOString();
}

/**
 * Parse an OFX/QFX file and return an array of ImportTransaction objects.
 */
export async function parseOFX(file: File): Promise<ImportTransaction[]> {
  const text = await file.text();

  // Extract all STMTTRN blocks
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  const transactions: ImportTransaction[] = [];
  let match: RegExpExecArray | null;

  while ((match = transactionRegex.exec(text)) !== null) {
    const block = match[1];
    if (!block) continue;

    const trnType = extractTag(block, "TRNTYPE");
    const dtPosted = extractTag(block, "DTPOSTED");
    const trnAmt = extractTag(block, "TRNAMT");
    const name = extractTag(block, "NAME");
    const memo = extractTag(block, "MEMO");

    // Amount is required
    if (!trnAmt) continue;

    const amount = parseFloat(trnAmt);
    if (isNaN(amount)) continue;

    // Determine type from TRNTYPE or amount sign
    let type: "DEBIT" | "CREDIT" | "TRANSFER" = amount < 0 ? "DEBIT" : "CREDIT";
    if (trnType) {
      type = OFX_TYPE_MAP[trnType.toUpperCase()] ?? type;
    }

    // Build description from NAME and/or MEMO
    const description = name ?? memo ?? "OFX Transaction";
    const notes = name && memo && memo !== name ? memo : undefined;

    // Parse date
    const date = dtPosted ? parseOFXDate(dtPosted) : null;

    const transaction: ImportTransaction = {
      description,
      type,
      amount: Math.abs(amount).toFixed(2),
      isRecurring: false,
    };

    if (date) transaction.date = date;
    if (notes) transaction.notes = notes;

    transactions.push(transaction);
  }

  return transactions;
}
