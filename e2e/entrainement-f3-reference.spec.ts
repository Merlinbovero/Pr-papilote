import { expect, test, type Page } from "@playwright/test";

/**
 * RÉFÉRENCE COMPORTEMENTALE DU LOT F3 — écrite AVANT la migration.
 *
 * Elle décrit ce que `/entrainement/eopn` et `/entrainement/alat` font
 * aujourd'hui, en rendu historique, et devra passer **inchangée** une fois ces
 * deux routes migrées au Banc. C'est la méthode qui a prouvé F2b : la campagne
 * verte avant migration, rejouée après, avec un `git diff` vide sur le fichier.
 *
 * ── Pourquoi elle ne nomme aucune classe ────────────────────────────────
 * Une assertion sur `.banc-reponse` passerait après migration et échouerait
 * avant ; une assertion sur la classe historique ferait l'inverse. Dans les
 * deux cas le fichier devrait être réécrit, et la preuve s'évanouirait — on ne
 * saurait plus si le comportement a tenu ou si le test a été plié.
 *
 * Les deux registres partagent ce qui compte : le bouton de réponse porte
 * `aria-pressed`, le lancement s'appelle « Commencer la série », la validation
 * « Valider ». La campagne ne s'appuie que là-dessus.
 *
 * ── Ce qu'elle ne teste pas, délibérément ───────────────────────────────
 * Ni densité, ni couleur, ni cadre, ni premier écran : ce sont précisément les
 * choses que la migration DOIT changer. Les mesurer ici reviendrait à
 * interdire le lot qu'elle prépare.
 */

const VIVIER = [
  {
    id: "f3.01",
    theme: "reference",
    difficulty: 1,
    statement: "Le vent est nommé par la direction d’où il vient.",
    choices: [{ label: "Vrai" }, { label: "Faux", note: "La convention est l’inverse." }],
    correctChoices: [0],
    explanation: "Un vent de 270° souffle de l’ouest vers l’est.",
    furtherReading: [{ label: "Le vent", href: "/fondamentaux/meteorologie/le-vent" }],
  },
  {
    id: "f3.02",
    theme: "reference",
    difficulty: 2,
    statement: "L’aérostat tient en l’air par la poussée d’Archimède.",
    choices: [{ label: "Vrai" }, { label: "Faux", note: "La convention est l’inverse." }],
    correctChoices: [0],
    explanation: "L’aérodyne, lui, tient par la portance.",
  },
];

/**
 * Vivier fixe et **indifférent au mélange** : la bonne réponse est toujours au
 * rang 0. `PoolQuiz` bat le vivier ; sans cette propriété, « juste » ou
 * « incorrect » dépendrait du tirage et le verdict ne prouverait rien — le
 * défaut même qui avait invalidé la première campagne d'audit F0b-2.
 */
async function vivierFixe(page: Page, concours: string) {
  await page.route(new RegExp(`/entrainement/${concours}/pool`), (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify(VIVIER) })
  );
}

/** Les réponses, dans les deux registres : seul `aria-pressed` est commun. */
const reponses = (page: Page) => page.locator("button[aria-pressed]");

/**
 * L'entrée du vivier réellement affichée.
 *
 * `PoolQuiz` bat les questions : fixer la bonne réponse au rang 0 rend le
 * VERDICT indifférent au tirage, mais pas les ÉNONCÉS. Affirmer
 * `VIVIER[0].explanation` revenait donc à parier sur l'ordre — la première
 * version de ce fichier le faisait, et onze contrôles sur vingt-huit sont
 * tombés selon le tirage. C'est exactement le défaut que le commentaire
 * ci-dessus met en garde de commettre.
 *
 * On lit donc ce qui est à l'écran, puis on en déduit ce qui doit s'y trouver.
 */
async function questionAffichee(page: Page) {
  for (const q of VIVIER) {
    if (
      await page
        .getByText(q.statement)
        .isVisible()
        .catch(() => false)
    )
      return q;
  }
  throw new Error("aucune question du vivier fixe n'est affichée");
}

