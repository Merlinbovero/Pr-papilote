import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/alat/missions/l-aerocombat",
  "/eopan/concepts/catobar",
  "/eopan/selection/preparer-l-entretien-de-motivation",
  "/eopn/presentation/le-concours-eopn",
];
const LARGEURS = [
  { nom: "mobile", width: 390, height: 844 },
  { nom: "tablette", width: 768, height: 1024 },
  { nom: "tablette large", width: 1024, height: 1366 },
  { nom: "desktop", width: 1440, height: 900 },
];

for (const registre of ["light", "dark"] as const) {
  for (const l of LARGEURS) {
    test(`${registre} — ${l.nom} (${l.width}px) : encre, débordement, contraste`, async ({
      browser,
    }) => {
      const ctx = await browser.newContext({
        colorScheme: registre,
        viewport: { width: l.width, height: l.height },
      });
      const page = await ctx.newPage();
      for (const url of PAGES) {
        await page.goto(url);
        const racine = page.locator(".pl-root");
        await expect(racine, url).toHaveAttribute("data-module", "indigo");

        // L'encre doit RÉSOUDRE, et différer entre les deux registres.
        const mod = await racine.evaluate((el) =>
          getComputedStyle(el).getPropertyValue("--pl-mod").trim()
        );
        expect(mod.toLowerCase(), `${url} — --pl-mod non résolue`).toMatch(/^#[0-9a-f]{6}$/);
        expect(mod.toLowerCase()).toBe(registre === "dark" ? "#a4afdb" : "#4f5882");

        const debord = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(debord, `${url} — débordement à ${l.width}px`).toBe(0);
      }
      await ctx.close();
    });
  }
}

/**
 * Accessibilité des Dossiers — scan axe, WCAG 2 A et AA, dans les DEUX registres.
 *
 * Le registre sombre est scanné lui aussi : les défauts de contraste ne se
 * transposent pas d'un registre à l'autre, et ne les mesurer qu'en clair
 * reviendrait à n'en vérifier que la moitié.
 */
for (const registre of ["light", "dark"] as const) {
  test(`accessibilité axe — registre ${registre}`, async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: registre });
    const page = await ctx.newPage();
    for (const url of PAGES) {
      await page.goto(url);
      const resultats = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        resultats.violations.map((v) => `${v.id} (${v.nodes.length})`),
        `${url} — ${registre}`
      ).toEqual([]);
    }
    await ctx.close();
  });
}
