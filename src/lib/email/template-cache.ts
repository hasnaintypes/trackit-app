import { readFile } from "fs/promises";
import path from "path";

const ALLOWED_TEMPLATES = [
  "budget-alert.html",
  "monthly-summary.html",
  "weekly-digest.html",
  "transaction-alert.html",
  "ai-insight.html",
  "verification.html",
  "password-reset.html",
] as const;

const cache = new Map<string, string>();

export async function getTemplate(templateName: string): Promise<string> {
  if (
    !ALLOWED_TEMPLATES.includes(
      templateName as (typeof ALLOWED_TEMPLATES)[number],
    )
  ) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  const cached = cache.get(templateName);
  if (cached) return cached;

  const templatePath = path.join(__dirname, "templates", templateName);
  const content = await readFile(templatePath, "utf-8");
  cache.set(templateName, content);
  return content;
}
