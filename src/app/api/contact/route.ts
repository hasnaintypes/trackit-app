import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";

const logger = createLogger("api:contact");

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const message = body.message?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 },
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters." },
        { status: 400 },
      );
    }

    await db.contactMessage.create({ data: { name, email, message } });

    logger.info("New contact message", { name, email });

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
