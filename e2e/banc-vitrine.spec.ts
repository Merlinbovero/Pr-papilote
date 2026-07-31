import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Vitrine du Banc — lot F1b.
 *
 * La vitrine est le **contrat visuel** que les migrations devront reproduire :
 * ces contrôles figent ce qui a été arbitré, et rien de plus. Aucun moteur de
 * production n'est concerné.
 */

const violations = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  ).violations.map((v) => `${v.id} (${v.nodes.length})`);

for (const registre of ["light", "dark"] as const) {
  test.describe(`registre ${registre}`, () => {
    test.use({ colorScheme: registre });

    test("la vitrine ne produit aucune violation, avant et pendant la séance", async ({ page }) => {
      await page.goto("/design-lab/banc");
      expect(await violations(page), "avant la séance").toEqual([]);

      await page.getByRole("button", { name: /Commencer la séance/i }).click();
      await expect(page.getByRole("group", { name: /Question 1 sur 3/ })).toBeVisible();
      expect(await violations(page), "en séance").toEqual([]);

      await page.getByRole("button", { name: /Afficher la correction/i }).click();
      expect(await violations(page), "en correction").toEqual([]);
    });

    test("aucun débordement horizontal sur les trois largeurs", async ({ page }) => {
      for (const largeur of [1440, 834, 390]) {
        await page.setViewportSize({ width: largeur, height: 900 });
        await page.goto("/design-lab/banc");
        const deborde = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        );
        expect(deborde, `largeur ${largeur}`).toBe(false);
      }
    });
  });
}

test.describe("contrats du Banc", () => {
  test("le mode séance amène le premier contrôle dans le premier écran", async ({ page }) => {
    // C'est le défaut mesuré à l'audit : sur mobile, trois épreuves plaçaient
    // le premier contrôle à 891, 995 et 994 px pour un écran de 844.
    for (const [largeur, hauteur] of [
      [1440, 900],
      [834, 1112],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: largeur, height: hauteur });
      await page.goto("/design-lab/banc/seance");
      await page.getByRole("button", { name: /Commencer la séance/i }).click();
      await expect(page.getByRole("group", { name: /Question 1 sur 3/ })).toBeVisible();

      const mesures = await page.evaluate(() => {
        const zone = document.querySelector('[aria-label^="Question 1 sur"]');
        const premier = zone?.querySelector("ul button");
        const chrono = document.querySelector('[role="timer"]');
        const boite = (el: Element | null | undefined) => el?.getBoundingClientRect() ?? null;
        return {
          controle: boite(premier)?.bottom ?? null,
          stimulus: boite(zone?.querySelector(".banc-stimulus"))?.top ?? null,
          chrono: boite(chrono)?.bottom ?? null,
          viewport: window.innerHeight,
        };
      });

      // Le cadre, le stimulus, le chronomètre et le premier contrôle sont
      // visibles sans défiler.
      expect(mesures.stimulus, `stimulus ${largeur}`).not.toBeNull();
      expect(mesures.stimulus!, `stimulus ${largeur}`).toBeLessThan(mesures.viewport);
      expect(mesures.chrono!, `chronomètre ${largeur}`).toBeLessThan(mesures.viewport);
      expect(mesures.controle!, `premier contrôle ${largeur}`).toBeLessThanOrEqual(
        mesures.viewport
      );
    }
  });

  test("le chronomètre emploie des chiffres tabulaires", async ({ page }) => {
    await page.goto("/design-lab/banc");
    const tabulaire = await page.evaluate(() => {
      const chrono = document.querySelector('[role="timer"]');
      if (!chrono) return null;
      const style = getComputedStyle(chrono);
      return `${style.fontVariantNumeric} ${style.fontFeatureSettings}`;
    });
    expect(tabulaire).toMatch(/tabular-nums|tnum/);
  });

  test("chaque état de réponse porte un repère non chromatique", async ({ page }) => {
    await page.goto("/design-lab/banc");
    for (const mot of [
      "Bonne réponse",
      "Réponse incorrecte",
      "À vérifier",
      "Réponse non retenue",
    ]) {
      // Le verdict est écrit, pas seulement teinté (cf. DT-002).
      await expect(page.getByText(mot, { exact: true }).first()).toBeAttached();
    }
  });

  test("la mesure de lecture est plafonnée", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/design-lab/banc");
    // L'audit avait relevé jusqu'à 203 caractères par ligne dans le produit.
    const largeurs = await page.evaluate(() => {
      // La largeur du « 0 » dans la fonte réellement rendue : c'est la
      // définition du `ch`. Un facteur empirique surestimerait la mesure.
      const sonde = document.createElement("span");
      sonde.textContent = "0";
      sonde.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
      return [...document.querySelectorAll(".banc-consigne")].map((p) => {
        p.append(sonde);
        const unite = sonde.getBoundingClientRect().width;
        sonde.remove();
        return unite > 0 ? Math.round(p.getBoundingClientRect().width / unite) : 0;
      });
    });
    expect(largeurs.length).toBeGreaterThan(0);
    for (const largeur of largeurs) {
      expect(largeur).toBeLessThanOrEqual(75);
    }
  });

  test("aucun jeton du Banc ne fuit hors de la classe", async ({ page }) => {
    await page.goto("/");
    // Sur une page de production, `--bc-*` ne doit pas exister.
    const fuite = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bc-banc").trim()
    );
    expect(fuite).toBe("");
  });
});
