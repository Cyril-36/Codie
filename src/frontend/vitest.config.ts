import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.git/**",
      "e2e/**",
      "**/e2e/**",
      "e2e.spec.ts",
      "**/e2e/*.spec.ts",
    ],
    coverage: {
      reporter: ["text", "lcov"],
      provider: "istanbul",
      reportsDirectory: "coverage",
      // Thresholds enforced via environment or CI step if needed
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
