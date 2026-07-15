import { expect, test, type Page } from "@playwright/test";

/**
 * Ouvre l'accès aux concours : tiroir sur mobile, menu déroulant « Concours »
 * sur desktop. Renvoie le repère de navigation qui contient alors les liens.
 */
async function openConcours(page: Page) {
  const burger = page.getByRole("button", { name: "Ouvrir le menu" });
  if (await burger.isVisible()) {
    await burger.click();
  } else {
    await page.getByRole("button", { name: "Concours" }).click();
  }
  return page.getByRole("navigation", { name: "Navigation principale" });
}

test.describe("navigation globale", () => {
  test("le header mène aux concours", async ({ page }) => {
    await page.goto("/");
    const nav = await openConcours(page);
    await nav.getByRole("link", { name: /EOPAN/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "EOPAN" })).toBeVisible();
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
