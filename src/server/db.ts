import { env } from "@/env";
import { createLogger } from "@/lib/logging";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const logger = createLogger("db");

const createPrismaClient = () => {
  type PrismaClientOptionsAug = ConstructorParameters<
    typeof PrismaClient
  >[0] & {
    adapter?: unknown;
  };

  const clientOptions: PrismaClientOptionsAug = {
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  };

  if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
    try {
      clientOptions.adapter = new PrismaPg({
        connectionString: env.DATABASE_URL,
      });
      logger.info("Configured Prisma Postgres adapter from DATABASE_URL");
    } catch (err) {
      logger.warn(
        "Failed to create Prisma Pg adapter; continuing without adapter",
        { error: err },
      );
    }
  }

  const client = new PrismaClient(clientOptions);

  const clientWithTypedOn = client as unknown as {
    $on(
      event: "query",
      cb: (e: { query: string; params: string; duration: number }) => void,
    ): void;
    $on(
      event: "info" | "warn" | "error",
      cb: (e: { message?: string }) => void,
    ): void;
  };

  clientWithTypedOn.$on("query", (e) => {
    logger.debug("Prisma query executed", {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  });

  clientWithTypedOn.$on("error", (e) => {
    const errMsg = e?.message ?? "Prisma error";
    logger.error("Prisma error", { error: errMsg });
  });

  clientWithTypedOn.$on("warn", (e) => {
    const warnMsg = e?.message ?? "Prisma warning";
    logger.warn("Prisma warning", { warn: warnMsg });
  });
  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
logger.info("Prisma client initialized", { env: env.NODE_ENV });
