/**
 * AI Service for Gemini-powered Transaction Categorization
 *
 * This service uses Google's Gemini AI to automatically categorize transactions
 * based on their description, amount, and type. It supports both parent categories
 * and subcategories for more accurate categorization.
 */

import { CATEGORY_PROMPT_TEMPLATE } from "../constants/prompt";
import { RECEIPT_PROMPT_TEMPLATE } from "../constants/prompt";
import { env } from "../env";
import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";

// ============================================================================
// Types
// ============================================================================

export interface CategoryForAI {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  parentCategoryId?: string | null;
  subcategories?: CategoryForAI[];
}

export interface TransactionForAI {
  index: number;
  description: string;
  amount: string;
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  date?: string;
  notes?: string;
}

export interface CategorizationResult {
  index: number;
  categoryId: string;
  confidence?: number;
}

export interface CategorizationResponse {
  results: CategorizationResult[];
  errors?: Array<{ index: number; error: string }>;
}

// Receipt scanning result
export interface ReceiptScanResult {
  description?: string | null;
  merchant?: string | null;
  amount?: string | null;
  date?: string | null;
  paymentMethod?: string | null;
  isRecurring?: boolean;
  recurrence?: {
    frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
    interval?: number | null;
    dayOfMonth?: number | null;
    dayOfWeek?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    timezone?: string | null;
  } | null;
  extractedText?: string | null;
  // Optional category mapping returned by the AI when categories were provided
  categoryId?: string | null;
  categoryConfidence?: number | null;
}

// ============================================================================
// Configuration
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ============================================================================
// Main Categorization Function
// ============================================================================

/**
 * Categorize transactions using Gemini AI
 *
 * @param transactions - Array of transactions to categorize
 * @param categories - Available categories with subcategories
 * @returns Promise with categorization results
 * @throws Error if API key is missing, row limit exceeded, or AI fails
 */
export async function categorizeTransactionsWithAI(
  transactions: TransactionForAI[],
  categories: CategoryForAI[],
): Promise<CategorizationResponse> {
  // Validate configuration
  // Prefer server-side `env` values, but fall back to process.env (including NEXT_PUBLIC_ values)
  const apiKey =
    env?.GEMINI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please set GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.",
    );
  }

  const modelName =
    env?.GEMINI_MODEL ??
    process.env.GEMINI_MODEL ??
    process.env.NEXT_PUBLIC_GEMINI_MODEL ??
    "gemini-pro";

  const maxRows = Number(
    env?.GEMINI_MAX_ROWS ??
      process.env.GEMINI_MAX_ROWS ??
      process.env.NEXT_PUBLIC_GEMINI_MAX_ROWS ??
      50,
  );

  // Validate input
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

  // Build the prompt
  const prompt = buildPrompt(transactions, categories);

  // Call Gemini with retry logic
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // @google/generative-ai package doesn't have proper TypeScript types yet
      // Type assertion is necessary for external API interaction
      const genAI = new GoogleGenerativeAI(apiKey) as unknown as {
        getGenerativeModel: (params: { model: string }) => GenerativeModel;
      };
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const geminiResponse = result.response;
      const text = geminiResponse.text();

      if (!text) {
        throw new Error("AI returned empty response");
      }

      // Parse and validate the response
      const parsedResponse = parseAIResponse(text, transactions.length);
      return parsedResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      if (
        lastError.message.includes("Failed to parse") ||
        lastError.message.includes("Invalid response")
      ) {
        throw lastError;
      }

      // Wait before retry (except on last attempt)
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(
    `Failed to categorize transactions after ${MAX_RETRIES} attempts: ${lastError?.message ?? "Unknown error"}`,
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build the prompt for Gemini AI
 */
function buildPrompt(
  transactions: TransactionForAI[],
  categories: CategoryForAI[],
): string {
  return CATEGORY_PROMPT_TEMPLATE.replace(
    "{{categories}}",
    JSON.stringify(categories, null, 2),
  ).replace("{{transactions}}", JSON.stringify(transactions, null, 2));
}

/**
 * Parse and validate the AI response
 */
function parseAIResponse(
  text: string,
  expectedCount: number,
): CategorizationResponse {
  // Try to extract JSON from markdown code blocks if present
  let jsonText = text.trim();

  // Remove markdown code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const jsonMatch = codeBlockRegex.exec(jsonText);
  if (jsonMatch?.[1]) {
    jsonText = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonText) as unknown;

    // Validate response structure
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Response is not an object");
    }

    // Handle both array format and object format
    let results: CategorizationResult[];

    if (Array.isArray(parsed)) {
      // Validate that it's an array of the right shape
      results = parsed.filter((item: unknown): item is CategorizationResult => {
        if (!item || typeof item !== "object") return false;
        const obj = item as Record<string, unknown>;
        return (
          typeof obj.index === "number" && typeof obj.categoryId === "string"
        );
      });
    } else if ("results" in parsed && Array.isArray(parsed.results)) {
      const parsedResults = parsed.results as unknown[];
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

    // Validate each result
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
          typeof result.confidence === "number" ? result.confidence : undefined,
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

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Receipt scanning / autofill
// ============================================================================

/**
 * Scan a receipt (either extracted text or image URL) and return structured fields
 */
export async function scanReceiptWithAI(options: {
  extractedText?: string | null;
  imageUrl?: string | null;
  categories?: CategoryForAI[] | null;
}): Promise<ReceiptScanResult> {
  const apiKey =
    env?.GEMINI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is not configured");

  const modelName =
    env?.GEMINI_MODEL ??
    process.env.GEMINI_MODEL ??
    process.env.NEXT_PUBLIC_GEMINI_MODEL ??
    "gemini-pro";

  // Build prompt
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
      console.error(
        "Failed to stringify categories for receipt scan prompt",
        e,
      );
      prompt = prompt.replace("{{categories}}", "[]");
    }
  } else {
    prompt = prompt.replace("{{categories}}", "[]");
  }

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey) as unknown as {
        getGenerativeModel: (params: { model: string }) => GenerativeModel;
      };
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const geminiResponse = result.response;
      const text = geminiResponse.text();
      if (!text) throw new Error("AI returned empty response");

      const parsed = parseReceiptAIResponse(text);
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

