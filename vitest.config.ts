import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    watch: false, // Disable watch mode by default
    include: ["**/__tests__/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: ["lib/**/*.ts", "scripts/**/*.ts", "commands/**/*.ts"],
      exclude: [
        // third-party and build artifacts
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        // app entry points or runtime scripts not intended for unit tests
        "env.ts",
        "index.ts",
        "scripts/dev.ts",
        "scripts/deploy-commands.ts",
        "scripts/load-env.ts",
      ],
    },
  },
})
