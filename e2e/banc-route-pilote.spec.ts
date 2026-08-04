import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Route pilote du Banc — lot F2a.
 *
 * `/entrainement/eopan` est la première route de production à porter
 * l'identité du Banc. Ce fichier vérifie les états réels de la séance, dans
 * les deux registres et sur les deux projets Playwright (desktop et mobile),
 * et il vérifie **en priorité ce que la présence d'une classe ne prouve
 * pas** : que la feuille de style est réellement servie.
 *
 * Ce dernier point n'est pas théorique. À la première migration, `banc.css`
 * n'était importé que par la mise en page du laboratoire de design ; toutes
 * les classes `.banc-*` de la route étaient donc INERTES — pas de flex, pas
 * de surface, pas de teinte. Une assertion sur la classe serait passée. Seule
 * la mesure du style calculé a révélé le défaut, et c'est elle qui est
 * consignée ici. Chacune des gardes de ce fichier a été vérifiée par rupture
 * délibérée.
 */

const POOL = /\/entrainement\/eopan\/pool/;

/**
 * Un vivier fixe, et surtout **indifférent au tirage**.
 *
 * `PoolQuiz` mélange le vivier (Fisher–Yates) : un vivier dont la bonne
 * réponse changerait de rang d'une question à l'autre rendrait le verdict
 * dépendant du hasard, et le contrôle ne prouverait plus rien — c'est
 * exactement le défaut qui a invalidé la première campagne d'audit F0b-2.
 * Ici, la bonne réponse est TOUJOURS le premier choix : cliquer le rang 0
 * donne « juste », le rang 1 donne « incorrecte », quel que soit l'ordre.
 */
const VIVIER = [
  {
    id: "test.banc.01",
    theme: "test",
    difficulty: 1,
    statement: "Le vent est nommé par la direction d’où il vient.",
    choices: [{ label: "Vrai" }, { label: "Faux", note: "La convention est l’inverse." }],
    correctChoices: [0],
    explanation: "Un vent de 270° souffle de l’ouest vers l’est.",
    furtherReading: [{ label: "Le vent", href: "/fondamentaux/meteorologie/le-vent" }],
  },
  {
    id: "test.banc.02",
    theme: "test",
    difficulty: 2,
    statement: "L’aérostat tient en l’air par la poussée d’Archimède.",
    choices: [{ label: "Vrai" }, { label: "Faux", note: "La convention est l’inverse." }],
    correctChoices: [0],
    explanation: "L’aérodyne, lui, tient par la portance.",
    furtherReading: [{ label: "Le vent", href: "/fondamentaux/meteorologie/le-vent" }],
  },
];

/** Sert le vivier fixe au lieu de la banque réelle. Le tirage porte sur 2 questions. */
async function vivierFixe(page: Page) {
  await page.route(POOL, (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify(VIVIER) })
  );
}

async function lancer(page: Page) {
  await page.goto("/entrainement/eopan");
  await page.getByRole("button", { name: /Commencer la série/i }).click();
  await page.locator(".banc-reponse").first().waitFor();
}

/** Le nom accessible de l'élément focalisé, ou « body » si le focus est perdu. */
const focalise = (page: Page) =>
  page.evaluate(() => {
    const actif = document.activeElement as HTMLElement | null;
    if (!actif || actif === document.body) return "body";
    return actif.getAttribute("aria-label") ?? (actif.textContent || "").trim().slice(0, 40);
  });

const annonces = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("main [aria-live]")]
      .map((r) => (r.textContent || "").trim())
      .filter(Boolean)
  );

async function violations(page: Page) {
  const resultat = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  // Aucune exclusion : DT-002 est remboursée sur cette route (soulignement
  // permanent), donc `link-in-text-block` ne peut plus s'y déclencher. Si la
  // règle réapparaît ici, c'est une régression, et la campagne doit tomber.
  return resultat.violations.map((v) => `${v.id} (${v.nodes.length})`);
}

// ---------------------------------------------------------------------------
// 1. Le registre est SERVI, pas seulement déclaré
// ---------------------------------------------------------------------------

