/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from "next/server";
import { scanReceiptWithAI } from "@/services/aiService";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const { extractedText, imageUrl, fileDataUrl, categories } = body as {
      extractedText?: string;
      imageUrl?: string;
      fileDataUrl?: string;
      categories?: unknown;
    };

    // Prefer a directly provided file data URL (base64) over a hosted image URL
    const imagePayload = fileDataUrl ?? imageUrl ?? null;

    if (!extractedText && !imagePayload) {
      return NextResponse.json(
        { error: "Missing extractedText or image data/url" },
        { status: 400 },
      );
    }

    // Pass categories through to AI if provided (client should sanitize)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cats = Array.isArray(categories) ? (categories as any) : undefined;

    const result = await scanReceiptWithAI({
      extractedText: extractedText ?? null,
      imageUrl: imagePayload,
      categories: cats ?? null,
    });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("AI scan-receipt route error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error from AI scan-receipt route";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
