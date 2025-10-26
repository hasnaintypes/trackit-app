import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Detect common CLI contexts where strict runtime env validation is undesirable.
// This helps avoid failing during linting or test runs (which often run without secrets,
// e.g. from forked PRs or CI jobs that intentionally don't expose secrets).
const argv = process.argv.join(" ");
const isLinting = /\b(eslint|next-lint|lint)\b/.test(argv);
const isTest =
  process.env.NODE_ENV === "test" || /\b(vitest|jest|mocha)\b/.test(argv);
const skipValidationFlag =
  !!process.env.SKIP_ENV_VALIDATION || isLinting || isTest;

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    RESEND_API_KEY: z.string(),
    EMAIL_FROM: z.string().email(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: z.string().url(),
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: z.string(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN:
      process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL:
      process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL,
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL:
      process.env.NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  // Skip strict validation when running lint/tests or when SKIP_ENV_VALIDATION is set.
  skipValidation: skipValidationFlag,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