test("la feuille du Banc est réellement appliquée sur la route", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  const mesures = await page.evaluate(() => {
    const reponse = document.querySelector(".banc-reponse") as HTMLElement;
    const stimulus = document.querySelector(".banc-stimulus") as HTMLElement;
    const racine = document.querySelector("main.banc") as HTMLElement;
    return {
      afficheReponse: getComputedStyle(reponse).display,
      // Une valeur non vide prouve que le bloc `.banc` a été appliqué : sans
      // la feuille, la propriété personnalisée n'existe pas du tout.
      encreBanc: getComputedStyle(racine).getPropertyValue("--bc-banc").trim(),
      fondStimulus: getComputedStyle(stimulus).backgroundColor,
      cadre: (document.querySelector(".banc-cadre") as HTMLElement).getBoundingClientRect().width,
    };
  });

  expect(mesures.afficheReponse).toBe("flex");
  expect(mesures.encreBanc).not.toBe("");
  // `rgba(0, 0, 0, 0)` = pas de fond : la surface du stimulus n'existerait pas.
  expect(mesures.fondStimulus).not.toBe("rgba(0, 0, 0, 0)");
  // 60 rem, plafonné par la largeur du viewport (mobile).
  expect(mesures.cadre).toBeLessThanOrEqual(960);
});

// ---------------------------------------------------------------------------
// 2. La séance prend le cadre — le défaut central de l'audit F0b §1
// ---------------------------------------------------------------------------

test("le premier contrôle de réponse tient dans le premier écran", async ({ page }, infos) => {
  await vivierFixe(page);
  await lancer(page);

  const boite = await page.locator(".banc-reponse").first().boundingBox();
  const hauteur = page.viewportSize()?.height ?? 0;
  expect(boite).not.toBeNull();
  // L'audit mesurait 891, 995 et 994 px pour un écran de 844. Le contrôle
  // porte sur le BAS du premier contrôle : à moitié visible, il ne l'est pas.
  expect(
    boite!.y + boite!.height,
    `projet ${infos.project.name} — bas du premier contrôle`
  ).toBeLessThanOrEqual(hauteur);
});

test("le chapeau éditorial se replie au lancement et reste rappelable", async ({ page }) => {
  await vivierFixe(page);
  await page.goto("/entrainement/eopan");

  const titre = page.getByRole("heading", { level: 1, name: /S'entraîner — EOPAN/i });
  await expect(titre).toBeVisible();

  await page.getByRole("button", { name: /Commencer la série/i }).click();
  await page.locator(".banc-reponse").first().waitFor();
  // Masqué, mais TOUJOURS DANS LE DOM : l'état de la séance ne dépend pas de
  // son démontage, et le rappel ne le reconstruit pas.
  await expect(titre).toBeHidden();

  await page.getByRole("button", { name: /Revoir les consignes/i }).click();
  await expect(titre).toBeVisible();
  // Le rappel ne quitte pas la séance : la question est toujours là.
  await expect(page.locator(".banc-reponse").first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. Le parcours complet au clavier, et le focus à chaque transition
// ---------------------------------------------------------------------------

test("la séance se joue entièrement au clavier", async ({ page }) => {
  await vivierFixe(page);
  await page.goto("/entrainement/eopan");

  // Lancement au clavier.
  await page.getByRole("button", { name: /Commencer la série/i }).focus();
  await page.keyboard.press("Enter");
  await page.locator(".banc-reponse").first().waitFor();
  // L'aire de séance nomme la TÂCHE, pas la dénomination officielle du
  // concours : celle-ci reste le nom de section du lecteur, où elle est utile,
  // mais elle serait longue et peu informative à l'entrée en séance.
  expect(await focalise(page)).toBe("Série d'entraînement — EOPAN");

  // Réponse au clavier.
  await page.locator(".banc-reponse").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('.banc-reponse[aria-pressed="true"]')).toHaveCount(1);

  await page.getByRole("button", { name: "Valider" }).focus();
  await page.keyboard.press("Enter");
  expect(await focalise(page)).toBe("Correction");

  await page.getByRole("button", { name: /Question suivante/i }).focus();
  await page.keyboard.press("Enter");
  expect(await focalise(page)).toBe("Question 2 sur 2");

  await page.locator(".banc-reponse").first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: /Voir le résultat/i }).click();
  expect(await focalise(page)).toBe("Résultats");
});

/**
 * Le contrat de focus arbitré à la validation de F2a, transition par
 * transition — y compris les deux redémarrages, qui doivent se comporter de
 * la même façon.
 */
test("le focus suit le contrat à chacune des six transitions", async ({ page }) => {
  await vivierFixe(page);

  const focalisee = () =>
    page.evaluate(() => {
      const actif = document.activeElement;
      if (!actif || actif === document.body) return { role: "—", nom: "body", tabindex: null };
      return {
        role: actif.getAttribute("role") ?? actif.tagName.toLowerCase(),
        nom: actif.getAttribute("aria-label") ?? (actif.textContent || "").trim().slice(0, 40),
        tabindex: actif.getAttribute("tabindex"),
      };
    });

  /*
    1 — lancement → TITRE de séance.

    **Modifié au lot F7d, et c'est le cœur de l'arbitrage.** La cible était le
    cadre de séance ; c'est désormais son titre de niveau 1. Le cadre nommait
    la tâche sans avoir la sémantique d'un titre : il n'apparaissait dans
    aucune liste de titres, ne constituait pas un point de repère, et
    n'exposait pas la séance comme le nouveau sujet de la vue. Le titre le
    fait, et le cadre reste nommé par lui — rien n'a été retiré.
  */
  await lancer(page);
  expect(await focalisee()).toEqual({
    role: "h1",
    nom: "Série d'entraînement — EOPAN",
    tabindex: "-1",
  });

  // Le cadre laisse la question devenir l'étape suivante de tabulation.
  await page.keyboard.press("Tab");
  expect((await focalisee()).nom).toBe("Vrai");

  // 2 — validation → bloc de correction
  await page.locator(".banc-reponse").first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  expect((await focalisee()).nom).toBe("Correction");

  // 3 — question suivante → groupe de la nouvelle question
  await page.getByRole("button", { name: /Question suivante/i }).click();
  expect((await focalisee()).nom).toBe("Question 2 sur 2");

  // 4 — résultats → groupe des résultats
  await page.locator(".banc-reponse").first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: /Voir le résultat/i }).click();
  expect((await focalisee()).nom).toBe("Résultats");

  // 5 — « Recommencer » → première question
  await page.getByRole("button", { name: "Recommencer" }).click();
  await page.locator(".banc-reponse").first().waitFor();
  expect((await focalisee()).nom).toBe("Question 1 sur 2");

  // 6 — « Nouvelle série » → première question du nouveau tirage.
  //     Le lecteur est REMONTÉ sous une nouvelle clé : sans traitement
  //     explicite, le focus resterait sur le bouton actionné et la nouvelle
  //     série serait muette. Les deux redémarrages se comportent donc pareil.
  await page.getByRole("button", { name: /Nouvelle série/i }).click();
  await page.locator(".banc-reponse").first().waitFor();
  expect((await focalisee()).nom).toBe("Question 1 sur 2");
});