function parseReceiptAIResponse(text: string): ReceiptScanResult {
  let jsonText = text.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const jsonMatch = codeBlockRegex.exec(jsonText);
  if (jsonMatch?.[1]) jsonText = jsonMatch[1].trim();

  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!parsed || typeof parsed !== "object")
      throw new Error("Parsed receipt response is not an object");

    const obj = parsed as Record<string, unknown>;
    // Normalize and validate parsed fields
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

    // Normalize paymentMethod to allowed enum values or null
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

    // Normalize recurrence object
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

    // Category fields
    const categoryId =
      typeof obj.categoryId === "string"
        ? obj.categoryId
        : obj.categoryId === null
          ? null
          : undefined;
    let categoryConfidence: number | null | undefined = undefined;
    if (typeof obj.categoryConfidence === "number") {
      // Clamp to 0-100
      let conf = Math.round(obj.categoryConfidence);
      if (conf < 0) conf = 0;
      if (conf > 100) conf = 100;
      categoryConfidence = conf;
    } else if (obj.categoryConfidence === null) {
      categoryConfidence = null;
    }

    // Synthesize a small fallback description if AI didn't provide one and extractedText is available
    let description: string | null | undefined = rawDescription;
    if ((description === undefined || description === null) && extractedText) {
      try {
        const lines = String(extractedText)
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        // Use merchant line if present, otherwise try to pick first line that looks like an item or product
        if (merchant && merchant.length > 0) {
          // find first line after merchant that contains a price or item marker
          const merchantIndex = lines.findIndex((l) =>
            l.toUpperCase().includes(merchant.toUpperCase()),
          );
          let candidate: string | undefined;
          if (merchantIndex >= 0) {
            for (let i = merchantIndex + 1; i < lines.length; i++) {
              const l = lines[i];
              if (!l) continue;
              if (/\$?\d+[.,]?\d{0,2}/.test(l) && /\d/.test(l)) {
                // contains a number - likely item/price
                candidate = l;
                break;
              }
              if (/\d+x\s+\w+/i.test(l) || !/\b(?:subtotal|total)\b/i.test(l)) {
                candidate = l;
                break;
              }
            }
          }
          // Fallback to first non-merchant non-address line
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
          // No merchant; pick first meaningful line (e.g., line with product or words)
          const candidate = lines.find(
            (l) => !/^(receipt|date|time|subtotal|total|thank you)/i.test(l),
          );
          description = candidate ?? null;
        }
      } catch (e) {
        console.error(
          "Failed to synthesize description from extracted text",
          e,
        );
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
    } as ReceiptScanResult;

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse receipt AI response: ${error instanceof Error ? error.message : String(error)}. Raw: ${jsonText.substring(0, 200)}...`,
    );
  }
}
