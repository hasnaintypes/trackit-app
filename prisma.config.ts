import "dotenv/config";
import { defineConfig } from "prisma/config";

// Read DATABASE_URL from the environment. Using `process.env` here avoids
// calling the `env()` helper at module-eval time which ESLint may flag as an
// unsafe call in some type configurations. We still fail fast if the value
// is missing so migrations and CLI commands don't run with an invalid config.
// In CI environments during install, we allow a placeholder URL for type generation.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";
if (!process.env.DATABASE_URL && process.env.CI !== "true") {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Keep the existing seed command if present in the repo
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Pass the validated env value directly
    url: databaseUrl,
  },
});
