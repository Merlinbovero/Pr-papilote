import { expect, test } from "@playwright/test";

/**
 * Révision espacée (P2). Vérifie qu'une séance se lance sur un concours choisi,
 * qu'une question apparaît, et qu'une réponse est prise en compte (échéance
 * mémorisée localement par le planificateur de Leitner).
 */

test("une séance de révision se lance et enregistre une réponse", async ({ page }) => {
  await page.goto("/reviser");
  await expect(page.getByRole("heading", { level: 1, name: "Réviser" })).toBeVisible();

  // Choix du concours puis lancement (vivier récupéré à la demande).
  await page.getByRole("button", { name: "EOPAN", exact: true }).click();
  await page.getByRole("button", { name: /Commencer la révision/i }).click();

  // Une première question de la file du jour s'affiche.
  await expect(page.getByText(/Question 1 \//)).toBeVisible();

  // On répond : la validation révèle la correction (l'échéance est enregistrée).
  await page.locator('ul[role="list"] > li button').first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText(/Bonne réponse|Réponse incorrecte/)).toBeVisible();
});

test("le hub d'un concours renvoie vers la révision espacée", async ({ page }) => {
  await page.goto("/eopn");
  await expect(page.getByRole("link", { name: /Révision espacée/i })).toBeVisible();
});
