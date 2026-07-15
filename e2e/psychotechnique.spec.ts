import { expect, test } from "@playwright/test";

test.describe("entraînement psychotechnique", () => {
  test("le hub du module mène à l'entraînement", async ({ page }) => {
    await page.goto("/psychotechnique");
    await page.getByRole("link", { name: /Entraînement chronométré/ }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Entraînement psychotechnique" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Courte — 10 questions/ })).toBeVisible();
  });

  test("une session courte se lance, se joue et se corrige", async ({ page }) => {
    await page.goto("/psychotechnique/entrainement");
    await page.getByRole("button", { name: /Courte — 10 questions/ }).click();

    // Consignes standardisées puis démarrage.
    await expect(page.getByRole("heading", { name: /Consignes — 10 questions/ })).toBeVisible();
    await page.getByRole("button", { name: "Démarrer" }).click();

    // Boucle : répondre (ou attendre la fin d'exposition mémoire) jusqu'au bout.
    for (let i = 0; i < 10; i += 1) {
      // La phase d'exposition (mémoire) n'a pas de choix — attendre qu'ils arrivent.
      const firstChoice = page
        .getByRole("region", { name: "Question en cours" })
        .getByRole("listitem")
        .first()
        .getByRole("button");
      await firstChoice.waitFor({ state: "visible", timeout: 15000 });
      await firstChoice.click();
      await expect(page.getByText(/Bonne réponse|Réponse incorrecte|Temps écoulé/)).toBeVisible();
      await page
        .getByRole("button", { name: i === 9 ? "Voir le résultat" : "Question suivante" })
        .click();
    }

    // Score final : précision, vitesse, détail par famille.
    await expect(page.getByText("Session terminée")).toBeVisible();
    await expect(page.getByText(/Précision \d+ %/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Nouvelle session" })).toBeVisible();
  });

  test("la session personnalisée respecte le choix des familles", async ({ page }) => {
    await page.goto("/psychotechnique/entrainement");

    // Ne garder que le calcul mental.
    for (const family of [
      "Suites numériques",
      "Séries logiques",
      "Mémoire",
      "Attention",
      "Orientation",
      "Rapidité et précision",
    ]) {
      await page.getByRole("button", { name: family, exact: true }).click();
    }
    await page.getByLabel("Nombre de questions").selectOption("10");
    await page.getByRole("button", { name: "Lancer la session personnalisée" }).click();

    await expect(page.getByRole("heading", { name: /Consignes — 10 questions/ })).toBeVisible();
    await expect(page.getByText(/Calcul mental —/)).toBeVisible();
    await expect(page.getByText(/Suites numériques —/)).not.toBeVisible();
  });
});
