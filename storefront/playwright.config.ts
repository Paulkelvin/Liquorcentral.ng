import { defineConfig, devices } from "@playwright/test"

/**
 * Every prior cart/checkout verification in this project's history was a
 * one-off script in /tmp, run by hand and thrown away — real testing, but
 * never captured as a regression suite. This is the first one that stays
 * in the repo.
 *
 * `webServer` starts the storefront itself; it does not start Postgres,
 * Redis, or the Medusa backend — those must already be running (see
 * `.github/workflows/storefront-e2e.yml` for how CI brings them up).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // This container ships a pre-installed Chromium at a fixed path
        // rather than the version @playwright/test would otherwise try
        // to download — see the repo's own environment notes. Harmless
        // to leave in for any environment where the path doesn't exist;
        // Playwright falls back to its own managed browser in that case.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : undefined,
      },
    },
  ],
  webServer: {
    command: "yarn build && yarn start",
    url: "http://localhost:8000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
