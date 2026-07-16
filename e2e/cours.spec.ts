import { expect, test } from "@playwright/test";

/**
 * Cours (architecture pédagogique Lot 2B). Vérifie que le cours 1 est
 * consultable, que l'interaction « forces et vecteurs » est utilisable au
 * clavier et dispose d'une alternative textuelle, et que la progression se
 * met en route.
 */

const COURSE = "/cours/forces-et-lois-de-newton";

test("le cours 1 s'affiche avec ses sections clés", async ({ page }) => {
  await page.goto(COURSE);
  await expect(
    page.getByRole("heading", { level: 1, name: /forces et lois de newton/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Objectifs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fiches à étudier" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /essentiel à retenir/i })).toBeVisible();
  // La même fiche est référencée (pas de duplication) et cliquable.
  await expect(page.getByRole("link", { name: /les trois lois de newton/i })).toBeVisible();
});

test("l'interaction forces/vecteurs est utilisable au clavier et décrite", async ({ page }) => {
  await page.goto(COURSE);
  const traction = page.getByRole("checkbox", { name: "Traction" });
  await expect(traction).toBeChecked();
  // Utilisable au clavier : focus + espace pour décocher.
  await traction.focus();
  await page.keyboard.press("Space");
  await expect(traction).not.toBeChecked();
  // Alternative textuelle accessible présente.
  await expect(page.getByText("Description accessible")).toBeVisible();
});

test("la progression démarre (découverte) au chargement", async ({ page }) => {
  await page.goto(COURSE);
  await expect(page.getByText("Ma progression")).toBeVisible();
});
