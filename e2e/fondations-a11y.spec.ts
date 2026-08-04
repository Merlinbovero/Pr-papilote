import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Fondations d'accessibilité — lot F1a.
 *
 * L'audit F0b avait mesuré, sur les routes réelles, quatre défauts que les
 * tests unitaires ne peuvent pas voir : une barre de progression sans nom ni
 * valeur, un motif de contraste sous le seuil, un focus perdu à chaque
 * transition et l'absence totale d'annonce. Ce fichier vérifie que les quatre
 * ont disparu **là où ils avaient été constatés**, dans les deux registres.
 */

const SEANCE = 'main section[aria-label] ul[role="list"] button';

/**
 * **Plus aucune exclusion — lot F12.**
 *
 * Ce fichier écartait nommément `link-in-text-block` (DT-002) : dans la
 * correction, le lien « Pour approfondir » n'était distingué du texte que par
 * la couleur, et la règle ne se déclenchait qu'au hasard des tirages, ce qui
 * aurait rendu la campagne instable. L'exclusion était encadrée par une garde
 * qui interdisait d'en ajouter une seconde.
 *
 * La dette est soldée : `legacy` était le dernier rendu à ne pas souligner ce
 * lien au repos, et il n'existe plus. L'exclusion, sa garde et le test de
 * dette (`dette-lien-correction.spec.ts`) disparaissent donc ensemble — une
 * exclusion sans défaut à couvrir est un trou dans la mesure, pas une
 * précaution.
 */
async function violations(page: Page) {
  const resultat = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return resultat.violations.map((v) => `${v.id} (${v.nodes.length})`);
}

const focalise = (page: Page) =>
  page.evaluate(() => {
    const actif = document.activeElement as HTMLElement | null;
    if (!actif || actif === document.body) return "body";
    return actif.getAttribute("aria-label") ?? (actif.textContent || "").trim().slice(0, 40);
  });

/** Le contenu de la région d'annonce de la séance. */
const annonce = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("main [aria-live]")]
      .map((r) => (r.textContent || "").trim())
      .filter(Boolean)
  );

for (const registre of ["light", "dark"] as const) {
  test.describe(`registre ${registre}`, () => {
    test.use({ colorScheme: registre });

    test("la barre de progression du quiz porte un nom ET une valeur", async ({ page }) => {
      await page.goto("/entrainement/eopan");
      await page.getByRole("button", { name: /Commencer la série/i }).click();
      await page.waitForSelector(SEANCE);

      const barre = page.getByRole("progressbar", { name: "Progression du quiz" });
      await expect(barre).toHaveAttribute("aria-valuenow", "0");
      // Le libellé dit l'avancement, pas la position : c'est ce que la barre mesure.
      await expect(barre).toHaveAttribute("aria-valuetext", /0 question terminée sur \d+/);
    });

    test("la barre de l'examen BIA porte un nom ET une valeur", async ({ page }) => {
      await page.goto("/bia/examen-blanc");
      await page.getByRole("button", { name: /Commencer l’examen/i }).click();
      await page.waitForSelector(SEANCE, { timeout: 20000 });

      const barre = page.getByRole("progressbar", { name: "Progression de l’examen" });
      await expect(barre).toHaveAttribute("aria-valuenow", "0");
      await expect(barre).toHaveAttribute("aria-valuetext", /0 réponse complétée sur \d+/);
    });

    test("la séance psychotechnique nomme sa progression", async ({ page }) => {
      /*
        DÉFAUT PRÉEXISTANT DU CONTRÔLE, révélé par la campagne complète du
        lot F2a — il échouait environ une fois sur deux, tantôt sur un
        projet, tantôt sur l'autre.

        Trois familles sur cinq s'ouvrent sur une phase de MÉMORISATION, qui
        ne porte délibérément aucune barre de progression et dure 3 à 5
        secondes — soit exactement le délai d'attente par défaut de
        Playwright. La famille étant TIRÉE AU HASARD, le résultat dépendait
        du tirage et non de ce que le contrôle prétend vérifier : c'est le
        défaut même qui avait invalidé la première campagne d'audit F0b-2.

        On franchit donc la phase par l'horloge, seconde par seconde et pas
        plus loin que nécessaire — avancer en bloc ferait expirer le
        chronomètre de réponse, la question serait comptée manquée et la
        barre ne vaudrait plus zéro.
      */
      await page.clock.install();
      await page.goto("/psychotechnique/entrainement");
      await page.getByRole("button", { name: /^Lancer la session/i }).click();
      await page.getByRole("button", { name: /^Démarrer$/ }).click();

      const barre = page.getByRole("progressbar", { name: "Progression de la séance" });
      for (let seconde = 0; seconde < 8 && (await barre.count()) === 0; seconde += 1) {
        await page.clock.runFor(1000);
      }

      await expect(barre).toHaveAttribute("aria-valuenow", "0");
      await expect(barre).toHaveAttribute("aria-valuetext", /0 question terminée sur \d+/);
    });

    test("aucune violation axe pendant une séance ni à la correction", async ({ page }) => {
      await page.goto("/entrainement/eopan");
      await page.getByRole("button", { name: /Commencer la série/i }).click();
      await page.waitForSelector(SEANCE);
      expect(await violations(page), "en séance").toEqual([]);

      await page.locator(SEANCE).first().click();
      await page.getByRole("button", { name: /^Valider$/ }).click();
      await expect(page.getByRole("group", { name: "Correction" })).toBeVisible();
      // C'est ici que les 58 nœuds de contraste étaient mesurés.
      expect(await violations(page), "en correction").toEqual([]);
    });

    test("l'examen BIA ne produit plus de violation en séance", async ({ page }) => {
      await page.goto("/bia/examen-blanc");
      await page.getByRole("button", { name: /Commencer l’examen/i }).click();
      await page.waitForSelector(SEANCE, { timeout: 20000 });
      expect(await violations(page)).toEqual([]);
    });
  });
}

