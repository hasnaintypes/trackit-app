import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";

const logger = createLogger("api:waitlist-export");

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role?: string };

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const entries = await db.waitlistEntry.findMany({
      select: { email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries, total: entries.length });
  } catch (error) {
    logger.error("Waitlist export failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
