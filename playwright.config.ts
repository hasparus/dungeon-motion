import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  fullyParallel: false,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:4321",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run dev",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  workers: 1,
});
