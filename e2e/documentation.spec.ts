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

  test("une fiche affiche l'historique de ses révisions avec le motif", async ({ page }) => {
    // **Rebranché au lot M10.** Ce test visait la vitrine `/design-system/fiche`,
    // supprimée avec la charte historique qu'elle documentait. La garantie
    // qu'il portait — un document expose l'historique de ses révisions et le
    // MOTIF de chacune — n'est pas propre à la vitrine : elle vaut pour le
    // corpus réel, où elle compte davantage. Le contrôle porte donc sur une
    // fiche publiée.
    await page.goto("/culture/personnalites/helene-boucher");

    const annexe = page.locator(".pl-annexe");
    await expect(annexe.getByText("Historique")).toBeVisible();

    // Chaque entrée porte sa date, sa version et son motif — le motif est le
    // point : une révision sans raison consignée ne documente rien.
    const entrees = annexe.locator(".pl-chrono");
    expect(await entrees.count()).toBeGreaterThan(0);
    const premiere = (await entrees.first().innerText()).replace(/\s+/g, " ");
    expect(premiere, "date").toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(premiere, "version").toMatch(/v\d/);
    expect(premiere.length, "motif").toBeGreaterThan(20);
  });
});
