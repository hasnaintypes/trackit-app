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

/**
 * Lazy-initialized Prisma client.
 *
 * During Next.js builds the module graph is evaluated but no actual DB queries
 * run.  Eager construction would fail in CI where DATABASE_URL is absent and
 * the Prisma "client" engine requires an adapter.  The Proxy defers creation
 * until the first property access at runtime.
 */
function getOrCreateClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    logger.info("Prisma client initialized", {
      env: process.env.NODE_ENV,
    });
  }
  return globalForPrisma.prisma;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getOrCreateClient()[prop as keyof PrismaClient];
  },
});
