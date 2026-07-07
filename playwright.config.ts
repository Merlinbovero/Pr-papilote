import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Les environnements distants (Claude Code sur le web) fournissent un Chromium
// pré-installé dont la révision peut différer de celle attendue par @playwright/test.
const remoteChromium = "/opt/pw-browsers/chromium";
const executablePath = fs.existsSync(remoteChromium) ? remoteChromium : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
