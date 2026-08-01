import { expect, test, type Page } from "@playwright/test";

/**
 * RÉFÉRENCE COMPORTEMENTALE DU LOT F7b — écrite AVANT la migration.
 *
 * Les sept épreuves de famille du module psychotechnique n'avaient, au moment
 * d'écrire ce fichier, **aucune couverture end-to-end**. Cinq mille lignes de
 * composants, sept routes publiques, et rien qui dise ce qu'elles font. Migrer
 * dans cet état reviendrait à changer sept moteurs les yeux fermés.
 *
 * ── Sur quoi elle s'appuie ──────────────────────────────────────────────
 * Uniquement sur ce qui survit à un changement de registre : le libellé de la
 * commande de lancement, l'apparition d'un compteur de position, et la
 * présence d'un contrôle réellement actionnable. **Aucune classe CSS n'est
 * nommée** — une assertion sur `.banc-*` passerait après la migration et
 * échouerait avant, et la preuve s'évanouirait.
 *
 * ── Ce qu'elle ne teste pas, et pourquoi ────────────────────────────────
 * Ni densité, ni couleur, ni cadre : ce sont les choses que la migration doit
 * changer. Ni le déroulé complet d'une session : chaque épreuve a sa propre
 * mécanique de réponse — pavé composé pour les dominos, saisie numérique pour
 * le calcul, choix simple ailleurs — et un contrôle qui prétendrait les
 * couvrir toutes finirait par ne rien vérifier nulle part. Ce que ce fichier
 * garantit est plus modeste et vrai : **chaque épreuve se lance, et le
 * lancement produit bien une épreuve**.
 *
 * ── Un défaut relevé et NON corrigé ici ─────────────────────────────────
 * Ces sept séances n'exposent aucun repère ARIA : pas de région nommée, pas
 * de barre de progression nommée, contrairement à l'entraînement
 * chronométré migré au lot F7a. Une technique d'assistance n'a donc rien où
 * se poser. Le constat appartient à la migration, pas à cette référence —
 * qui ne peut vérifier que l'existant.
 */

interface Epreuve {
  /** L'intitulé lisible, pour les messages d'échec. */
  nom: string;
  route: string;
  /** La commande qui lance l'épreuve, telle qu'elle est écrite aujourd'hui. */
  lancement: RegExp;
  /**
   * Le compteur de position affiché en séance. C'est le repère le plus stable
   * de ces sept moteurs : chacun nomme son unité — domino, vue, figure,
   * assemblage, question — et cette nomenclature est éditoriale, donc
   * indépendante du registre visuel.
   */
  compteur: RegExp;
}

const EPREUVES: Epreuve[] = [
  {
    nom: "Dominos",
    route: "/psychotechnique/dominos",
    lancement: /Lancer le test/i,
    compteur: /Domino\s+1\b/,
  },
  {
    nom: "Calcul mental",
    route: "/psychotechnique/calcul-mental",
    lancement: /^Commencer$/,
    compteur: /Question\s+1\b/,
  },
  {
    nom: "Codage",
    route: "/psychotechnique/codage",
    lancement: /Lancer le test/i,
    compteur: /Question\s+1\b/,
  },
  {
    nom: "Appareils photos",
    route: "/psychotechnique/appareils-photos",
    lancement: /Lancer le test/i,
    compteur: /Vue\s+1\b/,
  },
  {
    nom: "Formes imbriquées",
    route: "/psychotechnique/formes-imbriquees",
    lancement: /Lancer le test/i,
    compteur: /Assemblage\s+1\b/,
  },
  {
    nom: "Triangles",
    route: "/psychotechnique/triangles",
    lancement: /Lancer le test/i,
    compteur: /Figure\s+1\b/,
  },
  {
    nom: "Orientation",
    route: "/psychotechnique/orientation",
    lancement: /Commencer/i,
    compteur: /Question\s+1\s+sur/,
  },
];

/**
 * Lance l'épreuve et rend la main une fois la séance réellement engagée.
 *
 * Plusieurs de ces écrans proposent la commande une fois par niveau : on prend
 * la première, et le contrôle ne suppose donc rien du nombre de niveaux.
 */
