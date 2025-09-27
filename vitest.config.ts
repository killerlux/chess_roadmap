import { resolve } from "node:path";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "apps/web"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "apps/web/vitest.setup.ts")],
    globals: true,
    exclude: [
      ...configDefaults.exclude,
      "apps/web/tests/e2e/**",
      "tests/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reports: ["text", "lcov"],
      include: ["apps/web/**/*.{ts,tsx}"],
    },
  },
});
