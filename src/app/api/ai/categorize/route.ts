import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logging";
import { AIService } from "@/server/services/aiService";

export const dynamic = "force-dynamic";

const logger = createLogger("ai-categorize-route");
import type { TransactionForAI } from "@/types/ai";
import type { CategoryForAI } from "@/types/category";

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

    const result = await AIService.categorizeTransactionsWithAI(
      transactions,
      categories,
    );
    return NextResponse.json({ result });
  } catch (err) {
    logger.error("AI categorize route error", {
      error: err instanceof Error ? err.message : String(err),
    });
    const message =
      err instanceof Error ? err.message : "Unknown error from AI route";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
