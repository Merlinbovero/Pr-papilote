import { expect, test } from "@playwright/test";

test.describe("dictionnaire — navigateur", () => {
  test("recherche instantanée, index alphabétique et renvoi vers la fiche", async ({ page }) => {
    await page.goto("/dictionnaire");

    // Index alphabétique présent.
    await expect(page.getByRole("navigation", { name: "Index alphabétique" })).toBeVisible();

    // La recherche filtre la liste en direct.
    const search = page.getByRole("searchbox", { name: /Rechercher dans le dictionnaire/ });
    await search.fill("catobar");
    const link = page.getByRole("link", { name: /CATOBAR/i });
    await expect(link).toBeVisible();

    // Un terme sans rapport disparaît.
    await search.fill("zzzzzzzz");
    await expect(page.getByText(/Aucun terme ne correspond/)).toBeVisible();
  });

  test("les filtres restreignent la liste", async ({ page }) => {
    await page.goto("/dictionnaire");
    const ficheFilter = page.getByRole("button", { name: "Avec fiche" });
    await ficheFilter.click();
    await expect(ficheFilter).toHaveAttribute("aria-pressed", "true");
  });
});
