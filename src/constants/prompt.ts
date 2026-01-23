/**
 * AI Prompt Templates
 *
 * This file contains prompt templates for various AI-powered features.
 * Each template should be well-structured with clear instructions and examples.
 */

export const CATEGORY_PROMPT_TEMPLATE = `You are an expert financial transaction categorization AI. Your task is to analyze transactions and assign the most appropriate category ID from the provided category list.

## Instructions:
1. Analyze each transaction's description, amount, and type carefully
2. Match transactions to categories based on:
   - Keywords in the description (e.g., "Walmart" → Groceries, "Shell" → Gas)
   - Transaction type (DEBIT/CREDIT/TRANSFER)
   - Amount patterns (e.g., large amounts might be rent, small amounts might be coffee)
3. **IMPORTANT**: Prefer subcategories over parent categories when available
4. If multiple categories match, choose the most specific one
5. Consider the transaction type when categorizing:
   - DEBIT/EXPENSE: Choose from EXPENSE type categories
   - CREDIT/INCOME: Choose from INCOME type categories
   - TRANSFER: Choose from TRANSFER type categories

## Categories Structure:
Categories can have subcategories. Subcategories are more specific and should be preferred.
Example:
- "Food & Dining" (parent) → "Restaurants", "Groceries", "Coffee Shops" (subcategories)
- "Transportation" (parent) → "Gas", "Public Transit", "Parking" (subcategories)

**Available Categories:**
{{categories}}

**Transactions to Categorize:**
{{transactions}}

## Output Format:
Respond with ONLY a valid JSON array (no markdown, no explanation). Each object must have:
- "index": The transaction index (0-based)
- "categoryId": The ID of the most appropriate category
- "confidence": Optional confidence score (0-100)

Example:
\`\`\`json
[
  { "index": 0, "categoryId": "clx1234abcd", "confidence": 95 },
  { "index": 1, "categoryId": "clx5678efgh", "confidence": 88 }
]
\`\`\`

**Now categorize all transactions and return the JSON array:**`;

// TODO: Add more AI prompt templates as features are developed
// Examples:
// - BUDGET_RECOMMENDATION_TEMPLATE: For AI budget suggestions
// - SPENDING_INSIGHTS_TEMPLATE: For AI spending analysis
// - ANOMALY_DETECTION_TEMPLATE: For unusual transaction detection
// - FINANCIAL_ADVICE_TEMPLATE: For personalized financial tips

// ============================================================================
// Receipt OCR / Autofill Prompt
// ============================================================================
export const RECEIPT_PROMPT_TEMPLATE = `You are an expert receipt parser and financial data extractor.

Given either extracted receipt text or an image URL (if text is not available), return a single JSON object (no markdown, no explanation) with the following shape:

{
   "description": string | null,
   "merchant": string | null,
   "amount": string | null,
   "date": string | null,
   "paymentMethod": string | null,
   "isRecurring": boolean,
   "recurrence": {
      "frequency": "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null,
      "interval": number | null,
      "dayOfMonth": number | null,
      "dayOfWeek": number | null,
      "startDate": string | null,
      "endDate": string | null,
      "timezone": string | null
   } | null,
   "extractedText": string | null
}

Input variables available: {{inputText}} (string, may be empty), {{imageUrl}} (string, may be empty).

   Optional context: {{categories}} (JSON array of available categories and subcategories). If provided, attempt to map the receipt to the most appropriate category id.

Rules:
1. Prefer values parsed from text. If a field is not present, use null.
2. If you can infer a human-friendly short 'description' from the receipt (for example: "Monthly Gym Membership", "Uber ride", "Grocery: Walmart"), set the 'description' field to that string. If you cannot, set 'description' to null.
3. Normalize amounts to a simple decimal string without currency symbols (e.g., "123.45").
4. Normalize dates to ISO (YYYY-MM-DD or full ISO). If only a month/day is available, try to infer year as the current year.
5. For paymentMethod, attempt to detect common keywords ("Visa", "Mastercard" -> CARD; "cash" -> CASH; "bank transfer" -> BANK_TRANSFER; "auto"/"standing"/"direct debit" -> AUTO_DEBIT; "UPI" -> UPI). Default to OTHER or null if unknown.
6. For recurrence detection, if the receipt explicitly mentions subscription, monthly, weekly, recurring, automatically, standing order, subscription ID, invoice frequency etc., set isRecurring=true and populate recurrence.frequency and day fields when you can infer them. If unsure, set isRecurring=false.
7. Return only JSON and nothing else.

Category mapping guidance:
- If \`{{categories}}\` is provided, it contains an array of category objects with \`id\`, \`name\`, \`type\` and optional \`subcategories\`. Attempt to match the receipt to the best-fitting category id. When you are confident, include two optional fields at the top level: \`categoryId\` (string) and \`categoryConfidence\` (number between 0 and 100). If you are not confident, omit \`categoryId\` or set it to null and/or supply a low confidence value.

Description guidance (priority):
- First, try to produce a short, human-friendly \`description\` value derived from merchant + main line items or the purchase intent (e.g., "Coffee & Croissant", "Gym Membership").
- If the model cannot confidently synthesize a concise description, set \`description\` to null. The consumer code will attempt a small fallback heuristic if \`description\` is null.

Example categories input (for clarity):
\`\`\`json
[
   { "id": "cat_food", "name": "Food & Dining", "type": "EXPENSE", "subcategories": [ { "id": "cat_coffee", "name": "Coffee Shops" }, { "id": "cat_groceries", "name": "Groceries" } ] },
   { "id": "cat_transport", "name": "Transportation", "type": "EXPENSE", "subcategories": [ { "id": "cat_gas", "name": "Gas" } ] }
]
\`\`\`

If \`{{categories}}\` is provided and you can confidently map this receipt to one of the category IDs, add the optional fields \`categoryId\` (string) and \`categoryConfidence\` (number 0-100) to the top-level JSON object.

Examples:
Input text: "ACME GYM\nMonthly Membership\nAmount: $49.00\nDate: 2025-02-01\nThanks for your subscription"
Output: {"description":"Monthly Membership","merchant":"ACME GYM","amount":"49.00","date":"2025-02-01","paymentMethod":null,"isRecurring":true,"recurrence":{"frequency":"MONTHLY","interval":1,"dayOfMonth":1,"dayOfWeek":null,"startDate":"2025-02-01","endDate":null,"timezone":null},"extractedText":"ACME GYM\nMonthly Membership\nAmount: $49.00\nDate: 2025-02-01\nThanks for your subscription"}

Now parse the input and return the JSON object.`;
