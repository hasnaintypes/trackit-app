import { PrismaClient } from "@prisma/client";
import { env } from "@/env";
import { createLogger } from "@/lib/logging";

const logger = createLogger("db");

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  client.$on("query", (e) => {
    logger.debug("Prisma query executed", {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  });
  client.$on("error", (e) => {
    logger.error("Prisma error", { error: e });
  });
  client.$on("warn", (e) => {
    logger.warn("Prisma warning", { warn: e });
  });
  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
logger.info("Prisma client initialized", { env: env.NODE_ENV });
