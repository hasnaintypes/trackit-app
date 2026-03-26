import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";

const logger = createLogger("api:waitlist");

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const existing = await db.waitlistEntry.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the waitlist!" },
        { status: 200 },
      );
    }

    await db.waitlistEntry.create({ data: { email } });

    logger.info("New waitlist signup", { email });

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
