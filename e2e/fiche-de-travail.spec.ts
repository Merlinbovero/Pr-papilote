import { expect, test } from "@playwright/test";

/**
 * Fiche de travail imprimable par concours : feuille de route avec cases à
 * cocher (suivi papier). Vérifie la présence des sections et des cases, et
 * qu'une case se coche à l'écran.
 */

test("la fiche de travail EOPAN présente la route et des cases à cocher", async ({ page }) => {
  await page.goto("/fiche-de-travail/eopan");
  await expect(page.getByRole("heading", { level: 1, name: /Préparation EOPAN/i })).toBeVisible();

  // Les grandes étapes de la route sont présentes.
  await expect(page.getByRole("heading", { name: /Parcours — Mécanique du vol/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /socle commun — Fondamentaux/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Psychotechnique/i })).toBeVisible();

  // Une case au moins, cochable à l'écran.
  const first = page.getByRole("checkbox").first();
  await expect(first).not.toBeChecked();
  await first.check();
  await expect(first).toBeChecked();
});

test("le hub d'un concours renvoie vers la fiche de travail", async ({ page }) => {
  await page.goto("/alat");
  await expect(page.getByRole("link", { name: /Fiche de travail/i })).toHaveAttribute(
    "href",
    "/fiche-de-travail/alat"
  );
});