/**
 * Le nom accessible du cadre ne doit pas aspirer son contenu : `aria-label`
 * l'emporte sur les descendants, mais une régression vers `aria-labelledby`
 * ou vers un nom calculé par le contenu produirait une annonce de plusieurs
 * lignes à l'entrée en séance.
 */
test("le cadre de séance nomme la tâche, pas son contenu", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  const cadre = page.getByRole("group", { name: "Série d'entraînement — EOPAN" });
  /*
    Le nom vient désormais du TITRE de séance, par `aria-labelledby` (lot F7d).
    Le lire sur l'élément lui-même donnerait une chaîne vide et le contrôle
    passerait pour de mauvaises raisons : on remonte donc à la cible.
  */
  const mesures = await cadre.evaluate((el) => {
    const id = el.getAttribute("aria-labelledby");
    const titre = id ? document.getElementById(id) : null;
    return {
      nom: (titre?.textContent ?? "").trim(),
      longueurContenu: (el.textContent || "").trim().length,
    };
  });

  // Le contenu du cadre est bien plus long que son nom : la preuve que le
  // nom ne le reprend pas.
  expect(mesures.longueurContenu).toBeGreaterThan(mesures.nom.length * 2);
  // Une annonce d'entrée doit rester courte.
  expect(mesures.nom.length).toBeLessThanOrEqual(40);
});

// ---------------------------------------------------------------------------
// 4. Les deux corrections, et l'annonce qui les accompagne
// ---------------------------------------------------------------------------

test("une bonne réponse est signalée par l'écrit, l'icône et l'annonce", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  await page.locator(".banc-reponse").first().click(); // rang 0 — toujours juste
  await page.getByRole("button", { name: "Valider" }).click();

  const correction = page.getByRole("group", { name: "Correction" });
  await expect(correction.getByText("Bonne réponse")).toBeVisible();
  await expect(page.locator('.banc-reponse[data-etat="juste"]')).toHaveCount(1);
  // L'annonce cite la réponse : elle est unique et courte.
  expect((await annonces(page)).join(" ")).toMatch(/Bonne réponse/);
});

