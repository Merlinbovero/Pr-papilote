import { expect, test } from "@playwright/test";

/**
 * « Ma préparation » (tableau de bord personnel de l'accueil). Le candidat
 * choisit son concours cible ; la sélection est mémorisée localement et le
 * bandeau bascule en tableau de bord avec des accès directs.
 */

test("choisir un concours cible affiche le tableau de bord et le mémorise", async ({ page }) => {
  await page.goto("/");

  const banner = page.getByRole("region", { name: "Ma préparation" });
  await expect(banner.getByRole("heading", { name: /Quel concours préparez-vous/i })).toBeVisible();

  // Choix du concours cible puis enregistrement.
  await banner.getByRole("radio", { name: "EOPN" }).click();
  await banner.getByRole("button", { name: "Enregistrer" }).click();

  // Bascule en tableau de bord : accès direct à l'entraînement du concours.
  await expect(banner.getByRole("link", { name: /S'entraîner/i })).toHaveAttribute(
    "href",
    "/entrainement/eopn"
  );

  // La sélection persiste après rechargement (localStorage).
  await page.reload();
  const reloaded = page.getByRole("region", { name: "Ma préparation" });
  await expect(reloaded.getByRole("link", { name: "Réviser" })).toHaveAttribute("href", "/eopn");
});
