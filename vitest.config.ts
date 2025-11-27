import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup/global.ts"],
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "dist/",
        "build/",
        "*.config.*",
        "main.js"
      ]
    }
  },
  resolve: {
    alias: {
      obsidian: new URL("./tests/setup/obsidian-mock.ts", import.meta.url)
        .pathname
    }
  }
});
