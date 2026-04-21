import { NextResponse } from "next/server";
import { env } from "@/env";

/**
 * Extract the client IP address from a request.
 * Checks x-forwarded-for first, then falls back to "unknown".
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return "unknown";
}

/**
 * Validate that a request originates from the same origin as BETTER_AUTH_URL.
 *
 * - Compares the Origin header (or Referer fallback) hostname against the
 *   configured app URL.
 * - Returns `true` for same-origin requests or when no Origin/Referer is
 *   present (non-browser clients like curl/Postman).
 * - Returns `false` for cross-origin POST requests from browsers.
 */
export function validateOrigin(req: Request): boolean {
  const origin =
    req.headers.get("origin") ?? req.headers.get("referer") ?? null;

  // No Origin header = non-browser client (curl, Postman, server-to-server).
  // These cannot perform CSRF attacks so we allow them.
  if (!origin) return true;

  try {
    const requestHost = new URL(origin).hostname;
    const appHost = new URL(env.BETTER_AUTH_URL).hostname;
    return requestHost === appHost;
  } catch {
    // Malformed URL in Origin header — reject
    return false;
  }
}

/**
 * Standard 403 response for failed origin checks.
 */
export function originDeniedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Forbidden: cross-origin request denied." },
    { status: 403 },
  );
}

/**
 * Standard 429 response for rate-limited requests.
 */
export function rateLimitResponse(resetAt: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    },
  );
}