test.describe("contrat de focus et d'annonce", () => {
  test("le focus suit les transitions du quiz, sans double lecture", async ({ page }) => {
    await page.goto("/entrainement/eopan");
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await page.waitForSelector(SEANCE);

    /*
      Démarrage : le focus entre dans la séance au lieu de retomber sur body.

      **La cible a changé au lot F2a**, et c'est une conséquence assumée de
      la migration de cette route vers le Banc. Deux zones focalisables sont
      désormais imbriquées : l'aire de séance de `ModeSeance`, qui vient
      d'apparaître, et le groupe « Question N sur T » du lecteur, qu'elle
      contient. C'est l'aire de séance qui reçoit le focus, et non plus la
      question, pour trois raisons :

        1. c'est le conteneur qui vient d'apparaître — le focus suit ce qui
           s'est produit ;
        2. elle englobe la barre de progression et le niveau de difficulté,
           que le groupe de question, lui, laisse en dehors : viser la
           question ferait sauter ces informations ;
        3. `ModeSeance` doit poser le focus AVANT de prévenir le moteur, sans
           quoi le temps courrait pendant la réorganisation de l'écran (lot
           F1b). Laisser aussi le lecteur revendiquer le focus au premier
           rendu créerait deux prétendants.

      La propriété que ce contrôle protège est inchangée : le focus ne
      retombe pas sur `body`, et l'élément atteint NOMME l'écran. Sur les
      routes non migrées — l'examen BIA ci-dessous — la cible reste le
      groupe de question, et le contrôle correspondant n'a pas bougé.
    */
    expect(await focalise(page)).toBe("Série d'entraînement — EOPAN");

    await page.locator(SEANCE).first().click();
    await page.getByRole("button", { name: /^Valider$/ }).click();

    // Validation : le focus va sur la correction, la région porte le verdict.
    await expect(page.getByRole("group", { name: "Correction" })).toBeFocused();
    expect((await annonce(page)).join(" ")).toMatch(/Bonne réponse\.|Réponse incorrecte\./);

    await page.getByRole("button", { name: /Question suivante/i }).click();

    // Changement de question : le focus dit la position, la région se tait —
    // sans quoi la même information serait lue deux fois.
    expect(await focalise(page)).toMatch(/^Question 2 sur \d+$/);
    expect(await annonce(page)).toEqual([]);
  });

  test("l'arrivée aux résultats annonce le score", async ({ page }) => {
    await page.goto("/entrainement/eopan");
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await page.waitForSelector(SEANCE);

    for (let i = 0; i < 40; i++) {
      if (await page.getByRole("group", { name: "Résultats" }).count()) break;
      const valider = page.getByRole("button", { name: /^Valider$/ });
      if (await valider.count()) {
        await page.locator(SEANCE).first().click();
        await valider.click();
      }
      const suite = page.getByRole("button", { name: /Question suivante|Voir le résultat/i });
      if (await suite.count()) await suite.click();
    }

    await expect(page.getByRole("group", { name: "Résultats" })).toBeFocused();
    expect((await annonce(page)).join(" ")).toMatch(/Séance terminée\. Score : \d+ sur \d+\./);
  });

  test("le focus suit la navigation entre questions de l'examen", async ({ page }) => {
    /*
      RÉÉCRIT AU LOT F5, et c'est un CHANGEMENT DE COMPORTEMENT assumé, pas
      un ajustement de confort.

      Avant migration, l'examen n'avait pas d'aire de séance : le lancement
      remplaçait la page entière, et la seule cible de focus possible était le
      groupe de la première question. Le mode séance du Banc en crée une, et le
      contrat arbitré au lot F2a — déjà tenu par `/entrainement/eopan` et
      `/reviser` — veut que le LANCEMENT pose le focus sur le cadre, dont le
      nom énonce la tâche en quelques mots, et que les transitions internes le
      posent sur le groupe de la question.

      Ce qui est vérifié n'a donc pas été affaibli : les deux étapes sont
      toujours contrôlées, et l'examen rejoint la règle des autres séances au
      lieu d'avoir la sienne.
    */
    await page.goto("/bia/examen-blanc");
    await page.getByRole("button", { name: /Commencer l’examen/i }).click();
    await page.waitForSelector(SEANCE, { timeout: 20000 });
    expect(await focalise(page)).toBe("Examen blanc BIA");

    await page.getByRole("button", { name: /^Suivante$/ }).click();
    expect(await focalise(page)).toMatch(/^Question 2 sur \d+$/);
  });

  test("le focus n'est pas volé si l'utilisateur l'a placé ailleurs", async ({ page }) => {
    await page.goto("/entrainement/eopan");
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await page.waitForSelector(SEANCE);

    await page.locator(SEANCE).first().click();
    // On pose délibérément le focus sur un élément hors de la zone remplacée…
    const ailleurs = page.getByRole("button", { name: /Nouvelle série/i });
    await ailleurs.focus();
    // …puis on déclenche la transition sans lui rendre le focus.
    await page.getByRole("button", { name: /^Valider$/ }).dispatchEvent("click");
    await page.waitForTimeout(400);

    // La règle doit avoir refusé le déplacement. C'est ce cas qui a révélé, à
    // la première exécution, que mémoriser le dernier focus au lieu du bouton
    // actionné rendait la garde inopérante.
    expect(await focalise(page)).toMatch(/Nouvelle série/);
  });
});
