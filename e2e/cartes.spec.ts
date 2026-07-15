import { expect, test } from "@playwright/test";

test.describe("cartes des bases", () => {
  test("le hub présente les trois cartes avec leurs comptes", async ({ page }) => {
    await page.goto("/cartes");
    await expect(page.getByRole("heading", { level: 1, name: "Cartes des bases" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Aéronautique navale/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Armée de l'Air et de l'Espace/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /ALAT Écoles, régiments/ })).toBeVisible();
  });

  test("un marqueur ouvre le panneau de détail relié au graphe", async ({ page }) => {
    await page.goto("/cartes/aeronavale");

    // Sélection via la liste (équivalent clavier du marqueur).
    await page
      .getByRole("list", { name: "Liste des implantations" })
      .getByRole("button", { name: /BAN Lanvéoc-Poulmic/ })
      .click();

    const panel = page.getByRole("complementary", { name: "Détail de l'implantation" });
    await expect(panel.getByRole("heading", { name: "BAN Lanvéoc-Poulmic" })).toBeVisible();
    await expect(panel.getByText(/Finistère/)).toBeVisible();
    await expect(panel.getByRole("link", { name: "Lire la fiche complète →" })).toBeVisible();
    // Lien de graphe : la présélection en vol se trouve sur la même base.
    await panel.getByRole("link", { name: /présélection en vol/i }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: /La présélection en vol/ })
    ).toBeVisible();
  });

  test("les filtres par rôle restreignent la liste", async ({ page }) => {
    await page.goto("/cartes/armee-de-l-air");

    await page.getByRole("button", { name: /^École \(/ }).click();
    const liste = page.getByRole("list", { name: "Liste des implantations" });
    await expect(liste.getByRole("button", { name: /Salon-de-Provence/ })).toBeVisible();
    await expect(liste.getByRole("button", { name: /Saint-Dizier/ })).not.toBeVisible();

    await page.getByRole("button", { name: "Tout afficher" }).click();
    await expect(liste.getByRole("button", { name: /Saint-Dizier/ })).toBeVisible();
  });

  test("la carte SVG rend les marqueurs accessibles", async ({ page }) => {
    await page.goto("/cartes/alat");
    const svg = page.getByRole("group", { name: /Carte des implantations/ });
    await expect(svg).toBeVisible();
    await expect(
      svg.getByRole("button", { name: /1er RHC — Phalsbourg — Phalsbourg/ })
    ).toBeVisible();
  });
});
