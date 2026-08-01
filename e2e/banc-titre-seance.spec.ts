import { expect, test, type Page } from "@playwright/test";

/**
 * Le titre principal de chaque phase — lot F7d.
 *
 * ── L'arbitrage que ce fichier fige ─────────────────────────────────────
 * Le mode séance retire le chapeau éditorial de l'arbre d'accessibilité,
 * titre compris. La séance devient alors fonctionnellement **une nouvelle
 * vue**, et doit exposer une structure complète : son propre titre principal.
 *
 * Le `role="group"` nommé ne suffisait pas. Il nomme l'aire de jeu, mais il
 * n'a pas la sémantique `heading`, il n'apparaît pas dans la liste des titres
 * d'un lecteur d'écran, il ne constitue pas un point de repère, et il n'expose
 * pas la séance comme le nouveau sujet principal.
 *
 * La règle générale, applicable au-delà du Banc :
 *
 * > lorsqu'un état interactif remplace la tâche principale et retire le titre
 * > de la vue précédente, il doit fournir son propre titre principal. Un nom
 * > accessible sur un groupe complète cette structure ; il ne la remplace pas.
 *
 * ── Ce qui est vérifié, phase par phase ─────────────────────────────────
 * Avant lancement : **exactement un** `<h1>`, le titre éditorial.
 * Pendant la séance : **exactement un** `<h1>`, celui de la séance, portant le
 * nom attendu, atteignable par la navigation par titres, et nommant le groupe
 * de séance.
 * Après sortie : retour au titre éditorial.
 * **Aucune phase ne contient zéro ou deux `<h1>`.**
 */

interface Route {
  nom: string;
  chemin: string;
  /** Le titre éditorial de la page, au repos. */
  titreEditorial: RegExp;
  /** La commande qui lance la séance. */
  lancement: RegExp;
  /** Le titre que la séance doit porter, exactement. */
  titreSeance: string;
  /**
   * Certaines routes exigent un choix avant de pouvoir démarrer, d'autres
   * enchaînent deux écrans d'avant-séance. La séquence est décrite ici plutôt
   * que devinée.
   */
  avantLancement?: (page: Page) => Promise<void>;
  /** Deuxième commande, pour les avant-séances en deux temps. */
  lancementSecond?: RegExp;
}

