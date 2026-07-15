import { expect, test, type Page } from "@playwright/test";

/** Ouvre le tiroir mobile si présent, sinon la nav en ligne est déjà là. */
async function openNav(page: Page) {
  const burger = page.getByRole("button", { name: "Ouvrir le menu" });
  if (await burger.isVisible()) {
    await burger.click();
  }
}

test.describe("navigation globale", () => {
  test("le header mène aux concours, avec état actif", async ({ page }) => {
    await page.goto("/");
    await openNav(page);
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await nav.getByRole("link", { name: /EOPAN/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "EOPAN" })).toBeVisible();

    await openNav(page);
    await expect(nav.getByRole("link", { name: /EOPAN/ })).toHaveAttribute("aria-current", "page");
  });

  test("la page des crédits liste les auteurs et licences", async ({ page }) => {
    await page.goto("/credits-photos");
    await expect(
      page.getByRole("heading", { level: 1, name: "Crédits photographiques" })
    ).toBeVisible();
    await expect(page.getByText(/Licence/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Voir la source/ }).first()).toBeVisible();
  });
});
