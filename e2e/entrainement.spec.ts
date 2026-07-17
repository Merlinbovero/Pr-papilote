import { expect, test } from "@playwright/test";

/**
 * Entraînement libre par concours (P1a). Vérifie qu'un candidat peut lancer une
 * série sur la banque du concours, répondre à une question et obtenir la
 * correction — le vivier étant récupéré à la demande depuis la route statique.
 */

test("le hub d'un concours propose un accès à l'entraînement", async ({ page }) => {
  await page.goto("/eopan");
  await expect(page.getByRole("link", { name: /S'entraîner/i })).toBeVisible();
});

test("une série d'entraînement se lance et se corrige", async ({ page }) => {
  await page.goto("/entrainement/eopan");
  await expect(page.getByRole("heading", { level: 1, name: /S'entraîner — EOPAN/i })).toBeVisible();

  // Choix de la longueur puis lancement (vivier récupéré à la demande).
  await page.getByRole("radio", { name: "10 questions" }).click();
  await page.getByRole("button", { name: /Commencer la série/i }).click();

  // Le player affiche la première question.
  await expect(page.getByText(/Question 1 \//)).toBeVisible();

  // On répond : sélection du premier choix puis validation → correction.
  await page.getByRole("button", { name: "Valider" }).waitFor();
  await page.locator('ul[role="list"] > li button').first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText(/Bonne réponse|Réponse incorrecte/)).toBeVisible();

  // On peut relancer une nouvelle série sans recharger.
  await expect(page.getByRole("button", { name: /Nouvelle série/i })).toBeVisible();
});
