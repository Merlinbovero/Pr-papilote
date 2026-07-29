import { expect, test } from "@playwright/test";

/**
 * Lot M6b — La Planche d'identification.
 *
 * Ce que ce fichier garde, dans l'ordre d'importance :
 *
 *  1. **les ancres publiques** — `#l-essentiel`, `#pieges`, `#sources` et les
 *     identifiants de section existaient avant la migration. Un lecteur a pu
 *     les coller ailleurs ; elles doivent encore atterrir au bon endroit ;
 *  2. **la cote gelée** — celle du référentiel, pas une valeur recalculée ;
 *  3. **ce que le lot n'avait pas le droit de retirer** — la commande
 *     d'impression, le crédit photographique et son lien de source, les
 *     relations, le quiz de notion ;
 *  4. **la frontière du bloc hôte** — NotionQuiz reste intact, et la
 *     typographie PLANCHE s'arrête à son bord ;
 *  5. **la séparation des familles** — une fiche non migrée ne doit porter
 *     aucune marque de La Planche.
 */

const NOTICE = "/eopan/appareils/rafale-m";
/** Une fiche de La Leçon : elle doit rester sous FicheTransition. */
const TRANSITION = "/eopan/missions/la-patrouille-maritime";

/** Quelques cotes gelées (`content/_referentiels/cotes.json`). */
const COTES: [string, string][] = [
  ["/eopan/appareils/rafale-m", "EOPAN · C.6.10"],
  ["/eopan/appareils/atlantique-2", "EOPAN · C.6.01"],
  ["/eopan/ban/hyeres", "EOPAN · C.9.01"],
  ["/eopan/navires/charles-de-gaulle", "EOPAN · C.7.01"],
  ["/eopn/appareils/rafale", "EOPN · C.6.11"],
  ["/eopn/bases/cognac", "EOPN · C.8.01"],
  ["/alat/appareils/tigre", "ALAT · C.6.09"],
  ["/alat/grades/grades-de-l-armee-de-terre", "ALAT · C.13.01"],
];

test.describe("La Planche d'identification", () => {
  for (const [url, cote] of COTES) {
    test(`${url} porte sa cote gelée ${cote}`, async ({ page }) => {
      await page.goto(url);
      // Deux fois : au cartouche et dans la marge technique. Les deux lisent
      // la même valeur, celle du référentiel.
      await expect(page.locator(".pl-cart")).toContainText(cote);
    });
  }

  test("les ancres publiques du gabarit historique atterrissent encore", async ({ page }) => {
    await page.goto(NOTICE);
    for (const ancre of ["l-essentiel", "role-et-missions", "pieges", "sources"]) {
      const cible = page.locator(`#${ancre}`);
      await expect(cible, `ancre #${ancre}`).toHaveCount(1);
    }
  });

  test("le sommaire est utilisable sans JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(NOTICE);
    const liens = page.locator(".pl-toc a");
    expect(await liens.count()).toBeGreaterThan(3);
    // Chaque ancre du sommaire vise un élément qui existe dans le document.
    for (const href of await liens.evaluateAll((l) =>
      l.map((a) => (a.getAttribute("href") ?? "").replace("#", ""))
    )) {
      await expect(page.locator(`#${href}`), `cible de #${href}`).toHaveCount(1);
    }
    await ctx.close();
  });

  test("conserve la commande d'impression, retirée par erreur en cours de lot", async ({
    page,
  }) => {
    await page.goto(NOTICE);
    await expect(page.getByRole("button", { name: "Version PDF" })).toBeVisible();
  });

  test("crédite la photographie et lie sa source", async ({ page }) => {
    await page.goto(NOTICE);
    const legende = page.locator(".pl-photo .pl-legende");
    await expect(legende).toContainText("US Navy");
    await expect(legende).toContainText("Domaine public");
    await expect(legende.getByRole("link")).toHaveAttribute("href", /commons\.wikimedia\.org/);
  });

  test("ne recadre ni ne teinte la photographie", async ({ page }) => {
    await page.goto(NOTICE);
    // `.pl-planche` teinte ses images au laboratoire ; une notice n'emploie
    // jamais cette classe. Le filtre calculé doit rester « none ».
    await expect(page.locator(".pl-photo")).toHaveCount(1);
    await expect(page.locator(".pl-planche")).toHaveCount(0);
    const filtre = await page
      .locator(".pl-photo img")
      .first()
      .evaluate((el) => getComputedStyle(el).filter);
    expect(filtre).toBe("none");
  });

  test("monte NotionQuiz intact dans un bloc hôte", async ({ page }) => {
    await page.goto(NOTICE);
    const hote = page.locator(".pl-hote", { has: page.getByRole("button", { name: /Tester/ }) });
    await expect(hote).toHaveCount(1);
    // La typographie du corps s'arrête au bord : le bloc garde sa fonte.
    const fonte = await hote
      .getByRole("button", { name: /Tester/ })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fonte).not.toContain("Spectral");
  });

  test("garde les relations vers les fiches voisines", async ({ page }) => {
    await page.goto(NOTICE);
    const annexe = page.locator(".pl-annexe");
    await expect(annexe.getByRole("link", { name: "Flottille 11F" })).toBeVisible();
  });

  test("une fiche non migrée ne porte aucune marque de La Planche", async ({ page }) => {
    await page.goto(TRANSITION);
    // Le groupe de routes est commun — le bandeau PLANCHE est donc là. Mais le
    // gabarit de notice, lui, ne doit pas avoir déteint sur elle.
    await expect(page.locator(".pl-corps")).toHaveCount(0);
    await expect(page.locator(".pl-cote")).toHaveCount(0);
    await expect(page.locator(".pl-hote")).toHaveCount(1);
  });

  test("le corps ne déborde jamais, du mobile au desktop", async ({ page }) => {
    for (const largeur of [390, 834, 1440]) {
      await page.setViewportSize({ width: largeur, height: 900 });
      await page.goto("/eopn/grades/grades-de-l-armee-de-l-air");
      const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(debordement, `débordement à ${largeur}px`).toBe(0);
    }
  });
});