async function lancer(page: Page, concours: string) {
  await vivierFixe(page, concours);
  await page.goto(`/entrainement/${concours}`);
  await page.getByRole("button", { name: /Commencer la série/i }).click();
  await reponses(page).first().waitFor();
}

for (const concours of ["eopn", "alat"] as const) {
  test.describe(`/entrainement/${concours} — référence F3`, () => {
    test("une série se lance et sert une question avec ses choix", async ({ page }) => {
      await lancer(page, concours);
      await questionAffichee(page); // lève si le vivier fixe n'est pas servi
      await expect(reponses(page)).toHaveCount(2);
      await expect(reponses(page).first()).toHaveAttribute("aria-pressed", "false");
    });

    test("sélectionner une réponse la marque, et une seule", async ({ page }) => {
      await lancer(page, concours);
      await reponses(page).first().click();
      await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
    });

    test("une réponse juste est corrigée comme telle", async ({ page }) => {
      await lancer(page, concours);
      const q = await questionAffichee(page);
      await reponses(page).first().click();
      await page.getByRole("button", { name: "Valider" }).click();
      // Le verdict est ÉCRIT, jamais seulement teinté : c'est le contrat
      // non chromatique, antérieur au Banc et qu'il doit conserver.
      await expect(page.getByText(q.explanation)).toBeVisible();
      await expect(page.getByRole("button", { name: /Question suivante/i })).toBeVisible();
    });

    test("une réponse incorrecte est corrigée comme telle", async ({ page }) => {
      await lancer(page, concours);
      const q = await questionAffichee(page);
      await reponses(page).nth(1).click();
      await page.getByRole("button", { name: "Valider" }).click();
      await expect(page.getByText(q.explanation)).toBeVisible();
    });

    test("le renvoi « Pour approfondir » mène à la fiche annoncée", async ({ page }) => {
      await lancer(page, concours);
      // Une seule des deux questions porte un renvoi : on avance jusqu'à elle
      // plutôt que de parier sur l'ordre du tirage.
      for (let i = 0; i < VIVIER.length; i += 1) {
        const q = await questionAffichee(page);
        await reponses(page).first().click();
        await page.getByRole("button", { name: "Valider" }).click();
        if (q.furtherReading) {
          await expect(page.getByRole("link", { name: "Le vent" })).toHaveAttribute(
            "href",
            "/fondamentaux/meteorologie/le-vent"
          );
          return;
        }
        await page.getByRole("button", { name: /Question suivante/i }).click();
        await reponses(page).first().waitFor();
      }
      throw new Error("aucune question du vivier ne portait de renvoi");
    });

    test("la série avance, atteint les résultats et se relance", async ({ page }) => {
      await lancer(page, concours);
      const premiere = await questionAffichee(page);

      await reponses(page).first().click();
      await page.getByRole("button", { name: "Valider" }).click();
      await page.getByRole("button", { name: /Question suivante/i }).click();
      await reponses(page).first().waitFor();

      // La seconde question est une AUTRE que la première — sans présumer
      // laquelle, puisque le tirage est battu.
      const seconde = await questionAffichee(page);
      expect(seconde.id).not.toBe(premiere.id);
      await reponses(page).first().click();
      await page.getByRole("button", { name: "Valider" }).click();
      await page.getByRole("button", { name: /Voir le résultat/i }).click();

      // Deux justes sur deux : le score est une donnée que la séance possède,
      // pas une statistique fabriquée.
      await expect(page.getByText(/2\s*\/\s*2/)).toBeVisible();

      await page.getByRole("button", { name: "Recommencer" }).click();
      await expect(reponses(page).first()).toBeVisible();
    });

    test("la séance n'écrit rien dans le navigateur", async ({ page }) => {
      await lancer(page, concours);
      await reponses(page).first().click();
      await page.getByRole("button", { name: "Valider" }).click();

      // Cette route ne persiste rien — contrairement à `/reviser`. La
      // migration ne doit pas lui en donner l'habitude au passage.
      const cles = await page.evaluate(() => Object.keys(window.localStorage));
      expect(cles.filter((c) => c.startsWith("prepapilote:"))).toEqual([]);
    });
  });
}
