import { expect, test } from "@playwright/test";

/**
 * Espace « Anglais aéronautique » (ANG-1). Vérifie que le hub réunit les trois
 * briques (manuel/textes, vocabulaire bilingue, quiz), que le vocabulaire
 * révèle la traduction et que le quiz se lance.
 */

test("le hub anglais réunit fiches, vocabulaire et quiz", async ({ page }) => {
  await page.goto("/anglais");
  await expect(
    page.getByRole("heading", { level: 1, name: /espace anglais des sélections/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /manuel et les textes en anglais/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Vocabulaire bilingue/i })).toBeVisible();
});

test("le vocabulaire bilingue révèle la traduction au clic", async ({ page }) => {
  await page.goto("/anglais");
  const firstCard = page.getByRole("button", { name: /Afficher la traduction/ }).first();
  await firstCard.click();
  await expect(firstCard).toHaveAttribute("aria-expanded", "true");
});

test("le quiz d'anglais se lance", async ({ page }) => {
  await page.goto("/anglais");
  await page.getByRole("radio", { name: "10 questions" }).click();
  await page.getByRole("button", { name: /Commencer la série/i }).click();
  await expect(page.getByText(/Question 1 \//)).toBeVisible();
});
