import { expect, test } from "@playwright/test";

test.describe("lecteur de quiz (prévisualisation)", () => {
  test("déroule une question : réponse, correction, question suivante, résultat", async ({
    page,
  }) => {
    await page.goto("/design-system/quiz");
    await expect(
      page.getByRole("heading", { level: 1, name: "Quiz de démonstration" })
    ).toBeVisible();

    // Bouton Valider désactivé tant qu'aucun choix n'est sélectionné
    await expect(page.getByRole("button", { name: "Valider" })).toBeDisabled();

    // Répondre à la première question
    await page.getByRole("button", { name: /Réponse fictive B/ }).click();
    await page.getByRole("button", { name: "Valider" }).click();

    // La correction pédagogique apparaît
    await expect(page.getByText("Bonne réponse", { exact: true })).toBeVisible();
    await expect(page.getByText(/Explication pédagogique de démonstration/)).toBeVisible();

    // Passer à la question suivante (choix multiple)
    await page.getByRole("button", { name: "Question suivante" }).click();
    await expect(page.getByText("Plusieurs réponses possibles.")).toBeVisible();

    await page.getByRole("button", { name: /Proposition fictive 1/ }).click();
    await page.getByRole("button", { name: /Proposition fictive 3/ }).click();
    await page.getByRole("button", { name: "Valider" }).click();
    await page.getByRole("button", { name: "Voir le résultat" }).click();

    // Restitution + invitation à se connecter (rien n'est enregistré sans compte)
    await expect(page.getByRole("region", { name: "Résultat du quiz" })).toBeVisible();
    await expect(page.getByText(/Connectez-vous pour conserver/)).toBeVisible();
  });
});
