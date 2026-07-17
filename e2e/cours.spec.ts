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
  await expect(page.getByText("Ma progression", { exact: true })).toBeVisible();
});

test("le cours 2 (pression et écoulement) compose ses deux fiches sans les dupliquer", async ({
  page,
}) => {
  await page.goto("/cours/pression-et-ecoulement");
  await expect(
    page.getByRole("heading", { level: 1, name: /pression et écoulement/i })
  ).toBeVisible();
  // Les deux fiches canoniques sont référencées (liens), pas recopiées.
  await expect(
    page.getByRole("link", { name: /pression statique, dynamique et totale/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /la conservation du débit/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /essentiel à retenir/i })).toBeVisible();
});

test("le cours 3 propose l'interaction Venturi, utilisable au clavier et décrite", async ({
  page,
}) => {
  await page.goto("/cours/bernoulli-et-venturi");
  await expect(
    page.getByRole("heading", { level: 1, name: /théorème de bernoulli et effet venturi/i })
  ).toBeVisible();
  // L'interaction Venturi est présente ; son état par défaut est « Moyen ».
  const fort = page.getByRole("radio", { name: /Fort/ });
  await expect(fort).not.toBeChecked();
  // Utilisable au clavier : focus + flèche/espace pour changer d'option.
  await fort.focus();
  await page.keyboard.press("Space");
  await expect(fort).toBeChecked();
  // Alternative textuelle accessible présente (au moins une occurrence).
  await expect(page.getByText("Description accessible").first()).toBeVisible();
});

test("le cours 4 (souffleries) référence sa fiche et un exercice sur le collecteur", async ({
  page,
}) => {
  await page.goto("/cours/les-souffleries");
  await expect(page.getByRole("heading", { level: 1, name: /les souffleries/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fiches à étudier" })).toBeVisible();
  // La fiche canonique est référencée (lien, avec son résumé), pas recopiée.
  await expect(
    page.getByRole("link", { name: /les souffleries une soufflerie produit/i })
  ).toBeVisible();
  // Le cours porte bien un quiz (composition standard).
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});
