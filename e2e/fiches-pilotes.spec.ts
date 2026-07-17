import { expect, test } from "@playwright/test";

test.describe("fiches pilotes — gabarit sur le graphe réel", () => {
  test("la fiche Rafale M rend le gabarit complet avec ses relations", async ({ page }) => {
    await page.goto("/eopan/appareils/rafale-m");

    await expect(page.getByRole("heading", { level: 1, name: "Rafale M" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "L'essentiel" })).toBeVisible();
    await expect(page.getByText(/Vérifié le/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources et références" })).toBeVisible();
    // Gabarit Appareils : statut de service + caractéristiques techniques.
    await expect(page.getByText("En service").first()).toBeVisible();
    const specs = page.getByRole("region", { name: "Caractéristiques techniques" });
    await expect(specs.getByText("Envergure")).toBeVisible();
    await expect(specs.getByText("Motorisation")).toBeVisible();
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
    // Ancré en début de nom accessible : d'autres cartes peuvent citer
    // « Rafale M » dans leur résumé (ex. Super-Étendard).
    await expect(page.getByRole("link", { name: /^Rafale M/ })).toBeVisible();
  });

  test("la fiche propose un mini-quiz jouable de la notion", async ({ page }) => {
    await page.goto("/eopan/appareils/rafale-m");
    const section = page.getByRole("region", { name: "Tester cette notion" });
    await expect(section).toBeVisible();
    await section.getByRole("button", { name: "Tester cette notion" }).click();
    // Le player affiche une première question à répondre.
    await expect(page.getByText(/Question 1 \//)).toBeVisible();
    await expect(page.getByRole("button", { name: "Valider" })).toBeVisible();
  });

  test("le dictionnaire renvoie vers la fiche complète", async ({ page }) => {
    await page.goto("/dictionnaire/catobar");
    await expect(page.getByRole("heading", { level: 1, name: "CATOBAR" })).toBeVisible();
    await page.getByRole("link", { name: /Fiche complète/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "CATOBAR" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "L'essentiel" })).toBeVisible();
  });
});
