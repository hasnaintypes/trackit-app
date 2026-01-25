import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { revokeSessionSchema } from "@/validation/session";

/**
 * Session router: list current user's sessions and revoke them.
 */
export const sessionRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
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
      token: s.token,
    }));
  }),

  revoke: protectedProcedure
    .input(revokeSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // Ensure the session belongs to the user
      const existing = await ctx.db.session.findUnique({
        where: { id: input.id },
      });
      if (existing?.userId !== userId) {
        throw new Error("Session not found or not owned by user");
      }

      await ctx.db.session.delete({ where: { id: input.id } });
      return { success: true };
    }),

  revokeAll: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    await ctx.db.session.deleteMany({ where: { userId } });
    return { success: true };
  }),
});

export default sessionRouter;
