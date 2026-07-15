import { expect, test } from "@playwright/test";

test.describe("moteur de recherche", () => {
  test("l'alias CDG mène au Charles de Gaulle", async ({ page }) => {
    await page.goto("/recherche?q=CDG");
    await expect(
      page
        .getByRole("list", { name: "Résultats de recherche" })
        .getByText("Porte-avions Charles de Gaulle")
    ).toBeVisible();
  });

  test("« porte avion » (pluriel, sans tiret) classe le porte-avions en premier", async ({
    page,
  }) => {
    await page.goto("/recherche?q=porte+avion");
    const results = page.getByRole("list", { name: "Résultats de recherche" });
    await expect(results.getByRole("link").first()).toContainText("Porte-avions Charles de Gaulle");
  });

  test("les résultats affichent type et contexte", async ({ page }) => {
    await page.goto("/recherche?q=rafale");
    const results = page.getByRole("list", { name: "Résultats de recherche" });
    await expect(results.getByText("Rafale M", { exact: true })).toBeVisible();
    await expect(results.getByText("Fiche").first()).toBeVisible();
    await expect(results.getByText(/EOPAN/).first()).toBeVisible();
  });

  test("jamais d'impasse : une requête inconnue propose des issues", async ({ page }) => {
    await page.goto("/recherche?q=zzzzzz");
    // pas de zone morte : le bloc d'aide et les portes d'entrée sont là
    await expect(page.getByText(/Rien ne correspond|recherche élargie/)).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "EOPAN" })).toBeVisible();
  });

  test("la barre de recherche de l'accueil ouvre la palette", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("main")
      .getByRole("button", { name: /Rechercher un appareil/ })
      .click();
    await page.getByPlaceholder("Appareil, notion, procédure, sigle…").fill("catobar");
    await expect(page.getByRole("option", { name: /CATOBAR/ }).first()).toBeVisible();
  });
});
