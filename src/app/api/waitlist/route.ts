import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";
import { sendTemplateEmail } from "@/lib/email";
import {
  validateOrigin,
  originDeniedResponse,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/csrf";
import { checkRateLimit } from "@/server/api/rateLimit";

const logger = createLogger("api:waitlist");

const WAITLIST_RATE_LIMIT_MAX = 5;

export async function POST(req: Request) {
  if (!validateOrigin(req)) return originDeniedResponse();

  const ip = getClientIp(req);
  const { allowed, resetAt } = await checkRateLimit(
    ip,
    "waitlist",
    WAITLIST_RATE_LIMIT_MAX,
  );
  if (!allowed) {
    logger.warn("Waitlist rate limit exceeded", { ip });
    return rateLimitResponse(resetAt);
  }

  try {
    const raw = (await req.json()) as Record<string, unknown>;

    const bodySchema = z.object({
      email: z
        .string()
        .email("Please enter a valid email address.")
        .transform((v) => v.trim().toLowerCase()),
    });

    const parsed = bodySchema.safeParse({
      email: typeof raw.email === "string" ? raw.email.trim() : raw.email,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = parsed.data;

    const existing = await db.waitlistEntry.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the waitlist!" },
        { status: 200 },
      );
    }

    await db.waitlistEntry.create({ data: { email } });

    logger.info("New waitlist signup", { email });

    // Fire-and-forget: send welcome email
    void sendTemplateEmail({
      to: email,
      subject: "You're on the Trackit waitlist!",
      template: "waitlist-welcome",
      data: { email },
    }).catch((error) => {
      logger.error("Failed to send waitlist welcome email", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    return NextResponse.json(
      { message: "You're on the list! We'll notify you when we launch." },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Waitlist signup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
