import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@component": resolve(__dirname, "src/components"),
      "@content": resolve(__dirname, "src/content"),
      "@types": resolve(__dirname, "src/types"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 10000,
    setupFiles: ["test/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    include: ["test/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
  },
});
