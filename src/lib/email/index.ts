import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { getTemplate } from "@/lib/email/template-cache";
import { env } from "@/env";
import { createLogger } from "@/lib/logging";

const logger = createLogger("email");

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
    | "ai-insight"
    | "verification"
    | "password-reset";
  data: Record<string, unknown>;
}

// --- Resend transport ---
async function sendViaResend(
  from: string,
  to: string,
  subject: string,
  html: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error (${response.status}): ${error}`);
  }
}

// --- SMTP transport ---
function getSmtpTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

async function sendViaSmtp(
  from: string,
  to: string,
  subject: string,
  html: string,
) {
  const transporter = getSmtpTransporter();
  await transporter.sendMail({ from, to, subject, html });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Smart sendEmail: try Resend first, fall back to SMTP ---
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  if (!EMAIL_REGEX.test(to)) {
    logger.error("Invalid email address", { to });
    throw new Error(`Invalid email address: ${to}`);
  }

  const hasResend = !!env.RESEND_API_KEY && !!env.EMAIL_FROM;
  const hasSmtp = !!env.SMTP_HOST && !!env.SMTP_USER && !!env.SMTP_PASS;

  if (hasResend) {
    try {
      await sendViaResend(env.EMAIL_FROM!, to, subject, html);
      logger.info("Email sent via Resend", { to, subject });
      return;
    } catch (err) {
      logger.warn("Resend failed, trying SMTP fallback", {
        to,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (hasSmtp) {
    const from = env.SMTP_FROM ?? env.SMTP_USER!;
    await sendViaSmtp(from, to, subject, html);
    logger.info("Email sent via SMTP", { to, subject });
    return;
  }

  throw new Error(
    "No email transport configured. Set RESEND_API_KEY or SMTP_HOST.",
  );
}

/**
 * Compile an HTML template file with Handlebars data.
 * Use this instead of importing Handlebars directly in workers.
 */
export async function compileTemplate(
  templateFile: string,
  data: Record<string, unknown>,
): Promise<string> {
  const source = await getTemplate(templateFile);
  return Handlebars.compile(source)(data);
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
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const templateData = {
    ...data,
    appUrl,
    year: new Date().getFullYear(),
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
