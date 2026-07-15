import { expect, test } from "@playwright/test";

test.describe("gestion documentaire (chapitre 8)", () => {
  test("la notice de document se consulte sur le site", async ({ page }) => {
    await page.goto("/design-system/document");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Consultation sur site : résumé lisible sans quitter la plateforme
    await expect(page.getByRole("heading", { name: "Résumé" })).toBeVisible();
    // Le lien officiel s'ajoute, il ne remplace pas la consultation
    await expect(page.getByRole("link", { name: /Consulter la source officielle/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Fiches associées" })).toBeVisible();
  });

  test("la fiche affiche l'historique des révisions avec motif", async ({ page }) => {
    await page.goto("/design-system/fiche");

    const history = page.getByRole("main").getByText("Historique des révisions");
    await expect(history).toBeVisible();
    await expect(page.getByText(/Mise à jour des données de l'infobox/)).toBeVisible();
  });
});
