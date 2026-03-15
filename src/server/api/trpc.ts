import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";
import { auth } from "@/lib/auth";
import { createLogger } from "@/lib/logging";
import type { User, Session } from "@/types";

/**
 * Create the tRPC request context.
 *
 * This helper resolves the current authenticated user (if possible) using the
 * optional helpers provided by the `better-auth` integration (`auth` object).
 * The function is resilient to missing helpers and will return a context with
 * a `user` of `null` if no session can be resolved.
 *
 * The returned context includes:
 * - `db`: database client
 * - `headers`: the incoming request headers (passed through `opts`)
 * - `user`: the resolved user or `null`
 *
 * Notes:
 * - This function intentionally tolerates different helper names on `auth`
 *   (e.g. `getSession`, `getServerSession`, `verify`, `get`).
 * - Any exceptions during auth lookup are caught and logged; they do not
 *   prevent the context from being created.
 *
 * @param {{ headers: Headers }} opts - The incoming request headers container
 * @returns {Promise<{db: typeof db, headers: Headers, user: import("@/types").User | null}>} The created context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const logger = createLogger("trpc:context");

  let currentUser: User | null = null;
  try {
    // The result we may receive from the auth helpers
    type AuthLookupResult =
      | Session
      | { user?: User; userId?: string; id?: string }
      | null;

    // `better-auth` may expose helpers at the top-level or under `auth.api`.
    type AuthHelpers = {
      getSession?: (opts: {
        headers: Headers;
      }) => Promise<AuthLookupResult> | AuthLookupResult;
      getServerSession?: (opts: {
        headers: Headers;
      }) => Promise<AuthLookupResult> | AuthLookupResult;
      verify?: (opts: {
        headers: Headers;
      }) => Promise<AuthLookupResult> | AuthLookupResult;
      get?: (opts: {
        headers: Headers;
      }) => Promise<AuthLookupResult> | AuthLookupResult;
      api?: {
        getSession?: (opts: {
          headers: Headers;
        }) => Promise<AuthLookupResult> | AuthLookupResult;
        getServerSession?: (opts: {
          headers: Headers;
        }) => Promise<AuthLookupResult> | AuthLookupResult;
        verify?: (opts: {
          headers: Headers;
        }) => Promise<AuthLookupResult> | AuthLookupResult;
        get?: (opts: {
          headers: Headers;
        }) => Promise<AuthLookupResult> | AuthLookupResult;
      };
    };

    const authExport = auth as unknown as AuthHelpers;

    // Debug: log which helper shapes are present. Use structured logger.
    try {
      logger.debug("resolving auth helper shape", {
        topLevel_getSession: Boolean(authExport.getSession),
        topLevel_getServerSession: Boolean(authExport.getServerSession),
        api_getSession: Boolean(authExport.api?.getSession),
        api_getServerSession: Boolean(authExport.api?.getServerSession),
      });
    } catch {
      // ignore logging failures
    }

    // Try available helpers in order of preference. Prefer top-level helpers,
    // then `api.*` helpers if present.
    const callIfHelper = (
      fn?: (opts: {
        headers: Headers;
      }) => Promise<AuthLookupResult> | AuthLookupResult,
    ) => (typeof fn === "function" ? fn({ headers: opts.headers }) : undefined);

    const maybeLookupResultRaw =
      callIfHelper(authExport.getSession) ??
      callIfHelper(authExport.getServerSession) ??
      callIfHelper(authExport.verify) ??
      callIfHelper(authExport.get) ??
      callIfHelper(authExport.api?.getSession) ??
      callIfHelper(authExport.api?.getServerSession) ??
      callIfHelper(authExport.api?.verify) ??
      callIfHelper(authExport.api?.get) ??
      null;

    const maybeLookupResult: AuthLookupResult | Promise<AuthLookupResult> =
      maybeLookupResultRaw as AuthLookupResult | Promise<AuthLookupResult>;

    const lookupResult =
      maybeLookupResult &&
      typeof (maybeLookupResult as Promise<AuthLookupResult>).then ===
        "function"
        ? await maybeLookupResult
        : (maybeLookupResult as AuthLookupResult);

    // If no session was resolved, log whether a cookie header was present on the request.
    if (!lookupResult) {
      try {
        const cookieHeader = opts.headers.get("cookie");
        logger.debug("no auth session resolved", {
          cookiePresent: Boolean(cookieHeader),
        });
      } catch {
        // ignore
      }
    }

    if (lookupResult) {
      // Prefer an embedded user if present
      const s = lookupResult as { user?: User; userId?: string; id?: string };
      if (s.user) {
        currentUser = s.user;
      } else if (typeof s.userId === "string") {
        const found = await db.user.findUnique({ where: { id: s.userId } });
        currentUser = found
          ? ({ ...found, image: found.image ?? undefined } as User)
          : null;
      } else if (typeof s.id === "string") {
        const found = await db.user.findUnique({ where: { id: s.id } });
        currentUser = found
          ? ({ ...found, image: found.image ?? undefined } as User)
          : null;
      }
    }
  } catch (error) {
    // Use structured logger; avoid leaking sensitive info
    const logger = createLogger("trpc:context");
    logger.warn("failed to resolve auth user for tRPC context", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    db,
    ...opts,
    user: currentUser,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
// Use the actual resolved context type for initTRPC so types are correct.
type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Factory for creating a server-side caller for tRPC routers.
 *
 * Use `createCallerFactory` to produce a typed caller that can invoke your
 * procedures from server-side code (for example, in jobs or testing).
 *
 * See: https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Router factory for the tRPC API.
 *
 * Use `createTRPCRouter()` to construct new routers and compose sub-routers
 * across the `/src/server/api/routers` directory.
 *
 * See: https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware that measures execution time and applies a small artificial delay
 * in development to help reveal waterfall and latency issues during local
 * development.
 *
 * Behavior:
 * - In development, inserts a random delay between ~100-500ms.
 * - Logs the execution time for every called path.
 */
const timingLogger = createLogger("trpc:timing");

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  if (process.env.NODE_ENV === "development") {
    timingLogger.info(`${path} took ${end - start}ms to execute`);
  }

  return result;
});

/**
 * Public (unauthenticated) procedure base.
 *
 * Procedures built from `publicProcedure` do not enforce authentication.
 * They still receive context and may observe `ctx.user` when present, but
 * callers are not required to be signed in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Middleware that enforces authentication for a procedure.
 *
 * If `ctx.user` is not present this middleware throws a TRPC `UNAUTHORIZED`
 * error. When the user is present the middleware simply augments the
 * context for downstream resolvers.
 *
 * @throws {TRPCError} when there is no authenticated user in context
 */
const enforceAuthMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User must be authenticated",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/**
 * Protected procedure base.
 *
 * Use this for queries/mutations that require an authenticated user. This
 * applies both the timing middleware and the `enforceAuthMiddleware` to
 * ensure the caller is signed in before the procedure executes.
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAuthMiddleware);

/**
 * AI rate-limited procedure.
 *
 * Extends `protectedProcedure` with per-user rate limiting for AI endpoints.
 */
import { checkRateLimit, AI_MAX } from "@/server/api/rateLimit";

export const aiRateLimitedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Try again in a minute.",
      });
    }
    return next();
  },
);
