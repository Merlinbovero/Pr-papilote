import { expect, test } from "@playwright/test";

/**
 * L'index du design system — outil interne, système ACTIF.
 *
 * Après la suppression de la vitrine historique `/design-system/fiche` au lot
 * M10, cette page est la seule à monter `Callout`, `DataGrid` et `Timeline`.
 * Ces trois composants ne sont donc pas du code mort maintenu par accident :
 * ils appartiennent au système vivant, et ce contrôle l'atteste.
 *
 * Statut de la page, vérifié ici plutôt que supposé : jamais indexée, servie
 * seulement derrière `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM` en production, absente de
 * la navigation publique.
 */
test.describe("index du design system", () => {
  test("les trois composants conservés sont bien rendus", async ({ page }) => {
    const reponse = await page.goto("/design-system");
    expect(reponse?.status()).toBe(200);

    // Les trois sont vérifiés par ce qu'ils PRODUISENT, pas par une classe :
    // un sélecteur de style se périmerait au premier ajustement visuel.

    // Callout — encadré à libellé de variante, ici « Portance » en définition.
    await expect(page.getByText("Portance").first()).toBeVisible();

    // DataGrid — grille de données étiquetées.
    await expect(page.getByText("Constructeur").first()).toBeVisible();
    await expect(page.getByText("Dassault Aviation").first()).toBeVisible();

    // Timeline — chronologie : une liste ordonnée avec au moins deux entrées.
    const chrono = page.locator("ol.relative").first();
    await expect(chrono).toBeVisible();
    expect(await chrono.locator("li").count()).toBeGreaterThan(1);
  });

  test("la page n’est jamais indexable", async ({ page }) => {
    await page.goto("/design-system");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots, "doit porter noindex").toMatch(/noindex/);
  });
});
