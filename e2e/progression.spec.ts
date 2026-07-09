import { expect, test } from "@playwright/test";

test.describe("tableau de bord de progression (prévisualisation)", () => {
  test("montre le parcours dans le temps, la maîtrise et les recommandations", async ({ page }) => {
    await page.goto("/design-system/progression");

    await expect(page.getByRole("heading", { level: 1, name: "Ma progression" })).toBeVisible();

    // Le chemin parcouru (règle n°4), jamais un streak
    await expect(page.getByText("En préparation depuis")).toBeVisible();
    await expect(page.getByText("Heures investies")).toBeVisible();
    await expect(page.getByText(/série|streak|jour \d+ de/i)).toHaveCount(0);

    // Maîtrise par thème et recommandations avec motif
    await expect(page.getByRole("list", { name: "Maîtrise par thème" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Recommandations" })).toBeVisible();
    await expect(page.getByText(/Réviser vos erreurs/)).toBeVisible();
  });
});
