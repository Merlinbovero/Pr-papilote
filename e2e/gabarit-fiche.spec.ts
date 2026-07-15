import { expect, test } from "@playwright/test";

test.describe("gabarit officiel de fiche (prévisualisation interne)", () => {
  test("rend toutes les zones du gabarit", async ({ page }) => {
    await page.goto("/design-system/fiche");

    await expect(
      page.getByRole("heading", { level: 1, name: "Appareil de démonstration" })
    ).toBeVisible();
    await expect(page.getByText(/Vérifié le/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "L'essentiel" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pièges et erreurs fréquentes/ })).toBeVisible();
    await expect(page.getByText("Expert", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources et références" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /S'entraîner/ })).toBeVisible();
  });

  test("le sommaire ancre vers les sections", async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), "sommaire latéral desktop uniquement");
    await page.goto("/design-system/fiche");
    await page.getByRole("link", { name: "Sources et références" }).click();
    await expect(page).toHaveURL(/#sources$/);
  });
});
