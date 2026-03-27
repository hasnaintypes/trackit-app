import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";
import { sendTemplateEmail } from "@/lib/email";
import { env } from "@/env";
import {
  validateOrigin,
  originDeniedResponse,
  getClientIp,
  rateLimitResponse,
} from "@/lib/security/csrf";
import { checkRateLimit } from "@/server/api/rateLimit";
import { encryptField } from "@shared/encryption";

const logger = createLogger("api:contact");

const CONTACT_RATE_LIMIT_MAX = 5;

export async function POST(req: Request) {
  if (!validateOrigin(req)) return originDeniedResponse();

  const ip = getClientIp(req);
  const { allowed, resetAt } = await checkRateLimit(
    ip,
    "contact",
    CONTACT_RATE_LIMIT_MAX,
  );
  if (!allowed) {
    logger.warn("Contact form rate limit exceeded", { ip });
    return rateLimitResponse(resetAt);
  }

  try {
    const raw = (await req.json()) as Record<string, unknown>;

    const bodySchema = z.object({
      name: z.string().min(2, "Please enter your name."),
      email: z
        .string()
        .email("Please enter a valid email address.")
        .transform((v) => v.trim().toLowerCase()),
      message: z.string().min(10, "Message must be at least 10 characters."),
    });

    const parsed = bodySchema.safeParse({
      name: typeof raw.name === "string" ? raw.name.trim() : raw.name,
      email: typeof raw.email === "string" ? raw.email.trim() : raw.email,
      message:
        typeof raw.message === "string" ? raw.message.trim() : raw.message,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    const encryptedEmail = encryptField(email, env.FIELD_ENCRYPTION_KEY);
    await db.contactMessage.create({
      data: { name, email: encryptedEmail ?? email, message },
    });

    logger.info("New contact message", { name, email });

    // Fire-and-forget: send admin notification + user confirmation emails
    const emailPromises: Promise<void>[] = [];

    if (env.ADMIN_EMAIL) {
      emailPromises.push(
        sendTemplateEmail({
          to: env.ADMIN_EMAIL,
          subject: `New Contact Form Submission from ${name}`,
          template: "contact-admin-notification",
          data: { name, email, message },
        }),
      );
    }

    emailPromises.push(
      sendTemplateEmail({
        to: email,
        subject: "We received your message",
        template: "contact-confirmation",
        data: { name },
      }),
    );

    void Promise.allSettled(emailPromises).then((results) => {
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          logger.error("Failed to send contact email", {
            index: i,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason),
          });
        }
      });
    });

    return NextResponse.json(
      { message: "Message sent! We'll get back to you soon." },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Contact form submission failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
