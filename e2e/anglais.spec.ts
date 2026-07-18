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
  // Carte repérée par sa position (son libellé change après révélation).
  const vocab = page.getByRole("region", { name: "Vocabulaire bilingue" });
  const firstCard = vocab.locator("button[aria-expanded]").first();
  await expect(firstCard).toHaveAttribute("aria-expanded", "false");
  await firstCard.click();
  await expect(firstCard).toHaveAttribute("aria-expanded", "true");
});

test("l'épeleur de l'alphabet OACI transcrit un mot", async ({ page }) => {
  await page.goto("/anglais");
  const speller = page.getByRole("region", { name: "Épeler un mot" });
  await page.getByLabel("Mot à épeler").fill("RAF");
  // R A F → Romeo Alfa Foxtrot
  await expect(speller.getByText("Romeo")).toBeVisible();
  await expect(speller.getByText("Alfa")).toBeVisible();
  await expect(speller.getByText("Foxtrot")).toBeVisible();
});

test("le quiz d'anglais se lance", async ({ page }) => {
  await page.goto("/anglais");
  await page.getByRole("radio", { name: "10 questions" }).click();
  await page.getByRole("button", { name: /Commencer la série/i }).click();
  await expect(page.getByText(/Question 1 \//)).toBeVisible();
});
