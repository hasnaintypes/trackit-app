import { defineConfig } from "@playwright/test";

// Playwright test configuration. Adjust reporters, retries and artifacts for CI vs local runs.
export default defineConfig({
  testDir: "./test/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // Run single worker in CI to avoid DB/port conflicts; locally use default workers
  workers: process.env.CI ? 1 : undefined,
  // Reporters: list for console output, junit for CI integration, and HTML report (don't auto-open in CI)
  reporter: [
    ["list"],
    ["junit", { outputFile: "test-results/junit/results.xml" }],
    ["html", { open: "never" }],
  ],
  // Where to store test artifacts (screenshots, videos, traces)
  outputDir: "test-results/",
  use: {
    actionTimeout: 0,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    // Collect trace on first retry to aid debugging of flaky tests
    trace: "on-first-retry",
    // Only capture screenshots on failure to save space
    screenshot: "only-on-failure",
    // Retain videos on failure (CI will upload these artifacts)
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm dev",
    port: 3000,
    // Reuse an existing server when running locally to speed up runs; in CI start a fresh server
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
