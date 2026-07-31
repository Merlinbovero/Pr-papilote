import { expect, test } from "@playwright/test";

/**
 * Le parcours « je prépare un concours », de l'accueil aux outils du concours.
 *
 * **Ce fichier a été rebranché au lot M10, et il ne teste plus la même chose.**
 *
 * Il vérifiait « Ma préparation » (lot P4) : un bandeau de l'accueil où le
 * candidat choisissait son concours cible, mémorisé en `localStorage`, qui
 * basculait ensuite en tableau de bord. Ce bandeau **n'existe plus dans `src/`**
 * — le repère `region « Ma préparation »` est introuvable et aucun composant ne
 * porte plus cet état. Le test échouait donc depuis avant le lot M3, en
 * décrivant une interface disparue.
 *
 * Le supprimer aurait laissé sans contrôle le parcours d'entrée du produit, qui
 * est sa fonction la plus importante. Il porte désormais sur le parcours
 * **réellement offert** : l'accueil oriente vers un concours, le hub du concours
 * donne accès à ses outils. Si « Ma préparation » revient un jour, ce fichier
 * accueillera ses propres assertions — il ne les invente pas d'ici là.
 */

test("l’accueil oriente vers un concours et le hub donne accès à ses outils", async ({ page }) => {
  await page.goto("/");

  // 1. L'accueil propose explicitement de choisir un concours.
  const choisir = page.getByRole("link", { name: /Choisir mon concours/i });
  await expect(choisir).toBeVisible();
  await expect(choisir).toHaveAttribute("href", "#concours");

  // 2. La section existe vraiment : l'ancre ne mène pas dans le vide.
  await expect(page.locator("#concours")).toHaveCount(1);

  // 3. Les trois concours y sont atteignables.
  for (const [nom, href] of [
    ["EOPAN", "/eopan"],
    ["EOPN", "/eopn"],
    ["ALAT", "/alat"],
  ] as const) {
    await expect(page.locator(`a[href="${href}"]`).first(), nom).toBeVisible();
  }

  // 4. Depuis le hub d'un concours, ses outils sont à un clic. C'est ce que le
  //    tableau de bord disparu offrait, et c'est ce qui doit rester vrai.
  await page.goto("/eopn");
  for (const href of [
    "/entrainement/eopn",
    "/fiche-de-travail/eopn",
    "/progression/eopn",
    "/reviser",
  ]) {
    await expect(page.locator(`a[href="${href}"]`).first(), href).toHaveCount(1);
  }
});
