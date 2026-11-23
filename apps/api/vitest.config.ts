import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    // The suites share one test database and truncate it between tests.
    fileParallelism: false,
    env: { NODE_ENV: "test" },
  },
});
