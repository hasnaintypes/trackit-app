import Handlebars from "handlebars";
import { getTemplate } from "@/lib/email/template-cache";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface SendTemplateEmailOptions {
  to: string;
  subject: string;
  template:
    | "budget-alert"
    | "monthly-summary"
    | "weekly-digest"
    | "transaction-alert"
    | "verification"
    | "password-reset";
  data: Record<string, unknown>;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from)
    throw new Error("Missing RESEND_API_KEY or EMAIL_FROM env variable");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
}

/**
 * Send an email using a template
 */
export async function sendTemplateEmail({
  to,
  subject,
  template,
  data,
}: SendTemplateEmailOptions): Promise<void> {
  // Load template from cache
  const templateContent = await getTemplate(`${template}.html`);

  // Compile template with Handlebars
  const compiledTemplate = Handlebars.compile(templateContent);

  // Add app URL to data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const templateData = {
    ...data,
    appUrl,
  };

  // Render HTML
  const html = compiledTemplate(templateData);

  // Send email
  await sendEmail({ to, subject, html });
}

/**
 * Helper functions for specific email types
 */
export async function sendBudgetAlert(
  to: string,
  data: {
    userName: string;
    categoryName: string;
    percentage: number;
    spent: number;
    limit: number;
    remaining: number;
  },
) {
  await sendTemplateEmail({
    to,
    subject: `Budget Alert: ${data.categoryName} at ${data.percentage}%`,
    template: "budget-alert",
    data,
  });
}

export async function sendMonthlySummary(
  to: string,
  data: {
    userName: string;
    period: string;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    netSavingsColor: string;
    topCategories: Array<{ name: string; amount: number }>;
  },
) {
  await sendTemplateEmail({
    to,
    subject: `Monthly Summary - ${data.period}`,
    template: "monthly-summary",
    data,
  });
}

export async function sendWeeklyDigest(
  to: string,
  data: {
    userName: string;
    weekRange: string;
    weeklyTotal: number;
    changeText: string;
    transactionCount: number;
    topCategory: string;
  },
) {
  await sendTemplateEmail({
    to,
    subject: `Weekly Digest - ${data.weekRange}`,
    template: "weekly-digest",
    data,
  });
}

export async function sendTransactionAlert(
  to: string,
  data: {
    userName: string;
    amount: number;
    description: string;
    date: string;
    category: string;
  },
) {
  await sendTemplateEmail({
    to,
    subject: `Large Transaction Alert: $${data.amount}`,
    template: "transaction-alert",
    data,
  });
}
