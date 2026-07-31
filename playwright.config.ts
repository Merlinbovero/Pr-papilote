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
    /*
     * La suite s'exécute sur une COMPILATION DE PRODUCTION, jamais sur le
     * serveur de développement.
     *
     * ── Pourquoi ────────────────────────────────────────────────────────
     * `next dev` compile chaque route à la demande, au premier accès. Sur
     * une machine au repos, `/eopn/grades/grades-de-l-armee-de-l-air` met
     * **7,52 s** à répondre à froid, puis 0,199 s à chaud. En CI, Playwright
     * prend 2 des 4 cœurs et plusieurs routes compilent simultanément : le
     * délai de 30 s d'un test a été dépassé sur les trente dernières
     * poussées vers `main`, sans qu'aucune assertion ne soit en cause.
     *
     * Servie depuis une compilation de production, la même route répond en
     * **0,0125 s** — soit six cents fois moins. Il n'y a plus de
     * compilation à la demande, donc plus rien à dépasser.
     *
     * Le coût est un build de ~47 s, payé une fois, contre une compilation
     * par route payée à chaque campagne.
     *
     * ── Ce que ce choix corrige, et ce qu'il ne masque pas ──────────────
     * Aucun délai de test n'est allongé, aucune reprise n'est ajoutée,
     * aucun test n'est filtré ni désactivé, aucune page n'est modifiée. La
     * cause est supprimée, pas contournée. Les deux projets, l'inventaire
     * complet et l'absence de filtre sont inchangés.
     *
     * ── L'index de recherche reste garanti ──────────────────────────────
     * `public/generated/recherche-index.json` est un artefact exclu de Git,
     * produit par le hook `prebuild`. `npm run build` le déclenche : la
     * garantie obtenue précédemment par un appel explicite est désormais
     * portée par le build lui-même, et vérifiée par mesure (HTTP 200 sur
     * l'artefact, serveur de production, dépôt propre).
     *
     * ── Les quatre dépendances au mode de compilation ───────────────────
     * Quitter `next dev` réveille tout ce que le code conditionnait au mode.
     * L'inventaire a été fait en entier, et non corrigé au fil des échecs :
     *
     * 1. `/design-lab/*` — `isDesignLabEnabled()` est vrai si
     *    `NEXT_PUBLIC_DESIGN_LAB` vaut « 1 » OU en développement.
     * 2. `/design-system/*` — quatre pages appellent `notFound()` en
     *    production sauf si `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM` vaut « 1 ».
     *    Garde DISTINCTE de la précédente : ne poser que la première laisse
     *    tomber douze contrôles, ce que la campagne a montré.
     * 3. Brouillons (`fiches.ts`, `cours.ts`) — masqués en production sauf
     *    `NEXT_PUBLIC_SHOW_DRAFTS`. **Volontairement non posée** : le corpus
     *    ne compte aucun brouillon, et le jour où il en comptera, la vérité
     *    à tester est bien que la production ne les sert pas.
     * 4. Service worker — il ne s'enregistrait pas sous `next dev` ; il
     *    s'enregistre maintenant. Différence assumée : la suite s'approche
     *    de ce que le visiteur reçoit vraiment.
     *
     * Les deux variables posées ici ne fuient pas en production réelle :
     * `NEXT_PUBLIC_` est figée à la compilation et le déploiement Vercel ne
     * les définit pas — `/design-lab/*` et `/design-system/*` y restent en
     * 404. Elles servent à conserver EXACTEMENT la surface testée jusqu'ici.
     */
    command: "npm run build && npm start",
    env: { NEXT_PUBLIC_DESIGN_LAB: "1", NEXT_PUBLIC_SHOW_DESIGN_SYSTEM: "1" },
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    /*
     * Budget de démarrage porté de 120 s à 300 s : il doit désormais couvrir
     * un build complet, mesuré à 47 s en local et plus lent sur un runner
     * partagé. Ce n'est pas un délai de test allongé pour faire passer une
     * assertion — aucun `timeout` de test n'est touché — mais le temps
     * accordé au serveur pour exister.
     */
    timeout: 300_000,
  },
});
