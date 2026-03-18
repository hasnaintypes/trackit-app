import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { createLogger } from "@/lib/logging";
import { checkRateLimit } from "@/server/api/rateLimit";

const logger = createLogger("api:auth");

const AUTH_RATE_LIMIT_MAX = 10;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return "unknown";
}

function logHandlerWrapper<
  T extends (req: Request, ...args: unknown[]) => Promise<Response>,
>(handler: T): T {
  return (async (req: Request, ...args: unknown[]) => {
    const ip = getClientIp(req);

    // Rate limit auth endpoints by IP
    const { allowed, resetAt } = await checkRateLimit(
      ip,
      "auth",
      AUTH_RATE_LIMIT_MAX,
    );
    if (!allowed) {
      logger.warn("Auth rate limit exceeded", { ip });
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    logger.info("Auth API called", { method: req.method, url: req.url });
    try {
      return await handler(req, ...args);
    } catch (error) {
      logger.error("Auth API error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }) as T;
}

// Per Better Auth docs, pass the `auth.handler` into `toNextJsHandler` so the
// Next.js adapter receives the internal handler functions it expects.
const handlers = toNextJsHandler(auth.handler);
export const POST = logHandlerWrapper(handlers.POST);
export const GET = logHandlerWrapper(handlers.GET);