test("une réponse incorrecte distingue le choix fautif de la bonne réponse", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  await page.locator(".banc-reponse").nth(1).click(); // rang 1 — toujours faux
  await page.getByRole("button", { name: "Valider" }).click();

  const correction = page.getByRole("group", { name: "Correction" });
  await expect(correction.getByText("Réponse incorrecte")).toBeVisible();
  // Deux états distincts, jamais un seul gris pâle pour les deux.
  await expect(page.locator('.banc-reponse[data-etat="erreur"]')).toHaveCount(1);
  await expect(page.locator('.banc-reponse[data-etat="juste"]')).toHaveCount(1);
  // Le commentaire de choix accompagne l'erreur.
  await expect(page.getByText("La convention est l’inverse.")).toBeVisible();
});

test("la progression compte les questions ACHEVÉES", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  const barre = page.getByRole("progressbar", { name: "Progression du quiz" });
  await expect(barre).toHaveAttribute("aria-valuenow", "0");
  await expect(barre).toHaveAttribute("aria-valuetext", "0 question terminée sur 2");

  await page.locator(".banc-reponse").first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  // Corrigée, donc achevée — et non « position 1 ».
  await expect(barre).toHaveAttribute("aria-valuenow", "50");
  await expect(barre).toHaveAttribute("aria-valuetext", "1 question terminée sur 2");
});

// ---------------------------------------------------------------------------
// 5. Résultats, reprise, nouvelle série
// ---------------------------------------------------------------------------

test("les résultats n'affichent que des données réellement détenues", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  // Une juste, une fausse.
  await page.locator(".banc-reponse").first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: /Question suivante/i }).click();
  const manquee = await page
    .getByRole("group", { name: /^Question 2 sur 2$/ })
    .locator("h2")
    .innerText();
  await page.locator(".banc-reponse").nth(1).click(); // le rang 1 est toujours faux
  await page.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: /Voir le résultat/i }).click();

  const resultats = page.getByRole("group", { name: "Résultats" });
  await expect(resultats.getByText("1 / 2")).toBeVisible();
  await expect(resultats.getByText(/50 % de bonnes réponses/)).toBeVisible();
  await expect(resultats.getByText(/1 juste · 1 incorrecte/)).toBeVisible();

  // La seule liste dérivable : les questions manquées, et rien d'autre. Le
  // tirage étant mélangé, on compare à l'énoncé RÉELLEMENT joué en second.
  const aRevoir = page.getByRole("region", { name: "Questions à revoir" });
  await expect(aRevoir.getByRole("listitem")).toHaveCount(1);
  await expect(aRevoir.getByRole("listitem")).toContainText(manquee);

  await expect(page.getByRole("button", { name: "Recommencer" })).toBeVisible();
});

