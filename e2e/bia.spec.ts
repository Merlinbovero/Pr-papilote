import { expect, test } from "@playwright/test";

test.describe("parcours BIA", () => {
  test("le hub présente les cinq matières et l'examen blanc", async ({ page }) => {
    await page.goto("/bia");

    await expect(page.getByRole("heading", { level: 1, name: "Parcours BIA" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Météorologie et aérologie/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Histoire et culture de l'aéronautique/ })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Examen blanc/ })).toBeVisible();
  });

  test("une page matière liste ses fiches et propose le quiz", async ({ page }) => {
    await page.goto("/bia/meteorologie-aerologie");

    await expect(
      page.getByRole("heading", { level: 1, name: "Météorologie et aérologie" })
    ).toBeVisible();
    // Une fiche réelle de la matière, atteignable depuis le parcours.
    await expect(page.getByRole("link", { name: /Masses d'air et fronts/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lancer une série" })).toBeVisible();
  });

  test("le quiz thématique se joue jusqu'à la correction", async ({ page }) => {
    await page.goto("/bia/meteorologie-aerologie");
    await page.getByRole("button", { name: "Lancer une série" }).click();

    await expect(page.getByText(/Question 1 \/ /)).toBeVisible();
    // Répond à la première question (premier choix du lecteur) et attend la correction.
    const quiz = page.getByRole("region", { name: /^Quiz — / });
    await quiz.getByRole("listitem").first().getByRole("button").click();
    await page.getByRole("button", { name: "Valider" }).click();
    await expect(page.getByText(/Bonne réponse|Réponse incorrecte/)).toBeVisible();
  });

  test("l'examen blanc démarre, navigue, se termine et se corrige", async ({ page }) => {
    await page.goto("/bia/examen-blanc");

    await expect(page.getByRole("heading", { level: 1, name: "Examen blanc BIA" })).toBeVisible();
    await page.getByRole("button", { name: "Commencer l'examen" }).click();

    // L'examen tourne : question 1, chronomètre, navigation.
    await expect(page.getByText(/Question 1 \/ /)).toBeVisible();
    await page.getByRole("button", { name: "Marquer" }).click();
    await expect(page.getByRole("button", { name: "Marquée", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Suivante" }).click();
    await expect(page.getByText(/Question 2 \/ /)).toBeVisible();

    // La grille de navigation ramène à la première question.
    await page
      .getByRole("navigation", { name: "Navigation entre les questions" })
      .getByRole("button", { name: /^Question 1(,|$)/ })
      .click();
    await expect(page.getByText(/Question 1 \/ /)).toBeVisible();

    // Termine sans tout remplir : correction, note, erreurs listées.
    await page.getByRole("button", { name: "Terminer l'examen" }).click();
    await expect(page.getByText(/\/20/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Mes erreurs/ })).toBeVisible();
    await expect(page.getByText("Non admis")).toBeVisible();
  });
});
