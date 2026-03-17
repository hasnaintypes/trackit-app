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

export const BUDGET_RECOMMENDATION_TEMPLATE = `You are an expert financial advisor AI specializing in budget planning and optimization.

Analyze the following user's spending data and existing budgets, then provide personalized budget recommendations to help them manage their finances better.

## Current Spending Data (last 100 transactions):
{{categorySpending}}

## Existing Budgets:
{{existingBudgets}}

## Instructions:
1. Analyze spending patterns across all categories
2. Identify categories where budgets should be created or adjusted
3. Consider spending trends and variations
4. Recommend realistic budget amounts based on actual spending
5. Explain WHY each budget recommendation makes sense

## Output Format:
Return ONLY a valid JSON array (no markdown, no explanation) with 3-5 recommendations:

\`\`\`json
[
  {
    "category": "Category Name",
    "amount": 500,
    "period": "MONTHLY",
    "reason": "Clear explanation of why this budget makes sense"
  }
]
\`\`\`

**Provide actionable, realistic budget recommendations:**`;

export const SPENDING_INSIGHTS_TEMPLATE = `You are a financial data analyst AI. Analyze the user's monthly spending and provide actionable insights.

## Period: {{period}}
## Total Spent: \${{totalSpent}}

## Category Breakdown:
{{categoryBreakdown}}

## Instructions:
1. Identify the top 3 spending categories with their percentages
2. Detect notable spending patterns or trends
3. Provide 2-3 specific, actionable suggestions to optimize spending
4. Be concise but informative

## Output Format:
Return ONLY valid JSON (no markdown):

\`\`\`json
{
  "topCategories": [
    {
      "name": "Category Name",
      "amount": 1234.56,
      "percentage": 45.2
    }
  ],
  "patterns": [
    "Notable pattern or trend observation",
    "Another observation"
  ],
  "suggestions": [
    "Specific actionable suggestion to reduce spending",
    "Another practical tip"
  ]
}
\`\`\`

**Provide data-driven insights:**`;

export const ANOMALY_DETECTION_TEMPLATE = `You are a fraud detection and spending analysis AI. Identify unusual or anomalous transactions that deviate from normal spending patterns.

## Recent Transactions (last 10):
{{recentTransactions}}

## Category Statistics (average and standard deviation):
{{categoryStats}}

## Instructions:
1. Identify transactions that are significantly higher than usual for their category (>2 standard deviations)
2. Look for duplicate transactions that might indicate errors
3. Flag suspicious merchants or unusual spending patterns
4. Assess severity: "low" (minor deviation), "medium" (notable anomaly), "high" (potential fraud)

## Output Format:
Return ONLY valid JSON (no markdown):

\`\`\`json
{
  "anomalies": [
    {
      "transactionDate": "2026-01-24",
      "category": "Category Name",
      "amount": 500.00,
      "reason": "Specific explanation of why this is unusual",
      "severity": "high"
    }
  ],
  "summary": "Overall assessment of spending anomalies"
}
\`\`\`

**If no anomalies detected, return empty anomalies array with appropriate summary.**

**Detect unusual spending:**`;

export const FINANCIAL_ADVICE_TEMPLATE = `You are a certified financial advisor AI providing personalized financial wellness tips.

## User Financial Overview:
- **Total Income (last 50 transactions):** \${{totalIncome}}
- **Total Expenses (last 50 transactions):** \${{totalExpenses}}
- **Savings Rate:** {{savingsRate}}%
- **Active Budgets:** {{budgetCount}}

## Instructions:
1. Provide 3-5 personalized financial tips based on the data
2. Focus on practical, actionable advice
3. Prioritize recommendations (high/medium/low priority)
4. Cover areas like:
   - Savings optimization
   - Budget adherence strategies
   - Spending reduction opportunities
   - Emergency fund building
   - Investment opportunities (if savings rate is healthy)

## Output Format:
Return ONLY a valid JSON array (no markdown):

\`\`\`json
[
  {
    "tip": "Specific actionable financial advice",
    "priority": "high",
    "category": "Savings|Budgeting|Spending|Investment"
  }
]
\`\`\`

**Provide personalized financial guidance:**`;

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
