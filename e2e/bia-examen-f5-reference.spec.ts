import { expect, test, type Page } from "@playwright/test";

/**
 * RÉFÉRENCE COMPORTEMENTALE DU LOT F5 — écrite AVANT la migration.
 *
 * L'examen blanc BIA est la **vraie séance autonome** du chantier : lancement
 * explicite, cent questions, chronomètre long, pavé de navigation, résultat,
 * reprise. Il relève donc pleinement du registre du Banc au sens de la règle
 * arbitrée au lot F4 — contrairement aux quiz encastrés, classés documentaires.
 *
 * C'est aussi le lot le plus risqué : le moteur est **distinct** de
 * `QuizPlayer`, avec ses propres phases, son propre chronomètre et sa propre
 * persistance. Une migration qui casserait l'une des trois ne se verrait pas
 * dans les campagnes existantes.
 *
 * ── Sur quoi elle s'appuie ──────────────────────────────────────────────
 * Uniquement sur les repères qui survivent à un changement de registre : les
 * landmarks ARIA des trois phases, le nom accessible de la barre de
 * progression, celui du pavé de navigation, et les libellés de commande. Aucune
 * classe CSS n'est nommée — une assertion sur `.banc-*` passerait après et
 * échouerait avant, et la preuve s'évanouirait.
 *
 * ── Ce qu'elle ne teste pas, délibérément ───────────────────────────────
 * Ni densité, ni couleur, ni cadre : ce sont les choses que la migration doit
 * changer.
 */

const EXAMEN = "/bia/examen-blanc";
const CLE_HISTORIQUE = "prepapilote.bia.examHistory";

const intro = (page: Page) => page.getByRole("region", { name: /Présentation de l'examen/i });
const seance = (page: Page) => page.getByRole("region", { name: /Examen blanc en cours/i });
const correction = (page: Page) => page.getByRole("region", { name: /Correction de l'examen/i });
const pave = (page: Page) =>
  page.getByRole("navigation", { name: /Navigation entre les questions/i });
const reponses = (page: Page) => page.locator("button[aria-pressed]");

async function lancer(page: Page) {
  await page.goto(EXAMEN);
  await page.getByRole("button", { name: /Commencer l['’]examen/i }).click();
  await seance(page).waitFor({ timeout: 25_000 });
}

test.describe("examen blanc BIA — référence F5", () => {
  test("la présentation annonce les conditions avant de lancer", async ({ page }) => {
    await page.goto(EXAMEN);
    await expect(intro(page)).toBeVisible();
    await expect(page.getByRole("button", { name: /Commencer l['’]examen/i })).toBeEnabled();
    // La séance n'existe pas tant qu'elle n'est pas demandée.
    await expect(seance(page)).toHaveCount(0);
  });

  test("le lancement ouvre la séance, sa progression et son pavé", async ({ page }) => {
    await lancer(page);
    await expect(intro(page)).toHaveCount(0);

    // La barre porte un nom ET une valeur : c'est le contrat d'annonce, pas
    // une décoration. Une barre sans `aria-valuetext` ne dit rien à l'oreille.
    const barre = page.getByRole("progressbar", { name: /Progression de l['’]examen/i });
    await expect(barre).toHaveAttribute("aria-valuetext", /réponse/);

    await expect(pave(page)).toBeVisible();
    expect(await reponses(page).count(), "des choix sont proposés").toBeGreaterThanOrEqual(2);
  });

  test("le chronomètre est présent et décroît", async ({ page }) => {
    await lancer(page);
    const lire = () => seance(page).innerText();
    const avant = await lire();
    await page.waitForTimeout(2200);
    const apres = await lire();
    // On ne fixe aucune durée : on vérifie que le temps affiché CHANGE.
    // Figer une valeur rendrait le contrôle dépendant de la machine.
    expect(apres, "l'affichage du temps doit évoluer").not.toBe(avant);
  });

  test("répondre, marquer et naviguer laissent l'état en place", async ({ page }) => {
    await lancer(page);

    await reponses(page).first().click();
    await expect(page.locator('button[aria-pressed="true"]').first()).toBeVisible();

    const marquer = page.getByRole("button", { name: /^Marquer$/ });
    await marquer.click();
    await expect(page.getByRole("button", { name: /^Marquée$/ })).toBeVisible();

    await page.getByRole("button", { name: /^Suivante$/ }).click();
    await page.getByRole("button", { name: /^Précédente$/ }).click();

    // Retour à la première question : la réponse et la marque ont tenu.
    await expect(page.getByRole("button", { name: /^Marquée$/ })).toBeVisible();
    await expect(page.locator('button[aria-pressed="true"]').first()).toBeVisible();
  });

  test("le pavé mène directement à une question", async ({ page }) => {
    await lancer(page);
    const cibles = pave(page).getByRole("button");
    expect(await cibles.count(), "le pavé liste les questions").toBeGreaterThan(10);
    await cibles.nth(4).click();
    // Le groupe de question nomme son rang : c'est lui qui doit avoir suivi.
    await expect(seance(page).getByRole("group", { name: /Question 5 sur/i })).toBeVisible();
  });

  test("terminer produit une correction et enregistre l'examen", async ({ page }) => {
    await lancer(page);
    await reponses(page).first().click();
    await page.getByRole("button", { name: /Terminer l['’]examen/i }).click();

    await expect(correction(page)).toBeVisible();
    await expect(correction(page)).toContainText(/\d+\s*\/\s*\d+/);

    // L'examen blanc PERSISTE son historique — contrairement aux séances
    // d'entraînement. La migration ne doit ni le supprimer ni en changer la clé.
    const historique = await page.evaluate(
      (cle) => window.localStorage.getItem(cle),
      CLE_HISTORIQUE
    );
    expect(historique, "l'historique doit être écrit").not.toBeNull();
    expect(JSON.parse(historique!).length, "au moins une entrée").toBeGreaterThan(0);
  });

  test("un nouvel examen repart de la présentation", async ({ page }) => {
    await lancer(page);
    await page.getByRole("button", { name: /Terminer l['’]examen/i }).click();
    await correction(page).waitFor();
    await page.getByRole("button", { name: /Nouvel examen/i }).click();
    await expect(intro(page)).toBeVisible();
  });
});
