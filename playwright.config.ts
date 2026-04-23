import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "bun run dev",
    port: 4321,
    reuseExistingServer: true,
  },
});
