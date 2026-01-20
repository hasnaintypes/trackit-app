import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { createLogger } from "@/lib/logging";

const logger = createLogger("api:auth");

function logHandlerWrapper<
  T extends (req: Request, ...args: unknown[]) => Promise<Response>,
>(handler: T): T {
  return (async (req: Request, ...args: unknown[]) => {
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
