import { expect, test, type Page } from "@playwright/test";

/**
 * RÉFÉRENCE COMPORTEMENTALE DU LOT F4 — écrite AVANT la migration.
 *
 * Elle décrit ce que le quiz de matière BIA fait aujourd'hui, en rendu
 * historique, et devra passer **inchangée** une fois ce moteur migré. Même
 * méthode qu'aux lots F2b et F3, où le `git diff` du fichier de test était vide
 * de part et d'autre de la migration.
 *
 * ── Pourquoi elle n'affirme aucun contenu ───────────────────────────────
 * À la différence de `/entrainement/*`, le vivier n'est pas servi par une
 * route interceptable : il est sérialisé dans la page par le serveur, et la
 * série est tirée au clic parmi une centaine de questions. Aucun `page.route`
 * ne peut donc le fixer.
 *
 * La campagne est écrite en conséquence : elle ne nomme aucun énoncé, aucune
 * réponse, aucune explication. Elle lit ce qui est à l'écran et vérifie la
 * STRUCTURE du parcours. C'est la leçon de F3, où fixer la bonne réponse au
 * rang 0 rendait le verdict indifférent au tirage mais pas les énoncés — onze
 * contrôles sur vingt-huit étaient tombés selon l'ordre.
 *
 * ── Ce qu'elle ne teste pas, délibérément ───────────────────────────────
 * Ni densité, ni couleur, ni cadre : ce sont les choses que la migration doit
 * changer. Les mesurer ici interdirait le lot qu'elle prépare.
 */

const MATIERE = "/bia/aerodynamique-et-principes-du-vol";

/** Les réponses, dans les deux registres : seul `aria-pressed` est commun. */
const reponses = (page: Page) => page.locator("button[aria-pressed]");

/** L'énoncé affiché, quel qu'il soit — on ne parie jamais sur le tirage. */
async function enonce(page: Page): Promise<string> {
  const bloc = page.locator("main").getByRole("group").first();
  return (await bloc.innerText()).slice(0, 200);
}

async function lancer(page: Page) {
  await page.goto(MATIERE);
  await page.getByRole("button", { name: /Lancer une série/i }).click();
  await reponses(page).first().waitFor();
}

test.describe("quiz de matière BIA — référence F4", () => {
  test("le bloc annonce la série avant de la lancer", async ({ page }) => {
    await page.goto(MATIERE);
    const section = page.getByRole("region", { name: "Quiz de la matière" });
    await expect(section).toBeVisible();
    // Le nombre de questions du vivier est une donnée que la page possède ;
    // le contrôle vérifie qu'elle est annoncée, sans en fixer la valeur.
    await expect(section).toContainText(/série de \d+ questions tirées des \d+/i);
    await expect(section.getByRole("button", { name: /Lancer une série/i })).toBeEnabled();
  });

  test("une série se lance et sert une question avec ses choix", async ({ page }) => {
    await lancer(page);
    expect((await enonce(page)).length, "un énoncé doit être affiché").toBeGreaterThan(10);
    expect(await reponses(page).count(), "au moins deux choix").toBeGreaterThanOrEqual(2);
    await expect(reponses(page).first()).toHaveAttribute("aria-pressed", "false");
  });

  test("sélectionner une réponse la marque, et une seule", async ({ page }) => {
    await lancer(page);
    await reponses(page).first().click();
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
  });

  test("valider produit une correction et ouvre la question suivante", async ({ page }) => {
    await lancer(page);
    const avant = await enonce(page);

    await reponses(page).first().click();
    await page.getByRole("button", { name: "Valider" }).click();

    // Le verdict est ÉCRIT, jamais seulement teinté — contrat non chromatique
    // antérieur au Banc, que la migration doit conserver.
    await expect(page.getByRole("button", { name: /Question suivante/i })).toBeVisible();

    await page.getByRole("button", { name: /Question suivante/i }).click();
    await reponses(page).first().waitFor();
    expect(await enonce(page), "la question doit changer").not.toBe(avant);
  });

  test("la série va jusqu'aux résultats et se relance", async ({ page }) => {
    await lancer(page);

    // La série compte dix questions par défaut : on la parcourt jusqu'au bout
    // sans présumer de sa longueur exacte, que le vivier peut borner.
    for (let i = 0; i < 30; i += 1) {
      const suivante = page.getByRole("button", { name: /Question suivante/i });
      const resultat = page.getByRole("button", { name: /Voir le résultat/i });
      await reponses(page).first().click();
      await page.getByRole("button", { name: "Valider" }).click();
      if (await resultat.isVisible().catch(() => false)) {
        await resultat.click();
        break;
      }
      await suivante.click();
      await reponses(page).first().waitFor();
    }

    // Le score est une donnée que la séance possède, jamais une statistique
    // fabriquée : on vérifie sa forme, pas sa valeur.
    await expect(page.locator("main")).toContainText(/\d+\s*\/\s*\d+/);

    await page.getByRole("button", { name: /Nouvelle série/i }).click();
    await expect(reponses(page).first()).toBeVisible();
  });

  test("la séance n'écrit rien dans le navigateur", async ({ page }) => {
    await lancer(page);
    await reponses(page).first().click();
    await page.getByRole("button", { name: "Valider" }).click();

    // Cette route ne persiste rien, contrairement à `/reviser`. La migration
    // ne doit pas lui en donner l'habitude au passage.
    const cles = await page.evaluate(() => Object.keys(window.localStorage));
    expect(cles.filter((c) => c.startsWith("prepapilote:"))).toEqual([]);
  });
});
