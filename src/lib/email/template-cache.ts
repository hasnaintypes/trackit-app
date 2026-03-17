import { readFile } from "fs/promises";
import path from "path";

const cache = new Map<string, string>();

export async function getTemplate(templateName: string): Promise<string> {
  const cached = cache.get(templateName);
  if (cached) return cached;

  const templatePath = path.join(__dirname, "templates", templateName);
  const content = await readFile(templatePath, "utf-8");
  cache.set(templateName, content);
  return content;
}
