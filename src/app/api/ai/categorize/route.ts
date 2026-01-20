import { NextResponse } from "next/server";
import {
  categorizeTransactionsWithAI,
  type TransactionForAI,
  type CategoryForAI,
} from "@/services/aiService";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const { transactions, categories } = body as {
      transactions: TransactionForAI[];
      categories: CategoryForAI[];
    };

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Missing or invalid transactions array" },
        { status: 400 },
      );
    }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "Missing or invalid categories array" },
        { status: 400 },
      );
    }

    const result = await categorizeTransactionsWithAI(transactions, categories);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("AI categorize route error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error from AI route";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
