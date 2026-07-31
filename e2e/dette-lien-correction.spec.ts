import { expect, test } from "@playwright/test";

/**
 * DT-002 — le lien « Pour approfondir » n'est distingué que par la couleur.
 *
 * Ce test ne vérifie pas une qualité : il **prouve que la dette existe
 * toujours**. Le contrôle axe de `fondations-a11y.spec.ts` écarte nommément
 * `link-in-text-block` ; une exclusion sans contre-preuve finirait par
 * masquer un défaut réel, et c'est ce trou que ce fichier bouche.
 *
 * **Ce qui est mesuré, et pourquoi.** La règle axe ne se déclenche qu'au
 * hasard des tirages : il faut que la question servie porte un renvoi. Elle a
 * été reproduite sur `/entrainement/eopan` en registre sombre, et sa cause
 * relevée exactement :
 *
 *     <a class="text-primary underline-offset-4 hover:underline">Flottille 4F</a>
 *     « insufficient color contrast of 1.06:1 with the surrounding text
 *       (minimum 3:1) — link #67a6fb, surrounding #a3aab5 »
 *
 * Le lien n'est donc souligné **qu'au survol** : au repos, rien ne le
 * distingue du texte hors la teinte, et cette teinte ne tient pas 3:1 contre
 * le gris environnant. C'est cette absence de repère non chromatique — la
 * cause, invariante — que ce test fige, et non la violation axe, dont
 * l'apparition dépend du tirage.
 *
 * La vitrine du design system sert de terrain déterministe : sa question de
 * démonstration porte toujours un `furtherReading`.
 *
 * **Quand la dette sera remboursée, ce test échouera.** C'est voulu : son
 * échec est le signal qu'il faut retirer l'exclusion de `HORS_PERIMETRE_F1A`,
 * puis supprimer ce fichier et la ligne DT-002 de `docs/dette-technique.md`.
 */

test("DT-002 — le lien de correction n'a pas de repère non chromatique", async ({ page }) => {
  await page.goto("/design-system/quiz");

  // On atteint la correction : c'est elle qui rend le renvoi « Pour approfondir ».
  await page.locator('section[aria-label] ul[role="list"] button').first().click();
  await page.getByRole("button", { name: /^Valider$/ }).click();
  const correction = page.getByRole("group", { name: "Correction" });
  await expect(correction).toBeVisible();

  const lien = correction.getByRole("link").first();
  // Sans lien, le test ne prouverait rien : on le vérifie avant de conclure.
  await expect(lien).toBeVisible();

  const decoration = await lien.evaluate((el) => getComputedStyle(el).textDecorationLine);

  expect(
    decoration,
    "DT-002 semble corrigé (le lien porte désormais un soulignement) : retirer " +
      "l'exclusion de HORS_PERIMETRE_F1A dans fondations-a11y.spec.ts, puis " +
      "supprimer ce fichier et la ligne DT-002 de docs/dette-technique.md"
  ).toBe("none");
});
