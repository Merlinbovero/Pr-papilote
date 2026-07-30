import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Fondations d'accessibilité — lot F1a.
 *
 * L'audit F0b avait mesuré, sur les routes réelles, quatre défauts que les
 * tests unitaires ne peuvent pas voir : une barre de progression sans nom ni
 * valeur, un motif de contraste sous le seuil, un focus perdu à chaque
 * transition et l'absence totale d'annonce. Ce fichier vérifie que les quatre
 * ont disparu **là où ils avaient été constatés**, dans les deux registres.
 */

const SEANCE = 'main section[aria-label] ul[role="list"] button';

/**
 * Défaut connu, relevé à l'audit F0b §1 et **explicitement hors périmètre
 * F1a** : dans la correction, le lien « Pour approfondir » n'est distingué du
 * texte que par la couleur. Il n'apparaît que si la question tirée porte un
 * renvoi, ce qui rendrait ce contrôle aléatoire selon le tirage. On l'écarte
 * donc nommément — en le taisant, la suite masquerait un défaut réel ; en le
 * laissant, elle échouerait un jour sur deux pour une cause étrangère au lot.
 */
const HORS_PERIMETRE_F1A = ["link-in-text-block"];

async function violations(page: Page) {
  const resultat = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return resultat.violations
    .filter((v) => !HORS_PERIMETRE_F1A.includes(v.id))
    .map((v) => `${v.id} (${v.nodes.length})`);
}

const focalise = (page: Page) =>
  page.evaluate(() => {
    const actif = document.activeElement as HTMLElement | null;
    if (!actif || actif === document.body) return "body";
    return actif.getAttribute("aria-label") ?? (actif.textContent || "").trim().slice(0, 40);
  });

/** Le contenu de la région d'annonce de la séance. */
const annonce = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("main [aria-live]")]
      .map((r) => (r.textContent || "").trim())
      .filter(Boolean)
  );

for (const registre of ["light", "dark"] as const) {
  test.describe(`registre ${registre}`, () => {
    test.use({ colorScheme: registre });

    test("la barre de progression du quiz porte un nom ET une valeur", async ({ page }) => {
      await page.goto("/entrainement/eopan");
      await page.getByRole("button", { name: /Commencer la série/i }).click();
      await page.waitForSelector(SEANCE);

      const barre = page.getByRole("progressbar", { name: "Progression du quiz" });
      await expect(barre).toHaveAttribute("aria-valuenow", "0");
      // Le libellé dit l'avancement, pas la position : c'est ce que la barre mesure.
      await expect(barre).toHaveAttribute("aria-valuetext", /0 question terminée sur \d+/);
    });

    test("la barre de l'examen BIA porte un nom ET une valeur", async ({ page }) => {
      await page.goto("/bia/examen-blanc");
      await page.getByRole("button", { name: /Commencer l’examen/i }).click();
      await page.waitForSelector(SEANCE, { timeout: 20000 });

      const barre = page.getByRole("progressbar", { name: "Progression de l’examen" });
      await expect(barre).toHaveAttribute("aria-valuenow", "0");
      await expect(barre).toHaveAttribute("aria-valuetext", /0 réponse complétée sur \d+/);
    });

    test("la séance psychotechnique nomme sa progression", async ({ page }) => {
      await page.goto("/psychotechnique/entrainement");
      await page.getByRole("button", { name: /^Lancer la session/i }).click();
      await page.getByRole("button", { name: /^Démarrer$/ }).click();
      await expect(
        page.getByRole("progressbar", { name: "Progression de la séance" })
      ).toHaveAttribute("aria-valuenow", "0");
    });

    test("aucune violation axe pendant une séance ni à la correction", async ({ page }) => {
      await page.goto("/entrainement/eopan");
      await page.getByRole("button", { name: /Commencer la série/i }).click();
      await page.waitForSelector(SEANCE);
      expect(await violations(page), "en séance").toEqual([]);

      await page.locator(SEANCE).first().click();
      await page.getByRole("button", { name: /^Valider$/ }).click();
      await expect(page.getByRole("group", { name: "Correction" })).toBeVisible();
      // C'est ici que les 58 nœuds de contraste étaient mesurés.
      expect(await violations(page), "en correction").toEqual([]);
    });

    test("l'examen BIA ne produit plus de violation en séance", async ({ page }) => {
      await page.goto("/bia/examen-blanc");
      await page.getByRole("button", { name: /Commencer l’examen/i }).click();
      await page.waitForSelector(SEANCE, { timeout: 20000 });
      expect(await violations(page)).toEqual([]);
    });
  });
}

