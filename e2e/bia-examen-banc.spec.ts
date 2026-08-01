import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * L'examen blanc BIA sur le Banc — lot F5.
 *
 * Quatrième route de production migrée, et la PREMIÈRE qui soit une épreuve :
 * lancement explicite, chronomètre long, pavé de navigation, note finale.
 * C'est le cas que la doctrine du Banc vise en propre, et celui où l'audit
 * F0b relevait ses défauts les plus lourds — chapeau empilé au-dessus de
 * l'aire de jeu, chronomètre traité en métadonnée grise.
 *
 * ── Ce que ce fichier garde, et ce qu'il ne garde pas ───────────────────
 * Il garde le REGISTRE : feuille réellement servie, cadre pris par la séance,
 * chronomètre porté au rang de contrainte, verdicts écrits, focus à chaque
 * transition, absence de violation axe dans les deux registres.
 *
 * Il ne re-garde PAS le comportement : celui-ci est tenu par
 * `bia-examen-f5-reference.spec.ts`, écrite avant la migration et rejouée
 * sans une retouche après. Dupliquer ses assertions ici les rendrait toutes
 * les deux moins lisibles sans rien prouver de plus.
 *
 * Chaque garde ci-dessous a été vérifiée par rupture délibérée.
 */

const EXAMEN = "/bia/examen-blanc";
const POOL = /\/bia\/examen-blanc\/pool/;

/**
 * Un vivier fixe, et **indifférent au tirage**.
 *
 * `composeBiaExam` tire par matière et mélange : un vivier dont la bonne
 * réponse changerait de rang rendrait tout verdict dépendant du hasard —
 * c'est le défaut qui avait invalidé la première campagne d'audit F0b-2. Ici,
 * la bonne réponse est TOUJOURS le premier choix.
 *
 * Deux questions par matière au lieu de vingt : l'examen se joue alors en dix
 * questions, ce qui suffit à tout ce qui est vérifié ici et évite de charger
 * 450 Ko à chaque test. L'écart déclenche l'avertissement « examen
 * légèrement réduit », qui fait donc partie des états contrôlés par axe.
 */
const MATIERES = [
  "meteorologie-aerologie",
  "aerodynamique-et-principes-du-vol",
  "etude-des-aeronefs-et-engins-spatiaux",
  "navigation-reglementation-securite",
  "histoire-et-culture",
];

const VIVIER = Object.fromEntries(
  MATIERES.map((matiere, m) => [
    matiere,
    [0, 1].map((n) => ({
      id: `test.examen.${m}.${n}`,
      matiere,
      theme: "test",
      difficulty: 1,
      statement: `Énoncé ${m}-${n} — le vent est nommé par la direction d’où il vient.`,
      choices: [{ label: "Vrai" }, { label: "Faux" }],
      correctChoices: [0],
      explanation: "Un vent de 270° souffle de l’ouest vers l’est.",
      furtherReading: [{ label: "Le vent", href: "/fondamentaux/meteorologie/le-vent" }],
    })),
  ])
);

async function vivierFixe(page: Page) {
  await page.route(POOL, (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify(VIVIER) })
  );
}

const reponses = (page: Page) => page.locator(".banc-reponse");

