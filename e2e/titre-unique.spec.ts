import { expect, test } from "@playwright/test";

/**
 * Un seul titre de niveau 1 par page — sur les états réellement atteints.
 *
 * La recette de production du 2026-07-31 a relevé DEUX `<h1>` sur
 * `/psychotechnique/orientation` : celui de la page (« Test d'orientation »,
 * rendu par l'en-tête) et celui de l'exercice (« Orientation »). Un lecteur
 * d'écran perd alors le repère unique qui répond à « où suis-je ».
 *
 * ── Pourquoi ce contrôle balaie les routes ET les phases ──────────────────
 * Le relevé initial ne lisait que le HTML servi, donc le premier écran. Or
 * l'exercice d'orientation portait aussi un `<h1>` dans sa phase de jeu et
 * dans ses résultats : deux états qu'aucune inspection statique n'atteint.
 * Un contrôle qui s'arrêterait à la page chargée laisserait donc passer les
 * deux tiers du défaut.
 *
 * ── Ce que ce contrôle ne fait pas ────────────────────────────────────────
 * Il ne dit pas quel titre est le bon. La question se tranche à la lecture :
 * le titre de page est celui qui reste visible quand l'exercice change de
 * phase. Ici l'exercice est un frère rendu SOUS l'en-tête de page, jamais un
 * plein écran qui le remplacerait — c'est donc lui qui a cédé le niveau 1.
 */

/** Les routes publiques du relevé de production, telles quelles. */
const ROUTES = [
  "/",
  "/recherche",
  "/eopan",
  "/eopn",
  "/alat",
  "/bia",
  "/anglais",
  "/anglais/quiz", // née au lot F12 ; une route publique de plus, un titre de plus à tenir
  "/cartes",
  "/mentions-legales",
  "/confidentialite",
  "/contact",
  "/eopan/concepts/catobar",
  "/cours/forces-et-lois-de-newton",
  "/eopan/appareils/rafale-m",
  "/eopan/histoire/histoire-de-l-aeronautique-navale",
  "/culture/geopolitique-defense/red-flag",
  "/fondamentaux/navigation/temps-vitesse-distance",
  "/entrainement/eopan",
  "/entrainement/eopn",
  "/entrainement/alat",
  "/reviser",
  "/bia/aerodynamique-et-principes-du-vol",
  "/bia/examen-blanc",
  "/psychotechnique/entrainement",
  "/psychotechnique/calcul-mental",
  "/psychotechnique/dominos",
  "/psychotechnique/orientation",
  "/psychotechnique/secpil",
];

test("chaque route publique n'expose qu'un seul titre de niveau 1", async ({ page }) => {
  const fautifs: string[] = [];

  for (const route of ROUTES) {
    const reponse = await page.goto(route);
    // Une route en 404 ferait passer le contrôle en silence : elle sert sa
    // propre page, avec son propre titre unique.
    expect(reponse?.status(), `statut de ${route}`).toBe(200);

    const titres = page.getByRole("heading", { level: 1 });
    const nombre = await titres.count();
    if (nombre !== 1) {
      fautifs.push(`${route} → ${nombre} titres : ${(await titres.allInnerTexts()).join(" | ")}`);
    }
  }

  expect(fautifs, `routes à titre de niveau 1 non unique :\n${fautifs.join("\n")}`).toEqual([]);
});

test("l'exercice d'orientation garde un titre unique dans ses phases", async ({ page }) => {
  await page.goto("/psychotechnique/orientation");

  const titres = page.getByRole("heading", { level: 1 });
  await expect(titres, "phase d'introduction").toHaveCount(1);

  // Le format le plus court suffit : on contrôle la structure, pas le contenu.
  await page
    .getByRole("button", { name: /Commencer/ })
    .first()
    .click();

  // La phase de jeu est atteinte quand une question est posée — et non après
  // un délai arbitraire, qui rendrait le contrôle dépendant de la machine.
  await expect(page.getByRole("button", { name: /Commencer/ })).toHaveCount(0);
  /*
    « AU PLUS un » en phase de jeu — élargi au lot F7b, et c'est un
    ASSOUPLISSEMENT ASSUMÉ, pas une commodité.

    Le défaut R-02 que ce contrôle fige était l'apparition d'un SECOND titre de
    niveau 1 pendant une phase de jeu ; c'est cela qu'il doit interdire, et il
    l'interdit toujours. Mais depuis que cette route porte le Banc, le mode
    séance replie le chapeau éditorial — titre compris — et la séance n'expose
    plus aucun `<h1>`. « Exactement un » y échouerait en signalant le repli,
    qui est le but du chantier.

    L'absence de titre en séance est consignée comme une question de doctrine à
    trancher à la clôture du Banc : elle vaut pour toutes les routes migrées, et
    la réponse — laisser le nom accessible du cadre de séance tenir ce rôle, ou
    porter un titre dans la séance — appartient au design system, pas à ce
    fichier. La phase d'introduction, elle, reste tenue à « exactement un ».
  */
  expect(await titres.count(), "phase de jeu — jamais deux titres").toBeLessThanOrEqual(1);
});
