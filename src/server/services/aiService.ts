import { db } from "@/server/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";
import { createLogger } from "@/lib/logging";
import { toNum } from "@/lib/shared/decimal";
import { extractJsonFromAI } from "@/lib/shared/ai-utils";

const logger = createLogger("aiService");
import {
  BUDGET_RECOMMENDATION_TEMPLATE,
  SPENDING_INSIGHTS_TEMPLATE,
  ANOMALY_DETECTION_TEMPLATE,
  FINANCIAL_ADVICE_TEMPLATE,
  CATEGORY_PROMPT_TEMPLATE,
  RECEIPT_PROMPT_TEMPLATE,
} from "@/constants/prompt";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

import type { CategoryForAI } from "@/types/category";
import type {
  TransactionForAI,
  CategorizationResult,
  CategorizationResponse,
  ReceiptScanResult,
  BudgetRecommendation,
  SpendingInsights,
  AnomalyDetection,
  FinancialAdvice,
} from "@/types/ai";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey(): string {
  const apiKey = env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.",
    );
  }
  return apiKey;
}

function getModelName(): string {
  return env?.GEMINI_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
}

// Singleton GenAI client to avoid creating a new instance on every call
let _genAIInstance: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  _genAIInstance ??= new GoogleGenerativeAI(getApiKey());
  return _genAIInstance;
}

