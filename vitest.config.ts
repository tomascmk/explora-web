import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // Inline empty PostCSS so Vite does NOT load the project's Tailwind v4
  // postcss.config.mjs when transforming CSS imports (e.g. leaflet.css) in tests.
  css: { postcss: { plugins: [] } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e", "tests/e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "contexts/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/layout.tsx",
        "**/loading.tsx",
        "**/not-found.tsx",
        "**/*.config.*",
        "app/**/page.tsx",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 72,
        functions: 75,
      },
    },
  },
});
