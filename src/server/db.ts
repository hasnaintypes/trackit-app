import { env } from "@/env";
import { createLogger } from "@/lib/logging";
import { PrismaClient } from "@prisma/client";
// Import the Postgres driver adapter so we can provide it to PrismaClient
// when the generated client expects the `client` engine type.
import { PrismaPg } from "@prisma/adapter-pg";
// Importing PrismaPg adapter can complicate client typing in our strict setup.
// Omit adapter usage to preserve narrow PrismaClient types.

const logger = createLogger("db");

const createPrismaClient = () => {
  // Build Prisma client options. Prisma v7 introduced `adapter` and `accelerateUrl`.
  // We augment the constructor options with `adapter` and `accelerateUrl` as
  // `unknown` to avoid mismatching the library's internal adapter factory
  // types while still avoiding `any` casts.
  type PrismaClientOptionsAug = ConstructorParameters<
    typeof PrismaClient
  >[0] & {
    adapter?: unknown;
    accelerateUrl?: string;
  };

  const clientOptions: PrismaClientOptionsAug = {
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  };

  // If Prisma Accelerate URL is provided, include it so the client can
  // construct successfully when the generator uses the `client` engineType.
  // This is a noop when the env var is not set.
  if (env.PRISMA_ACCELERATE_URL) {
    // Note: `accelerateUrl` is typed as unknown on `PrismaClientOptionsAug`.
    clientOptions.accelerateUrl = env.PRISMA_ACCELERATE_URL;
    logger.info("Using Prisma Accelerate URL from env for Prisma client");
  }

  if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
    logger.info(
      "Using direct database URL for Prisma client connection via process.env.DATABASE_URL",
    );
  }

  // If a DATABASE_URL is available and no adapter/accelerateUrl was provided,
  // create a Postgres driver adapter so PrismaClient can initialize when the
  // generated client was created with engineType = "client".
  if (
    env.DATABASE_URL &&
    !clientOptions.adapter &&
    !clientOptions.accelerateUrl
  ) {
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

  // Create Prisma client with standard options to preserve strict typing.
  const client = new PrismaClient(clientOptions);

  // Provide a narrow `$on` view for the events we consume without using `any`.
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
    // `e` is typed as an object with an optional `message` property in our
    // local `$on` view. Prefer that message, falling back to a short
    // literal to avoid unsafe assignment.
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
