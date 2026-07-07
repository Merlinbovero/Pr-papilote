import { expect, test } from "@playwright/test";

test.describe("fiches pilotes — gabarit sur le graphe réel", () => {
  test("la fiche Rafale M rend le gabarit complet avec ses relations", async ({ page }) => {
    await page.goto("/eopan/appareils/rafale-m");

    await expect(page.getByRole("heading", { level: 1, name: "Rafale M" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "L'essentiel" })).toBeVisible();
    await expect(page.getByText(/Vérifié le/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources et références" })).toBeVisible();
  });

  test("les liens intelligents traversent le graphe (Rafale M → Charles de Gaulle)", async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), "encarts de relations latéraux — desktop");
    await page.goto("/eopan/appareils/rafale-m");
    await page
      .getByRole("navigation", { name: "Relations directes" })
      .getByRole("link", { name: "Porte-avions Charles de Gaulle" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Porte-avions Charles de Gaulle" })
    ).toBeVisible();
    // Lien inverse calculé automatiquement
    await expect(
      page
        .getByRole("navigation", { name: "Relations directes" })
        .getByRole("link", { name: "Rafale M" })
    ).toBeVisible();
  });

  test("le hub de catégorie liste les fiches réelles", async ({ page }) => {
    await page.goto("/eopan/appareils");
    await expect(page.getByRole("link", { name: /Rafale M/ })).toBeVisible();
  });

  test("le dictionnaire renvoie vers la fiche complète", async ({ page }) => {
    await page.goto("/dictionnaire/catobar");
    await expect(page.getByRole("heading", { level: 1, name: "CATOBAR" })).toBeVisible();
    await page.getByRole("link", { name: /Lire la fiche complète/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "CATOBAR" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "L'essentiel" })).toBeVisible();
  });
});
