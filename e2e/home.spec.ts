import { expect, test } from "@playwright/test";

test("la page d'accueil se charge sans erreur", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  expect(errors).toEqual([]);
});

test("l'accueil présente les cinq portes d'entrée", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  for (const name of [
    "EOPAN",
    "EOPN",
    "ALAT",
    "Tests psychotechniques",
    "Fondamentaux aéronautiques",
  ]) {
    await expect(main.getByRole("link", { name })).toBeVisible();
  }
});

test("navigation accueil → hub EOPAN → catégorie Appareils", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "EOPAN", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "EOPAN" })).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Appareils" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Appareils" })).toBeVisible();
  await expect(page.getByLabel("Fil d'Ariane")).toContainText("EOPAN");
});

test("une URL de module inconnue renvoie une page 404", async ({ page }) => {
  const response = await page.goto("/module-inexistant");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
});