async function lancer(page: Page) {
  await page.goto(EXAMEN);
  await page.getByRole("button", { name: /Commencer l['’]examen/i }).click();
  await reponses(page).first().waitFor();
}

/** Le nom accessible de l'élément focalisé, ou « body » si le focus est perdu. */
const focalise = (page: Page) =>
  page.evaluate(() => {
    const actif = document.activeElement as HTMLElement | null;
    if (!actif || actif === document.body) return "body";
    return actif.getAttribute("aria-label") ?? (actif.textContent || "").trim().slice(0, 40);
  });

/**
 * Les violations, NOMMÉES avec leur cible.
 *
 * Le format habituel — « color-contrast (1) » — suffit à faire tomber la
 * campagne mais pas à savoir quoi corriger : il a fallu re-jouer la séquence
 * à la main pour identifier le nœud. Le message porte donc désormais le
 * sélecteur et la ligne de mesure, qui est ce qu'on lit en premier.
 */
/**
 * Attend que les TRANSITIONS CSS soient terminées.
 *
 * Sans cela, la mesure de contraste est prise sur des couleurs INTERMÉDIAIRES
 * et le résultat n'a aucun sens. Relevé ici : « #d0d1d2 sur #376c69, 3,91:1 »
 * — ni l'une ni l'autre n'existent dans la palette, ce sont deux valeurs à
 * mi-chemin entre le blanc et `--bc-banc` (#036564), dont le rapport réel est
 * de 6,5:1. Le contrôle échouait environ une fois sur trois, toujours sur un
 * bouton venant de changer d'état.
 *
 * Ce n'est donc PAS un délai ajouté pour faire passer une assertion : c'est la
 * condition de validité de la mesure. On n'attend que les transitions — une
 * animation en boucle ne se terminerait jamais — et l'attente est bornée.
 */
async function transitionsTerminees(page: Page) {
  await page
    .waitForFunction(
      () =>
        !document
          .getAnimations()
          .some((a) => a.constructor.name === "CSSTransition" && a.playState === "running"),
      undefined,
      { timeout: 2000 }
    )
    .catch(() => undefined);
}

async function violations(page: Page) {
  await transitionsTerminees(page);
  const resultat = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  // Aucune exclusion : DT-002 est remboursée sur cette route, donc
  // `link-in-text-block` ne peut plus s'y déclencher.
  return resultat.violations.flatMap((v) =>
    v.nodes.map((n) => {
      const mesure = (n.failureSummary ?? "")
        .split("\n")
        .map((ligne) => ligne.trim())
        .find((ligne) => ligne.includes("contrast") || ligne.includes("Element"));
      return `${v.id} — ${n.target.join(" ")}${mesure ? ` — ${mesure}` : ""}`;
    })
  );
}

// ---------------------------------------------------------------------------
// 1. Le registre est SERVI, pas seulement déclaré
// ---------------------------------------------------------------------------

test("la feuille du Banc est réellement appliquée sur l'examen", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  const mesures = await page.evaluate(() => {
    const reponse = document.querySelector(".banc-reponse") as HTMLElement;
    const stimulus = document.querySelector(".banc-stimulus") as HTMLElement;
    const racine = document.querySelector("main.banc") as HTMLElement;
    return {
      afficheReponse: getComputedStyle(reponse).display,
      // Non vide = le bloc `.banc` s'applique : sans la feuille, la propriété
      // personnalisée n'existe pas du tout.
      encreBanc: getComputedStyle(racine).getPropertyValue("--bc-banc").trim(),
      fondStimulus: getComputedStyle(stimulus).backgroundColor,
      cadre: (document.querySelector(".banc-cadre") as HTMLElement).getBoundingClientRect().width,
    };
  });

  expect(mesures.afficheReponse).toBe("flex");
  expect(mesures.encreBanc).not.toBe("");
  expect(mesures.fondStimulus).not.toBe("rgba(0, 0, 0, 0)");
  expect(mesures.cadre).toBeLessThanOrEqual(960);
});

// ---------------------------------------------------------------------------
// 2. La séance prend le cadre — le défaut central de l'audit F0b §1
// ---------------------------------------------------------------------------

test("le premier contrôle de réponse tient dans le premier écran", async ({ page }, infos) => {
  await vivierFixe(page);
  await lancer(page);

  const boite = await reponses(page).first().boundingBox();
  const hauteur = page.viewportSize()?.height ?? 0;
  expect(boite).not.toBeNull();
  expect(
    boite!.y + boite!.height,
    `projet ${infos.project.name} — bas du premier contrôle`
  ).toBeLessThanOrEqual(hauteur);
});

test("le chapeau éditorial se replie au lancement et reste rappelable", async ({ page }) => {
  await vivierFixe(page);
  await page.goto(EXAMEN);

  /*
    **Précisé au lot F7d.** La séance porte désormais son propre `<h1>`, et il
    s'appelle lui aussi « Examen blanc BIA » — c'est voulu, la tâche et la page
    ont le même nom. Le contrôle doit donc désigner le titre ÉDITORIAL, celui
    de l'avant-séance, sans quoi il lit le titre de séance et conclut que le
    chapeau ne s'est pas replié.
  */
  const titre = page
    .locator(".banc-introduction")
    .getByRole("heading", { level: 1, name: /Examen blanc BIA/i });
  await expect(titre).toBeVisible();

  await page.getByRole("button", { name: /Commencer l['’]examen/i }).click();
  await reponses(page).first().waitFor();
  // Masqué, mais TOUJOURS DANS LE DOM : l'état de l'examen ne dépend pas de
  // son démontage, et le rappel ne le reconstruit pas.
  await expect(titre).toBeHidden();

  await page.getByRole("button", { name: /Revoir les consignes/i }).click();
  await expect(titre).toBeVisible();
  // Le rappel ne quitte pas l'examen : la question est toujours là.
  await expect(reponses(page).first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. Le chronomètre, contrainte principale et non métadonnée
// ---------------------------------------------------------------------------

/**
 * L'audit F0b relevait cinq écritures différentes du temps et un traitement
 * périphérique systématique : gris, à la taille du compteur de questions,
 * parfois enfermé dans un `role="img"` à libellé statique — donc jamais
 * exposé. Le contrat tenu ici est celui du composant du lot F1b.
 */
test("le temps est exposé comme un compte à rebours nommé", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  const chrono = page.getByRole("timer", { name: /Temps restant/i });
  await expect(chrono).toBeVisible();

  const mesures = await chrono.evaluate((el) => {
    const style = getComputedStyle(el);
    const compteur = document.querySelector(".banc-stimulus") as HTMLElement;
    return {
      etat: el.getAttribute("data-etat"),
      // Une annonce à la seconde couvrirait toutes les autres.
      live: el.getAttribute("aria-live"),
      taille: Number.parseFloat(style.fontSize),
      graisse: style.fontWeight,
      // Le cadre lui donne une surface propre : sans elle, il resterait du
      // texte courant au fil de la ligne.
      fond: style.backgroundColor,
      tailleEnonce: Number.parseFloat(getComputedStyle(compteur).fontSize),
    };
  });

  expect(mesures.etat).toBe("normal");
  expect(mesures.live).toBe("off");
  expect(Number(mesures.graisse)).toBeGreaterThanOrEqual(600);
  expect(mesures.fond, "le chronomètre porte une surface").not.toBe("rgba(0, 0, 0, 0)");
  // Il n'est plus « de la taille d'une métadonnée » : au moins celle du corps.
  expect(mesures.taille).toBeGreaterThanOrEqual(mesures.tailleEnonce);

  // Deux écritures de la même valeur : la compacte pour l'œil, la naturelle
  // pour l'oreille. C'est cette dernière qui manquait partout.
  await expect(chrono).toContainText(/\d+:\d{2}/);
  await expect(chrono).toContainText(/heure|minute|seconde/);
});

// ---------------------------------------------------------------------------
// 4. Le parcours au clavier, et le focus à chaque transition
// ---------------------------------------------------------------------------

test("l'examen se joue au clavier, et le focus suit à chaque transition", async ({ page }) => {
  await vivierFixe(page);
  await page.goto(EXAMEN);

  // 1 — lancement → cadre de séance
  await page.getByRole("button", { name: /Commencer l['’]examen/i }).focus();
  await page.keyboard.press("Enter");
  await reponses(page).first().waitFor();
  expect(await focalise(page)).toBe("Examen blanc BIA");

  // Le cadre ne capture pas la tabulation : l'étape suivante est le PREMIER
  // CONTRÔLE de réponse. Le groupe de question, comme le cadre, porte
  // `tabindex="-1"` — atteignable par script, jamais dans l'ordre de
  // tabulation, exactement comme à la route pilote.
  await page.keyboard.press("Tab");
  expect(await focalise(page)).toBe("Vrai");

  // 2 — réponse au clavier
  await reponses(page).first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('.banc-reponse[aria-pressed="true"]')).toHaveCount(1);

  // 3 — changement de question → groupe de la nouvelle question
  await page.getByRole("button", { name: /^Suivante$/ }).focus();
  await page.keyboard.press("Enter");
  expect(await focalise(page)).toBe("Question 2 sur 10");

  // 4 — saut par le pavé → groupe de la question visée
  await page
    .getByRole("navigation", { name: /Navigation entre les questions/i })
    .getByRole("button")
    .nth(6)
    .click();
  expect(await focalise(page)).toBe("Question 7 sur 10");
});

/**
 * « Nouvel examen » remonte le mode séance : sans traitement explicite, le
 * bouton actionné disparaît avec l'ancienne instance et le focus retombe sur
 * `body`. C'est exactement le défaut que le lot F1a a nommé, et le seul motif
 * du réglage `focusAuMontage` ajouté à `ModeSeance`.
 */
test("« Nouvel examen » ramène à la présentation sans perdre le focus", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);
  await reponses(page).first().click();
  await page.getByRole("button", { name: /Terminer l['’]examen/i }).click();
  await page.getByRole("region", { name: /Correction de l['’]examen/i }).waitFor();

  await page.getByRole("button", { name: /Nouvel examen/i }).click();

  await expect(page.getByRole("heading", { level: 1, name: /Examen blanc BIA/i })).toBeVisible();
  expect(await focalise(page)).toBe("Commencer l’examen");
  await expect(reponses(page)).toHaveCount(0);
});

test("« Quitter la séance » revient à la présentation", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  await page.getByRole("button", { name: /Quitter la séance/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /Examen blanc BIA/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Commencer l['’]examen/i })).toBeVisible();
  await expect(reponses(page)).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 5. La correction : jamais la couleur seule
// ---------------------------------------------------------------------------

test("la correction écrit ses verdicts au lieu de les teinter", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);

  // Une juste : on répond au rang 0, toujours correct dans ce vivier.
  await reponses(page).first().click();
  await page.getByRole("button", { name: /Terminer l['’]examen/i }).click();

  const correction = page.getByRole("region", { name: /Correction de l['’]examen/i });
  await expect(correction).toBeVisible();

  // Toutes les questions, pour disposer d'une juste ET de ratées.
  await page.getByRole("button", { name: /Toutes les questions/i }).click();

  // Le verdict par question est un MOT, lisible par une technique
  // d'assistance — l'icône seule ne disait rien à l'oreille.
  await expect(correction.getByText("Juste").first()).toBeVisible();
  await expect(correction.getByText("Ratée").first()).toBeVisible();

  // Les bonnes réponses portent l'état ET son libellé, jamais la seule teinte.
  await expect(correction.locator('.banc-reponse[data-etat="juste"]').first()).toBeVisible();
  await expect(correction.getByText("Bonne réponse").first()).toBeAttached();
});

test("le lien « À réviser » est souligné au repos", async ({ page }) => {
  await vivierFixe(page);
  await lancer(page);
  await reponses(page).first().click();
  await page.getByRole("button", { name: /Terminer l['’]examen/i }).click();

  const lien = page
    .getByRole("region", { name: /Correction de l['’]examen/i })
    .getByRole("link", { name: "Le vent" })
    .first();
  // La CAUSE, pas le symptôme : `hover:underline` laissait `none` au repos.
  const decoration = await lien.evaluate((el) => getComputedStyle(el).textDecorationLine);
  expect(decoration).toBe("underline");
});

// ---------------------------------------------------------------------------
// 6. Vivier injoignable
// ---------------------------------------------------------------------------

test("un vivier injoignable interrompt l'examen par une alerte actionnable", async ({ page }) => {
  await page.route(POOL, (route) => route.fulfill({ status: 500, body: "" }));
  await page.goto(EXAMEN);
  await page.getByRole("button", { name: /Commencer l['’]examen/i }).click();

  // Portée `main` : Next.js pose son propre `role="alert"` (l'annonceur de
  // route) sur le document, et il ne concerne pas la séance.
  const alerte = page.locator("main").getByRole("alert");
  await expect(alerte).toContainText("Chargement impossible");
  // Un message sans issue serait une impasse.
  await expect(alerte.getByRole("button", { name: /Réessayer/i })).toBeVisible();
  await expect(reponses(page)).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 7. Axe sur chaque état principal, dans les deux registres
// ---------------------------------------------------------------------------

for (const registre of ["light", "dark"] as const) {
  test.describe(`registre ${registre}`, () => {
    test.use({ colorScheme: registre });

    test("aucune violation axe sur les trois états de l'examen", async ({ page }) => {
      await vivierFixe(page);

      // 1 — présentation
      await page.goto(EXAMEN);
      expect(await violations(page), "présentation").toEqual([]);

      // 2 — épreuve en cours (avec l'avertissement d'examen réduit)
      await page.getByRole("button", { name: /Commencer l['’]examen/i }).click();
      await reponses(page).first().waitFor();
      expect(await violations(page), "épreuve").toEqual([]);

      // 3 — correction
      await reponses(page).first().click();
      await page.getByRole("button", { name: /Terminer l['’]examen/i }).click();
      await page.getByRole("region", { name: /Correction de l['’]examen/i }).waitFor();
      await page.getByRole("button", { name: /Toutes les questions/i }).click();
      expect(await violations(page), "correction").toEqual([]);
    });
  });
}
