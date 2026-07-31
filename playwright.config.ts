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
  /*
   * Une reprise en local, deux en CI.
   *
   * Arbitré à la clôture de F2a, sur mesure et non par confort. Cinq
   * campagnes complètes ont produit cinq échecs DIFFÉRENTS, tous par
   * contention et jamais par assertion : la machine offre 4 cœurs, Playwright
   * en prend 2 pour ses navigateurs, et le serveur de développement compile
   * ses routes à la demande sur les mêmes cœurs. Mesuré : la route qui a fait
   * tomber la cinquième campagne au bout de 30 s est servie en 0,55 s à
   * chaud. Ce n'est pas une page lente, c'est un pic de contention.
   *
   * Ce réglage ne masque rien : Playwright compte les tests repris comme
   * « flaky », séparément des « passed », et un test qui échoue DEUX fois
   * reste un échec. Toute campagne doit donc être rapportée avec sa liste de
   * flaky, jamais comme simplement verte.
   */
  retries: process.env.CI ? 2 : 1,
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