const ROUTES: Route[] = [
  {
    nom: "Entraînement EOPAN",
    chemin: "/entrainement/eopan",
    titreEditorial: /S'entraîner — EOPAN/i,
    lancement: /Commencer la série/i,
    titreSeance: "Série d'entraînement — EOPAN",
  },
  {
    nom: "Révision espacée",
    chemin: "/reviser",
    titreEditorial: /^Réviser$/,
    lancement: /Commencer la révision/i,
    titreSeance: "Révision espacée — EOPAN",
    // Le concours doit être choisi : le lancement reste inopérant sans lui.
    avantLancement: async (page) => {
      await page.getByRole("radio", { name: "EOPAN", exact: true }).check();
    },
  },
  {
    nom: "Examen blanc BIA",
    chemin: "/bia/examen-blanc",
    titreEditorial: /Examen blanc BIA/i,
    lancement: /Commencer l['’]examen/i,
    titreSeance: "Examen blanc BIA",
  },
  {
    nom: "Entraînement psychotechnique",
    chemin: "/psychotechnique/entrainement",
    titreEditorial: /Entraînement psychotechnique/i,
    lancement: /Courte — 10 questions/i,
    lancementSecond: /^Démarrer$/,
    titreSeance: "Entraînement psychotechnique",
  },
  {
    nom: "Dominos",
    chemin: "/psychotechnique/dominos",
    titreEditorial: /Test de dominos/i,
    lancement: /Lancer le test/i,
    titreSeance: "Test de dominos",
  },
  {
    nom: "Calcul mental",
    chemin: "/psychotechnique/calcul-mental",
    titreEditorial: /Calcul mental/i,
    lancement: /^Commencer$/,
    titreSeance: "Calcul mental",
  },
  {
    nom: "Codage",
    chemin: "/psychotechnique/codage",
    titreEditorial: /Test de codage/i,
    lancement: /Lancer le test/i,
    titreSeance: "Test de codage",
  },
  {
    nom: "Appareils photos",
    chemin: "/psychotechnique/appareils-photos",
    titreEditorial: /Test des appareils photos/i,
    lancement: /Lancer le test/i,
    titreSeance: "Test des appareils photos",
  },
  {
    nom: "Formes imbriquées",
    chemin: "/psychotechnique/formes-imbriquees",
    titreEditorial: /Test des formes imbriquées/i,
    lancement: /Lancer le test/i,
    titreSeance: "Formes imbriquées",
  },
  {
    nom: "Triangles",
    chemin: "/psychotechnique/triangles",
    titreEditorial: /Test des triangles/i,
    lancement: /Lancer le test/i,
    titreSeance: "Test des triangles",
  },
  {
    nom: "Orientation",
    chemin: "/psychotechnique/orientation",
    titreEditorial: /Test d['’]orientation/i,
    lancement: /Commencer/i,
    titreSeance: "Test d'orientation",
  },
];

const titres = (page: Page) => page.getByRole("heading", { level: 1 });

async function lancer(page: Page, route: Route) {
  await route.avantLancement?.(page);
  await page.getByRole("button", { name: route.lancement }).first().click();
  if (route.lancementSecond) {
    await page.getByRole("button", { name: route.lancementSecond }).first().click();
  }
  // La séance est engagée quand son titre est là — et non après un délai
  // arbitraire, qui rendrait le contrôle dépendant de la machine.
  await expect(
    page.getByRole("heading", { level: 1, name: route.titreSeance, exact: true })
  ).toBeVisible({ timeout: 25_000 });
}

for (const route of ROUTES) {
  test.describe(`${route.nom} — titre de chaque phase`, () => {
    test("au repos : exactement un titre, l'éditorial", async ({ page }) => {
      const reponse = await page.goto(route.chemin);
      expect(reponse?.status(), `${route.chemin} doit répondre`).toBeLessThan(400);

      await expect(titres(page), "au repos").toHaveCount(1);
      await expect(titres(page)).toHaveText(route.titreEditorial);
    });

    test("en séance : exactement un titre, celui de la séance", async ({ page }) => {
      await page.goto(route.chemin);
      await lancer(page, route);

      // Ni zéro — le repli du chapeau ne doit pas laisser la vue sans titre —
      // ni deux : le titre éditorial a bien quitté l'arbre d'accessibilité.
      await expect(titres(page), "en séance").toHaveCount(1);
      await expect(titres(page)).toHaveText(route.titreSeance);

      // Atteignable par la navigation par titres : c'est tout l'objet de
      // l'arbitrage. Un `role="group"` nommé n'y figurerait pas.
      const dansLaListe = await page.evaluate(
        () =>
          [...document.querySelectorAll("h1")].filter(
            (h) => h.offsetParent !== null || h.classList.contains("sr-only")
          ).length
      );
      expect(dansLaListe, "le titre de séance est un vrai h1").toBe(1);
    });

    test("le groupe de séance est nommé PAR ce titre", async ({ page }) => {
      await page.goto(route.chemin);
      await lancer(page, route);

      const groupe = page.getByRole("group", { name: route.titreSeance }).first();
      await expect(groupe).toBeVisible();

      // La relation passe par `aria-labelledby`, et la cible est bien le `h1` :
      // un `aria-label` recopié donnerait le même nom accessible sans créer
      // aucun lien structurel, et le contrôle doit distinguer les deux.
      const lien = await groupe.evaluate((el) => {
        const id = el.getAttribute("aria-labelledby");
        if (!id) return { labelledby: null, cibleEstUnH1: false };
        const cible = document.getElementById(id);
        return { labelledby: id, cibleEstUnH1: cible?.tagName === "H1" };
      });
      expect(lien.labelledby, "le groupe doit être nommé par un identifiant").not.toBeNull();
      expect(lien.cibleEstUnH1, "cet identifiant doit désigner le h1 de séance").toBe(true);
    });

    test("à la sortie : le titre éditorial revient", async ({ page }) => {
      await page.goto(route.chemin);
      await lancer(page, route);

      await page.getByRole("button", { name: /Quitter la séance/i }).click();
      await expect(titres(page), "après sortie").toHaveCount(1);
      await expect(titres(page)).toHaveText(route.titreEditorial);
    });
  });
}