async function lancer(page: Page, epreuve: Epreuve) {
  await page.goto(epreuve.route);
  await page.getByRole("button", { name: epreuve.lancement }).first().click();
  await expect(page.getByText(epreuve.compteur).first()).toBeVisible({ timeout: 20_000 });
}

for (const epreuve of EPREUVES) {
  test.describe(`${epreuve.nom} — référence F7b`, () => {
    test("la présentation propose un lancement, et rien n'est encore engagé", async ({ page }) => {
      const reponse = await page.goto(epreuve.route);
      // Une route en 404 passerait tous les contrôles suivants en silence :
      // le statut est donc vérifié avant toute chose.
      expect(reponse?.status(), `${epreuve.route} doit répondre`).toBeLessThan(400);

      await expect(page.getByRole("button", { name: epreuve.lancement }).first()).toBeEnabled();
    });

    test("le lancement remplace la présentation par la séance", async ({ page }) => {
      /*
        **Ce contrôle a d'abord été écrit à l'envers, et la campagne l'a
        montré.** Il affirmait que le compteur de position n'existe pas tant
        que la séance n'est pas demandée. C'est faux pour les dominos : leur
        présentation contient un tutoriel qui déroule une série d'exemple,
        compteur compris. La prémisse était donc fausse, pas le produit.

        Ce qui distingue réellement l'avant de l'après est la COMMANDE : elle
        est offerte avant, elle a disparu après. Cela vaut pour les sept
        épreuves, et ne suppose rien de ce que leur présentation contient.
      */
      await page.goto(epreuve.route);
      const commande = page.getByRole("button", { name: epreuve.lancement }).first();
      await expect(commande).toBeVisible();

      await commande.click();
      await expect(page.getByText(epreuve.compteur).first()).toBeVisible({ timeout: 20_000 });
      await expect(page.getByRole("button", { name: epreuve.lancement })).toHaveCount(0);
    });

    test("le lancement produit une épreuve réellement jouable", async ({ page }) => {
      await lancer(page, epreuve);

      // Un compteur seul ne prouverait qu'un changement d'écran. Ce qui compte
      // est qu'il y ait quelque chose à FAIRE : au moins un contrôle actif
      // dans le corps de la page, hors navigation de site.
      const controles = page.locator("main button:not([disabled])");
      expect(
        await controles.count(),
        `${epreuve.nom} — la séance doit offrir un contrôle actionnable`
      ).toBeGreaterThan(0);
    });

    test("la page garde un titre de niveau 1 unique pendant la séance", async ({ page }) => {
      /*
        Contrôlé ICI et pas seulement dans `titre-unique.spec.ts` : ce dernier
        balaie les routes **au repos**. Or c'est précisément une phase de jeu
        qui avait introduit un second `<h1>` sur l'exercice d'orientation
        (défaut R-02), et aucune inspection statique ne l'atteignait.
      */
      await lancer(page, epreuve);
      /*
        « AU PLUS un », et non « exactement un » — corrigé après la première
        migration du lot F7b, qui a montré que l'assertion encodait un état
        plutôt qu'un invariant.

        Le défaut R-02 était l'apparition d'un SECOND titre de niveau 1 pendant
        une phase de jeu. C'est cela qu'il faut interdire. Or le mode séance
        replie le chapeau éditorial, titre compris : sur une route migrée, la
        séance n'expose plus aucun `<h1>`, et « exactement un » y échouerait —
        en signalant le repli, qui est le but du chantier, et non une
        régression.

        **Ce zéro est consigné comme une observation à trancher à la clôture du
        Banc**, et il vaut pour les cinq routes déjà migrées, pas seulement
        pour celles-ci : une séance sans titre de niveau 1 laisse la question
        « où suis-je » au seul nom accessible du cadre de séance. Ce nom
        existe et est vérifié ailleurs ; savoir s'il suffit est une décision de
        doctrine, pas un correctif à glisser dans une référence.
      */
      const titres = await page.getByRole("heading", { level: 1 }).count();
      expect(titres, `${epreuve.nom} — jamais deux titres de niveau 1`).toBeLessThanOrEqual(1);
    });
  });
}
