import { expect, test } from "@playwright/test";

test.describe("tableau de bord de progression (prévisualisation)", () => {
  test("reste sobre : reprendre, repères, à travailler, maîtrise", async ({ page }) => {
    await page.goto("/design-system/progression");

    await expect(page.getByRole("heading", { level: 1, name: "Ma progression" })).toBeVisible();

    // « Reprendre » en tête : le point de reprise immédiat (delta séries, sans streak)
    await expect(page.getByRole("heading", { name: "Reprendre", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reprendre", exact: true })).toBeVisible();

    // Le chemin parcouru (règle n°4), jamais un streak
    await expect(page.getByText("En préparation depuis")).toBeVisible();
    await expect(page.getByText("Heures investies")).toBeVisible();
    await expect(page.getByText(/série|streak|jour \d+ de/i)).toHaveCount(0);

    // À travailler aujourd'hui : recommandations avec motif
    await expect(page.getByRole("list", { name: "Recommandations" })).toBeVisible();
    await expect(page.getByText(/Réviser vos erreurs/)).toBeVisible();

    // Objectifs personnels (delta objectifs)
    await expect(page.getByRole("list", { name: "Objectifs" })).toBeVisible();

    // Maîtrise par thème ET par compétence (delta compétences)
    await expect(page.getByRole("list", { name: "Maîtrise par thème" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Maîtrise par compétence" })).toBeVisible();
  });
});