test.describe("contrat de focus et d'annonce", () => {
  test("le focus suit les transitions du quiz, sans double lecture", async ({ page }) => {
    await page.goto("/entrainement/eopan");
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await page.waitForSelector(SEANCE);

    // Démarrage : le focus entre dans la séance au lieu de retomber sur body.
    expect(await focalise(page)).toMatch(/^Question 1 sur \d+$/);

    await page.locator(SEANCE).first().click();
    await page.getByRole("button", { name: /^Valider$/ }).click();

    // Validation : le focus va sur la correction, la région porte le verdict.
    await expect(page.getByRole("group", { name: "Correction" })).toBeFocused();
    expect((await annonce(page)).join(" ")).toMatch(/Bonne réponse\.|Réponse incorrecte\./);

    await page.getByRole("button", { name: /Question suivante/i }).click();

    // Changement de question : le focus dit la position, la région se tait —
    // sans quoi la même information serait lue deux fois.
    expect(await focalise(page)).toMatch(/^Question 2 sur \d+$/);
    expect(await annonce(page)).toEqual([]);
  });

  test("l'arrivée aux résultats annonce le score", async ({ page }) => {
    await page.goto("/entrainement/eopan");
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await page.waitForSelector(SEANCE);

    for (let i = 0; i < 40; i++) {
      if (await page.getByRole("group", { name: "Résultats" }).count()) break;
      const valider = page.getByRole("button", { name: /^Valider$/ });
      if (await valider.count()) {
        await page.locator(SEANCE).first().click();
        await valider.click();
      }
      const suite = page.getByRole("button", { name: /Question suivante|Voir le résultat/i });
      if (await suite.count()) await suite.click();
    }

    await expect(page.getByRole("group", { name: "Résultats" })).toBeFocused();
    expect((await annonce(page)).join(" ")).toMatch(/Séance terminée\. Score : \d+ sur \d+\./);
  });

  test("le focus suit la navigation entre questions de l'examen", async ({ page }) => {
    await page.goto("/bia/examen-blanc");
    await page.getByRole("button", { name: /Commencer l’examen/i }).click();
    await page.waitForSelector(SEANCE, { timeout: 20000 });
    expect(await focalise(page)).toMatch(/^Question 1 sur \d+$/);

    await page.getByRole("button", { name: /^Suivante$/ }).click();
    expect(await focalise(page)).toMatch(/^Question 2 sur \d+$/);
  });

  test("le focus n'est pas volé si l'utilisateur l'a placé ailleurs", async ({ page }) => {
    await page.goto("/entrainement/eopan");
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await page.waitForSelector(SEANCE);

    await page.locator(SEANCE).first().click();
    // On pose délibérément le focus sur un élément hors de la zone remplacée…
    const ailleurs = page.getByRole("button", { name: /Nouvelle série/i });
    await ailleurs.focus();
    // …puis on déclenche la transition sans lui rendre le focus.
    await page.getByRole("button", { name: /^Valider$/ }).dispatchEvent("click");
    await page.waitForTimeout(400);

    // La règle doit avoir refusé le déplacement. C'est ce cas qui a révélé, à
    // la première exécution, que mémoriser le dernier focus au lieu du bouton
    // actionné rendait la garde inopérante.
    expect(await focalise(page)).toMatch(/Nouvelle série/);
  });
});
