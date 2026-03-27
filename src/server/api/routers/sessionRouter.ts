import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { revokeSessionSchema } from "@/validation/session";

/**
 * Parse the current session token from the request cookie header.
 */
function getCurrentSessionToken(headers: Headers): string | null {
  const cookie = headers.get("cookie");
  if (!cookie) return null;

  // Better Auth uses "better-auth.session_token" cookie
  const match = /(?:^|;\s*)better-auth\.session_token=([^;]+)/.exec(cookie);
  return match?.[1] ?? null;
}

/**
 * Session router: list current user's sessions and revoke them.
 */
export const sessionRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const currentToken = getCurrentSessionToken(ctx.headers);

    const sessions = await ctx.db.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        impersonatedBy: true,
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      ip: s.ipAddress ?? "",
      device: s.userAgent ?? "Unknown",
      lastActivity: s.updatedAt.toISOString(),
      expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
      isCurrent: currentToken ? s.token === currentToken : false,
    }));
  }),

  revoke: protectedProcedure
    .input(revokeSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // Ensure the session belongs to the user
      const existing = await ctx.db.session.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (existing?.userId !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found or not owned by user",
        });
      }

      await ctx.db.session.delete({ where: { id: input.id } });
      return { success: true };
    }),

  revokeAll: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const currentToken = getCurrentSessionToken(ctx.headers);

    // Find the current session to exclude it from deletion
    let currentSessionId: string | undefined;
    if (currentToken) {
      const current = await ctx.db.session.findFirst({
        where: { userId, token: currentToken },
        select: { id: true },
      });
      currentSessionId = current?.id;
    }

    await ctx.db.session.deleteMany({
      where: {
        userId,
        ...(currentSessionId ? { NOT: { id: currentSessionId } } : {}),
      },
    });
    return { success: true };
  }),
});

export default sessionRouter;