test("« Nouvelle série » et « Quitter la séance » sont toujours disponibles", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  await expect(page.getByRole("button", { name: /Nouvelle série/i })).toBeVisible();

  await page.getByRole("button", { name: /Quitter la séance/i }).click();
  // Retour à la préparation : le chapeau revient, la séance disparaît.
  await expect(page.getByRole("heading", { level: 1, name: /S'entraîner — EOPAN/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Commencer la série/i })).toBeVisible();
  await expect(page.locator(".banc-reponse")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 6. Erreur de chargement
// ---------------------------------------------------------------------------

test("un vivier injoignable interrompt la séance par une alerte", async ({ page }) => {
  await page.route(POOL, (route) => route.fulfill({ status: 500, body: "" }));
  await page.goto("/entrainement/eopan");
  await page.getByRole("button", { name: /Commencer la série/i }).click();

  // Portée `main` : Next.js pose son propre `role="alert"` (l'annonceur de
  // route) sur le document, et il ne concerne pas la séance.
  const alerte = page.locator("main").getByRole("alert");
  await expect(alerte).toContainText("Chargement impossible");
  await expect(page.locator(".banc-reponse")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 7. DT-002 remboursée ICI, et nulle part ailleurs pour l'instant
// ---------------------------------------------------------------------------

test("le lien « Pour approfondir » est souligné au repos sur la route pilote", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);
  await page.locator(".banc-reponse").first().click();
  await page.getByRole("button", { name: "Valider" }).click();

  const lien = page
    .getByRole("group", { name: "Correction" })
    .getByRole("link", { name: "Le vent" });
  // La CAUSE, pas le symptôme : `hover:underline` laissait `none` au repos.
  const decoration = await lien.evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(decoration).toBe("underline");
});

// ---------------------------------------------------------------------------
// 8. Non-régression : les autres appelants gardent le rendu historique
// ---------------------------------------------------------------------------

/**
 * Les surfaces en registre **documentaire**, par une route qui les rend
 * réellement. La liste est vérifiée : une route qui répondrait 404 doit FAIRE
 * ÉCHOUER le contrôle, jamais l'ignorer. Un audit précédent a publié une
 * mesure prise sur une page 404 ; la garde ci-dessous l'empêche.
 *
 * ── Ce registre a CHANGÉ DE SENS au lot F12, sans changer d'invariant ────
 * De F2a à F11, il recensait les routes **non encore migrées** : chaque
 * migration en retirait une ligne, et la liste devait finir vide. Elle ne
 * finit pas vide, et c'est le résultat de l'arbitrage, pas un reliquat — les
 * routes qui restent ne sont pas en attente, elles sont **classées
 * documentaires à titre définitif** (lot F4). Une ligne ne s'en retire donc
 * plus par migration ; elle ne s'en retirerait que par reclassement, ce qui
 * demanderait de refaire l'arbitrage.
 *
 * L'invariant testé, lui, n'a pas bougé d'un mot : aucune classe du Banc sur
 * ces routes. C'est ce qui rend le registre encore utile après la clôture —
 * il ne surveille plus un chantier, il surveille une frontière.
 */
const AUTRES_APPELANTS = [
  /*
    `/anglais` ne rend plus aucun lecteur depuis le lot F12 : sa série a reçu
    sa propre route (`/anglais/quiz`, au Banc), et le hub n'en garde qu'une
    entrée nommée. Le témoin RESTE malgré tout, et pour une raison précise —
    c'est cette page-là qu'on aurait été tenté de repeindre pour éviter de
    créer une route, et le contrôle grave qu'on ne l'a pas fait.
  */
  "/anglais", // hub documentaire — entrée explicite vers /anglais/quiz
  "/design-system/quiz", // QuizPlayer nu — vitrine interne
  "/bia/aerodynamique-et-principes-du-vol", // MatiereQuiz — quiz de matière BIA
  "/cours/forces-et-lois-de-newton", // CourseExperience — leçon canonique
  // NotionQuiz — un témoin par GABARIT, cinq chemins d'intégration distincts :
  "/fondamentaux/aerodynamique/l-aerostatique", // lecon-fiche.tsx
  "/eopan/concepts/catobar", // dossier.tsx
  "/eopan/histoire/histoire-de-l-aeronautique-navale", // cahier.tsx
  "/eopan/appareils/rafale-m", // planche-identification.tsx
  "/culture/geopolitique-defense/red-flag", // situation.tsx
  /*
    `/reviser` a QUITTÉ cette liste au lot F2b : la route est migrée, elle
    porte donc le Banc et ce contrôle y échouerait — à juste titre. Elle est
    désormais couverte par `revision-banc.spec.ts`.

    Chaque migration en a retiré une ligne, et l'oubli se voyait
    immédiatement puisque le contrôle tombait. Depuis la clôture (F12), plus
    aucune ligne n'est en instance : voir l'en-tête ci-dessus.

    ── GRANULARITÉ : une entrée par chemin d'intégration indépendant ───────
    Et non « une entrée par composant », comme ce registre le faisait avant le
    2026-07-31. La règle générale :

      un registre de non-régression a une entrée par FRONTIÈRE INDÉPENDANTE
      capable de violer l'invariant testé.

    L'invariant est ici « aucune classe du Banc sur une route encore
    historique ». Les frontières capables de l'enfreindre sont au nombre de
    quatre : le composant de quiz, le gabarit de page, l'enveloppe de charte,
    et une branche conditionnelle de rendu. Deux routes ne peuvent partager un
    témoin QUE si elles coïncident sur les quatre.

    Ce n'est pas une précaution théorique : aux lots F2a et F2b, c'est la PAGE
    qui posait `.banc`, jamais le composant. Un registre indexé sur les seuls
    composants serait donc aveugle au chemin même que le projet a emprunté
    deux fois.

    D'où les cinq témoins de `NotionQuiz` : le composant est rendu par cinq
    gabarits distincts, donc cinq frontières. Chacun des cinq a été vérifié
    par rupture délibérée, et chacune des cinq ruptures ne fait tomber QUE son
    témoin — preuve qu'ils ne se recouvrent pas.

    `/entrainement/eopn` et `/entrainement/alat` ont quitté cette liste au lot
    F3, comme `/reviser` l'avait quittée à F2b. Leur comportement est désormais
    tenu par `e2e/entrainement-f3-reference.spec.ts`, écrite AVANT leur
    migration et rejouée sans une retouche après — `git diff` vide.

    ── Vérifier que le registre est complet ────────────────────────────────
    `grep -rl "<QuizPlayer" src/` doit donner exactement six composants — les
    cinq appelants ci-dessus, plus `revision-session`, migré. Puis, pour
    chacun, recenser les gabarits qui le rendent.

    `CourseExperience` manquait entièrement jusqu'au 2026-07-31 : les quatorze
    leçons canoniques rendaient un `QuizPlayer` historique sans aucun témoin.
    Relevé en recomptant depuis les imports réels, et non d'après la
    documentation.

    ── Deuxième niveau, qui ne double pas celui-ci ─────────────────────────
    `src/features/quiz/notion-quiz.test.tsx` surveille le COMPOSANT : il
    n'émet aucune classe du Banc, avant comme après le tirage. Une fuite venue
    du composant se verrait sur les cinq gabarits ; une fuite venue d'un seul
    gabarit ne se verrait que là. Aucun des deux niveaux ne rend l'autre
    superflu.

    ── CE QUE CE REGISTRE NE VOIT PAS (relevé au lot F5) ───────────────────
    Il est indexé sur les appelants de `QuizPlayer`. Tout moteur CONCURRENT
    lui échappe donc entièrement — et il en existe : l'examen blanc BIA
    (`src/features/bia/exam-player.tsx`) a ses propres phases, son propre
    chronomètre et sa propre persistance. Il n'a jamais eu de témoin ici, non
    par oubli de granularité, mais parce que la clé d'indexation ne l'atteint
    pas. Le lot F5 le migre et le couvre en positif
    (`e2e/bia-examen-banc.spec.ts`) ; la coquille psychotechnique et SECPIL
    poseront la même question aux lots F7 et F9.

    ── Un témoin doit RENDRE le bloc qu'il surveille ───────────────────────
    `NotionQuiz` retourne `null` quand la fiche n'a pas de questions : une
    route sans banque passerait le contrôle sans rien prouver. Les cinq routes
    ci-dessus ont été vérifiées en production — chacune rend bien « Tester
    cette notion ».
  */
];

for (const route of AUTRES_APPELANTS) {
  test(`${route} garde le rendu historique`, async ({ page }) => {
    const reponse = await page.goto(route);
    expect(reponse?.status(), `${route} doit répondre`).toBeLessThan(400);
    // Aucun sous-arbre du Banc, à quelque profondeur que ce soit.
    await expect(page.locator(".banc")).toHaveCount(0);
    await expect(page.locator(".banc-reponse")).toHaveCount(0);
    // Et l'isolation de F1b tient : `banc.css` n'émet rien sur `:root`, donc
    // même chargée, la feuille ne peut pas repeindre une route non migrée.
    const surRacine = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bc-banc").trim()
    );
    expect(surRacine).toBe("");
  });
}

// ---------------------------------------------------------------------------
// 9. Axe sur chaque état principal, dans les deux registres
// ---------------------------------------------------------------------------

for (const registre of ["light", "dark"] as const) {
  test.describe(`registre ${registre}`, () => {
    test.use({ colorScheme: registre });

    test("aucune violation axe sur les quatre états de la séance", async ({ page }) => {
      await vivierFixe(page);

      // 1 — préparation
      await page.goto("/entrainement/eopan");
      expect(await violations(page), "préparation").toEqual([]);

      // 2 — question
      await page.getByRole("button", { name: /Commencer la série/i }).click();
      await page.locator(".banc-reponse").first().waitFor();
      expect(await violations(page), "question").toEqual([]);

      // 3 — correction
      await page.locator(".banc-reponse").nth(1).click();
      await page.getByRole("button", { name: "Valider" }).click();
      await page.getByRole("group", { name: "Correction" }).waitFor();
      expect(await violations(page), "correction").toEqual([]);

      // 4 — résultats
      await page.getByRole("button", { name: /Question suivante/i }).click();
      await page.locator(".banc-reponse").first().click();
      await page.getByRole("button", { name: "Valider" }).click();
      await page.getByRole("button", { name: /Voir le résultat/i }).click();
      expect(await violations(page), "résultats").toEqual([]);
    });
  });
}
