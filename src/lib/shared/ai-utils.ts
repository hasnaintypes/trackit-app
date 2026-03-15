import { createLogger } from "@/lib/logging";

const logger = createLogger("ai-utils");

export function extractJsonFromAI<T>(text: string, context: string): T {
  try {
    const jsonMatch =
      /```json\s*([\s\S]*?)\s*```/.exec(text) ??
      /```\s*([\s\S]*?)\s*```/.exec(text);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonText ?? text) as T;
  } catch (error) {
    logger.error(`Failed to parse AI ${context}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `Failed to parse AI ${context}: ${text.substring(0, 100)}...`,
    );
  }
}
