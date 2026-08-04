import { expect, test, type Page } from "@playwright/test";

/**
 * RÉFÉRENCE COMPORTEMENTALE DU LOT F9 — écrite AVANT la migration.
 *
 * SECPIL est le moteur le plus lourd du produit : simulateur temps réel, trois
 * tâches menées de front — suivi d'un point sur un « 8 », cible horizontale,
 * calcul mental — boucle d'animation, pavé numérique modal, historique de
 * progression. Rien de tout cela n'avait de contrôle end-to-end.
 *
 * ── Sur quoi elle s'appuie ──────────────────────────────────────────────
 * Uniquement sur ce qui survit à un changement de registre : les libellés de
 * commande, le nom accessible de l'écran de simulation, et la bascule entre
 * les trois états. **Aucune classe CSS n'est nommée.**
 *
 * ── Ce qu'elle ne fait pas, délibérément ────────────────────────────────
 * Elle ne joue pas une session complète. Le SECPIL se pilote à la souris et
 * aux flèches, en temps réel, sur plusieurs minutes : un contrôle qui
 * prétendrait le jouer mesurerait la machine et non le produit. Ce qu'elle
 * garantit est plus modeste et vrai : **la sélection mène à la simulation, et
 * la simulation se quitte**.
 *
 * ── Un défaut relevé et NON corrigé ici ─────────────────────────────────
 * Le temps restant et la précision sont dessinés DANS le `<svg>`, lequel porte
 * `role="img"` et un libellé statique : ces deux valeurs ne sont donc jamais
 * exposées à une technique d'assistance. Le défaut est déjà nommé dans la
 * charte du Banc (lot F1b, à propos du chronomètre). Le corriger appartient à
 * la migration ; une référence ne peut vérifier que l'existant.
 */

const SECPIL = "/psychotechnique/secpil";

const ecran = (page: Page) => page.getByRole("img", { name: /Écran SECPIL/i });
const demarrer = (page: Page) => page.getByRole("button", { name: /Démarrer la session/i });

async function lancer(page: Page) {
  await page.goto(SECPIL);
  await demarrer(page).click();
  await expect(ecran(page)).toBeVisible({ timeout: 20_000 });
}

test.describe("SECPIL — référence F9", () => {
  test("la sélection propose ses modes et un lancement", async ({ page }) => {
    const reponse = await page.goto(SECPIL);
    expect(reponse?.status(), `${SECPIL} doit répondre`).toBeLessThan(400);

    // Les trois tâches isolées et leur combinaison : c'est la progression que
    // l'écran propose, et elle ne dépend d'aucun registre.
    await expect(page.getByRole("button", { name: "Palonnier seul" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Le « 8 » seul/ })).toBeVisible();
    await expect(demarrer(page)).toBeEnabled();

    // La simulation n'existe pas tant qu'elle n'est pas demandée.
    await expect(ecran(page)).toHaveCount(0);
  });

  test("le lancement ouvre la simulation, et le mode choisi la gouverne", async ({ page }) => {
    await page.goto(SECPIL);
    await page.getByRole("button", { name: "Palonnier seul" }).click();
    await demarrer(page).click();

    await expect(ecran(page)).toBeVisible({ timeout: 20_000 });
    // La consigne sous l'écran rappelle le mode : c'est la seule trace
    // textuelle du choix pendant la simulation, et elle doit suivre.
    await expect(page.getByText("Palonnier seul").last()).toBeVisible();
    // La commande de lancement a laissé la place à la simulation.
    await expect(demarrer(page)).toHaveCount(0);
  });

  test("la simulation offre une sortie, qui ramène à la sélection", async ({ page }) => {
    await lancer(page);

    await page.getByRole("button", { name: /^Quitter$/ }).click();
    await expect(demarrer(page)).toBeVisible();
    await expect(ecran(page)).toHaveCount(0);
  });

  test("la page garde un titre de niveau 1 unique, avant comme pendant", async ({ page }) => {
    /*
      « AU PLUS un » pendant la simulation : la règle est celle arbitrée le
      2026-08-01. Avant migration, le chapeau éditorial reste affiché et le
      compte vaut un ; après, la séance portera son propre titre et il vaudra
      toujours un. Ce qui doit rester interdit dans les deux cas, c'est DEUX —
      le défaut R-02.
    */
    await page.goto(SECPIL);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    await demarrer(page).click();
    await expect(ecran(page)).toBeVisible({ timeout: 20_000 });
    const titres = await page.getByRole("heading", { level: 1 }).count();
    expect(titres, "jamais deux titres de niveau 1").toBeLessThanOrEqual(1);
  });
});
