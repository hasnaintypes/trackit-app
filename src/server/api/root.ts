import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/userRouter";
import { sessionRouter } from "@/server/api/routers/sessionRouter";
import { accountRouter } from "@/server/api/routers/accountRouter";
import { categoryRouter } from "@/server/api/routers/categoryRouter";
import { transactionRouter } from "@/server/api/routers/transactionRouter";
import { notificationRouter } from "@/server/api/routers/notificationRouter";
import { budgetRouter } from "@/server/api/routers/budgetRouter";
import { reportRouter } from "@/server/api/routers/reportRouter";
import { aiRouter } from "@/server/api/routers/aiRouter";
import { settingsRouter } from "@/server/api/routers/settingsRouter";
import { overviewRouter } from "@/server/api/routers/overviewRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  session: sessionRouter,
  account: accountRouter,
  category: categoryRouter,
  transaction: transactionRouter,
  notification: notificationRouter,
  budget: budgetRouter,
  report: reportRouter,
  ai: aiRouter,
  settings: settingsRouter,
  overview: overviewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