export class AIService {
  /**
   * Generate AI-powered budget recommendations
   */
  static async generateBudgetRecommendations(userId: string) {
    const transactions = await db.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 100,
    });

    const budgets = await db.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const categorySpending: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === "DEBIT" && t.category) {
        const amount = toNum(t.amount);
        categorySpending[t.category.name] =
          (categorySpending[t.category.name] ?? 0) + amount;
      }
    });

    const existingBudgets = budgets
      .map((b) => `${b.category.name}: $${toNum(b.amount)} ${b.period}`)
      .join("\n");

    const prompt = BUDGET_RECOMMENDATION_TEMPLATE.replace(
      "{{categorySpending}}",
      JSON.stringify(categorySpending, null, 2),
    ).replace("{{existingBudgets}}", existingBudgets || "No budgets set");

    const modelName = getModelName();
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return extractJsonFromAI<BudgetRecommendation[]>(text, "recommendations");
  }

  /**
   * Generate spending insights
   */
  static async generateSpendingInsights(userId: string, period: string) {
    const parts = period.split("-").map(Number);
    const year = parts[0];
    const month = parts[1];

    if (
      year === undefined ||
      month === undefined ||
      isNaN(year) ||
      isNaN(month)
    ) {
      throw new Error(`Invalid period format: ${period}. Expected YYYY-MM.`);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await db.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const totalSpent = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + toNum(t.amount), 0);

    const categoryBreakdown = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce(
        (acc, t) => {
          const category = t.category?.name ?? "Uncategorized";
          acc[category] = (acc[category] ?? 0) + toNum(t.amount);
          return acc;
        },
        {} as Record<string, number>,
      );

    const prompt = SPENDING_INSIGHTS_TEMPLATE.replace("{{period}}", period)
      .replace("{{totalSpent}}", totalSpent.toFixed(2))
      .replace(
        "{{categoryBreakdown}}",
        JSON.stringify(categoryBreakdown, null, 2),
      );

    const modelName = getModelName();
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return extractJsonFromAI<SpendingInsights>(text, "insights");
  }

  /**
   * Detect anomalous transactions
   */
  static async detectAnomalies(userId: string) {
    const transactions = await db.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 50,
    });

    const categoryStats: Record<
      string,
      { amounts: number[]; avg: number; stdDev: number }
    > = {};

    transactions.forEach((t) => {
      const category = t.category?.name ?? "Uncategorized";
      const amount = toNum(t.amount);

      categoryStats[category] ??= { amounts: [], avg: 0, stdDev: 0 };
      categoryStats[category]?.amounts.push(amount);
    });

    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category];
      if (!stats) return;

      const amounts = stats.amounts;
      if (amounts.length === 0) return;

      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance =
        amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        amounts.length;
      stats.avg = avg;
      stats.stdDev = Math.sqrt(variance);
    });

    const recentTransactions = transactions
      .slice(0, 10)
      .map(
        (t) =>
          `${t.date.toISOString().split("T")[0]} - ${t.category?.name ?? "Uncategorized"}: $${toNum(t.amount)} - ${t.description ?? "N/A"}`,
      )
      .join("\n");

    const categoryStatsFormatted = JSON.stringify(
      Object.entries(categoryStats).map(([cat, stats]) => ({
        category: cat,
        average: stats.avg.toFixed(2),
        stdDev: stats.stdDev.toFixed(2),
      })),
      null,
      2,
    );

    const prompt = ANOMALY_DETECTION_TEMPLATE.replace(
      "{{recentTransactions}}",
      recentTransactions,
    ).replace("{{categoryStats}}", categoryStatsFormatted);

    const modelName = getModelName();
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return extractJsonFromAI<AnomalyDetection>(text, "anomalies");
  }

  /**
   * Get personalized financial advice
   */
  static async getFinancialAdvice(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          take: 50,
          include: { category: true },
        },
        budgets: {
          include: { category: true },
        },
      },
    });

    if (!user) throw new Error("User not found");

    const totalIncome = user.transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + toNum(t.amount), 0);

    const totalExpenses = user.transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + toNum(t.amount), 0);

    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const prompt = FINANCIAL_ADVICE_TEMPLATE.replace(
      "{{totalIncome}}",
      totalIncome.toFixed(2),
    )
      .replace("{{totalExpenses}}", totalExpenses.toFixed(2))
      .replace("{{savingsRate}}", savingsRate.toFixed(1))
      .replace("{{budgetCount}}", user.budgets.length.toString());

    const modelName = getModelName();
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return extractJsonFromAI<FinancialAdvice>(text, "advice");
  }

  /**
   * Categorize transactions using Gemini AI
   */
  static async categorizeTransactionsWithAI(
    transactions: TransactionForAI[],
    categories: CategoryForAI[],
  ): Promise<CategorizationResponse> {
    const modelName = getModelName();

    const maxRows = Number(
      env?.GEMINI_MAX_ROWS ??
        process.env.GEMINI_MAX_ROWS ??
        process.env.NEXT_PUBLIC_GEMINI_MAX_ROWS ??
        50,
    );

    if (!transactions || transactions.length === 0) {
      return { results: [] };
    }

    if (transactions.length > maxRows) {
      throw new Error(
        `Cannot process ${transactions.length} transactions. Maximum allowed is ${maxRows}. Please reduce the file size or contact support.`,
      );
    }

    if (!categories || categories.length === 0) {
      throw new Error(
        "No categories available for AI categorization. Please create categories first.",
      );
    }

    const prompt = CATEGORY_PROMPT_TEMPLATE.replace(
      "{{categories}}",
      JSON.stringify(categories, null, 2),
    ).replace("{{transactions}}", JSON.stringify(transactions, null, 2));

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const geminiResponse = result.response;
        const text = geminiResponse.text();

        if (!text) {
          throw new Error("AI returned empty response");
        }

        const parsedResponse = this.parseAIResponse(text, transactions.length);
        return parsedResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (
          lastError.message.includes("Failed to parse") ||
          lastError.message.includes("Invalid response")
        ) {
          throw lastError;
        }

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw new Error(
      `Failed to categorize transactions after ${MAX_RETRIES} attempts: ${lastError?.message ?? "Unknown error"}`,
    );
  }

  /**
   * Scan a receipt and return structured fields
   */
  static async scanReceiptWithAI(options: {
    extractedText?: string | null;
    imageUrl?: string | null;
    categories?: CategoryForAI[] | null;
  }): Promise<ReceiptScanResult> {
    const modelName = getModelName();

    const inputText = options.extractedText ?? "";
    const imageUrl = options.imageUrl ?? "";

    let prompt = RECEIPT_PROMPT_TEMPLATE.replace(
      "{{inputText}}",
      inputText,
    ).replace("{{imageUrl}}", imageUrl);

    if (
      options.categories &&
      Array.isArray(options.categories) &&
      options.categories.length > 0
    ) {
      try {
        prompt = prompt.replace(
          "{{categories}}",
          JSON.stringify(options.categories, null, 2),
        );
      } catch (e) {
        logger.error("Failed to stringify categories for receipt scan prompt", {
          error: e instanceof Error ? e.message : String(e),
        });
        prompt = prompt.replace("{{categories}}", "[]");
      }
    } else {
      prompt = prompt.replace("{{categories}}", "[]");
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const geminiResponse = result.response;
        const text = geminiResponse.text();
        if (!text) throw new Error("AI returned empty response");

        const parsed = this.parseReceiptAIResponse(text);
        return parsed;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
      }
    }

    throw new Error(
      `Failed to scan receipt after ${MAX_RETRIES} attempts: ${lastError?.message ?? "Unknown"}`,
    );
  }

  private static parseAIResponse(
    text: string,
    expectedCount: number,
  ): CategorizationResponse {
    let jsonText = text.trim();

    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = codeBlockRegex.exec(jsonText);
    if (jsonMatch?.[1]) {
      jsonText = jsonMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonText) as unknown;

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Response is not an object");
      }

      let results: CategorizationResult[];

      if (Array.isArray(parsed)) {
        results = parsed.filter(
          (item: unknown): item is CategorizationResult => {
            if (!item || typeof item !== "object") return false;
            const obj = item as Record<string, unknown>;
            return (
              typeof obj.index === "number" &&
              typeof obj.categoryId === "string"
            );
          },
        );
      } else if (
        parsed &&
        "results" in parsed &&
        Array.isArray((parsed as Record<string, unknown>).results)
      ) {
        const parsedResults = (parsed as Record<string, unknown>)
          .results as unknown[];
        results = parsedResults.filter(
          (item: unknown): item is CategorizationResult => {
            if (!item || typeof item !== "object") return false;
            const obj = item as Record<string, unknown>;
            return (
              "index" in obj &&
              typeof obj.index === "number" &&
              "categoryId" in obj &&
              typeof obj.categoryId === "string"
            );
          },
        );
      } else {
        throw new Error("Response does not contain results array");
      }

      const validatedResults: CategorizationResult[] = [];
      const errors: Array<{ index: number; error: string }> = [];

      for (const result of results) {
        if (!result || typeof result !== "object") {
          continue;
        }

        if (typeof result.index !== "number" || result.index < 0) {
          errors.push({
            index: result.index ?? -1,
            error: "Invalid index",
          });
          continue;
        }

        if (typeof result.categoryId !== "string" || !result.categoryId) {
          errors.push({
            index: result.index,
            error: "Missing or invalid categoryId",
          });
          continue;
        }

        validatedResults.push({
          index: result.index,
          categoryId: result.categoryId,
          confidence:
            typeof result.confidence === "number"
              ? result.confidence
              : undefined,
        });
      }

      if (validatedResults.length === 0 && expectedCount > 0) {
        throw new Error("No valid categorization results found in AI response");
      }

      return {
        results: validatedResults,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown parsing error"}. Raw response: ${jsonText.substring(0, 200)}...`,
      );
    }
  }

  private static parseReceiptAIResponse(text: string): ReceiptScanResult {
    let jsonText = text.trim();
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = codeBlockRegex.exec(jsonText);
    if (jsonMatch?.[1]) jsonText = jsonMatch[1].trim();

    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (!parsed || typeof parsed !== "object")
        throw new Error("Parsed receipt response is not an object");

      const obj = parsed as Record<string, unknown>;

      const rawDescription =
        typeof obj.description === "string"
          ? obj.description.trim()
          : obj.description === null
            ? null
            : undefined;
      const merchant =
        typeof obj.merchant === "string"
          ? obj.merchant.trim()
          : obj.merchant === null
            ? null
            : undefined;
      const amount =
        typeof obj.amount === "string"
          ? obj.amount.trim()
          : obj.amount === null
            ? null
            : undefined;
      const date =
        typeof obj.date === "string"
          ? obj.date.trim()
          : obj.date === null
            ? null
            : undefined;

      let paymentMethod: string | null | undefined = undefined;
      if (typeof obj.paymentMethod === "string") {
        const pm = obj.paymentMethod.trim().toUpperCase();
        const pmMap: Record<string, string> = {
          VISA: "CARD",
          MASTERCARD: "CARD",
          AMEX: "CARD",
          CARD: "CARD",
          CASH: "CASH",
          "BANK TRANSFER": "BANK_TRANSFER",
          BANK_TRANSFER: "BANK_TRANSFER",
          TRANSFER: "BANK_TRANSFER",
          AUTO: "AUTO_DEBIT",
          "DIRECT DEBIT": "AUTO_DEBIT",
          AUTO_DEBIT: "AUTO_DEBIT",
          UPI: "UPI",
          OTHER: "OTHER",
        };
        paymentMethod =
          pmMap[pm] ?? (Object.values(pmMap).includes(pm) ? pm : null);
        if (paymentMethod === undefined) paymentMethod = null;
      } else if (obj.paymentMethod === null) {
        paymentMethod = null;
      }

      const isRecurring =
        typeof obj.isRecurring === "boolean" ? obj.isRecurring : false;

      let recurrence: ReceiptScanResult["recurrence"] = null;
      if (obj.recurrence && typeof obj.recurrence === "object") {
        const r = obj.recurrence as Record<string, unknown>;
        const validFrequencies = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
        recurrence = {
          frequency:
            typeof r.frequency === "string" &&
            validFrequencies.includes(r.frequency)
              ? (r.frequency as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")
              : null,
          interval: typeof r.interval === "number" ? r.interval : null,
          dayOfMonth: typeof r.dayOfMonth === "number" ? r.dayOfMonth : null,
          dayOfWeek: typeof r.dayOfWeek === "number" ? r.dayOfWeek : null,
          startDate: typeof r.startDate === "string" ? r.startDate : null,
          endDate: typeof r.endDate === "string" ? r.endDate : null,
          timezone: typeof r.timezone === "string" ? r.timezone : null,
        };
      }

      const extractedText =
        typeof obj.extractedText === "string"
          ? obj.extractedText
          : obj.extractedText === null
            ? null
            : undefined;

      const categoryId =
        typeof obj.categoryId === "string"
          ? obj.categoryId
          : obj.categoryId === null
            ? null
            : undefined;
      let categoryConfidence: number | null | undefined = undefined;
      if (typeof obj.categoryConfidence === "number") {
        let conf = Math.round(obj.categoryConfidence);
        if (conf < 0) conf = 0;
        if (conf > 100) conf = 100;
        categoryConfidence = conf;
      } else if (obj.categoryConfidence === null) {
        categoryConfidence = null;
      }

      let description: string | null | undefined = rawDescription;
      if (
        (description === undefined || description === null) &&
        extractedText
      ) {
        try {
          const lines = String(extractedText)
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
          if (merchant && merchant.length > 0) {
            const merchantIndex = lines.findIndex((l) =>
              l.toUpperCase().includes(merchant.toUpperCase()),
            );
            let candidate: string | undefined;
            if (merchantIndex >= 0) {
              for (let i = merchantIndex + 1; i < lines.length; i++) {
                const l = lines[i];
                if (!l) continue;
                if (/\$?\d+[.,]?\d{0,2}/.test(l) && /\d/.test(l)) {
                  candidate = l;
                  break;
                }
                if (
                  /\d+x\s+\w+/i.test(l) ||
                  !/\b(?:subtotal|total)\b/i.test(l)
                ) {
                  candidate = l;
                  break;
                }
              }
            }
            candidate ??= lines.find(
              (l) =>
                l !== merchant &&
                !/\d{3}\-\d{3}\-\d{4}/.test(l) &&
                !/\d{1,4}\s+\w+/.test(l),
            );
            if (candidate) {
              description = `${merchant} - ${candidate}`;
            } else {
              description = merchant;
            }
          } else {
            const candidate = lines.find(
              (l) => !/^(receipt|date|time|subtotal|total|thank you)/i.test(l),
            );
            description = candidate ?? null;
          }
        } catch (e) {
          logger.error("Failed to synthesize description from extracted text", {
            error: e instanceof Error ? e.message : String(e),
          });
          description = null;
        }
      }

      const result: ReceiptScanResult = {
        description:
          typeof description === "string"
            ? description
            : description === null
              ? null
              : undefined,
        merchant: merchant,
        amount: amount,
        date: date,
        paymentMethod:
          typeof paymentMethod === "string"
            ? paymentMethod
            : paymentMethod === null
              ? null
              : undefined,
        isRecurring,
        recurrence,
        extractedText:
          typeof extractedText === "string"
            ? extractedText
            : extractedText === null
              ? null
              : undefined,
        categoryId: categoryId,
        categoryConfidence:
          typeof categoryConfidence === "number"
            ? categoryConfidence
            : categoryConfidence === null
              ? null
              : undefined,
      };

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse receipt AI response: ${error instanceof Error ? error.message : String(error)}. Raw: ${jsonText.substring(0, 200)}...`,
      );
    }
  }
}
