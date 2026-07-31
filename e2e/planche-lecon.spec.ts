import { expect, test, type Page } from "@playwright/test";

/**
 * Lot M5 — la famille La Leçon.
 *
 * Ce que ce fichier garde : la cote gelée, le sommaire ancré et son
 * amélioration progressive, le sas de sortie, le bloc « Voir aussi ».
 *
 * L'exigence la plus forte est la première : **le sommaire doit fonctionner
 * sans JavaScript.** Le repère de section courante est un confort, jamais une
 * condition pour naviguer.
 */

const LECON = "/cours/couche-limite-et-decrochage";

/** Les quatorze leçons et leur cote gelée (`content/_referentiels/cotes.json`). */
const COTES: [string, string][] = [
  ["forces-et-lois-de-newton", "FOND · B.1.01"],
  ["pression-et-ecoulement", "FOND · B.3.02"],
  ["bernoulli-et-venturi", "FOND · B.3.03"],
  ["les-souffleries", "FOND · B.3.04"],
  ["la-force-aerodynamique", "FOND · B.3.05"],
  ["trainee-induite-et-allongement", "FOND · B.3.06"],
  ["couche-limite-et-decrochage", "FOND · B.3.07"],
  ["la-polaire-et-la-finesse", "FOND · B.3.08"],
  ["les-types-de-profils", "FOND · B.3.09"],
  ["dispositifs-hypersustentateurs", "FOND · B.3.10"],
  ["les-axes-et-les-gouvernes", "FOND · B.3.11"],
  ["les-bilans-de-forces", "FOND · B.3.12"],
  ["les-effets-moteur", "FOND · B.3.13"],
  ["stabilite-et-centrage", "FOND · B.3.14"],
];

/** Les ancres du sommaire et leurs cibles, telles que le serveur les rend. */
async function ancres(page: Page): Promise<string[]> {
  return page
    .locator(".pl-toc a")
    .evaluateAll((liens) => liens.map((l) => (l.getAttribute("href") ?? "").replace("#", "")));
}

test.describe("cote documentaire", () => {
  test("les quatorze leçons portent leur cote gelée", async ({ page }) => {
    for (const [slug, cote] of COTES) {
      await page.goto(`/cours/${slug}`);
      // La cote paraît deux fois : en marge et au cartouche, selon la largeur.
      await expect(page.locator(".pl-cote"), slug).toHaveText(cote);
    }
  });
});

test.describe("sommaire ancré", () => {
  test("chaque entrée pointe vers une section réellement rendue", async ({ page }) => {
    for (const [slug] of COTES) {
      await page.goto(`/cours/${slug}`);
      const ids = await ancres(page);
      expect(ids.length, `${slug} : sommaire vide`).toBeGreaterThan(2);
      for (const id of ids) {
        await expect(page.locator(`#${id}`), `${slug} → #${id}`).toHaveCount(1);
      }
    }
  });

  test("les ancres sont rendues par le serveur et fonctionnent sans JavaScript", async ({
    browser,
  }) => {
    // Contexte sans JavaScript : c'est le test qui compte, celui qui distingue
    // une amélioration progressive d'un sommaire qui n'existe qu'en client.
    const contexte = await browser.newContext({ javaScriptEnabled: false });
    const page = await contexte.newPage();
    await page.goto(LECON);

    const sommaire = page.getByRole("navigation", { name: "Sommaire de la leçon" });
    await expect(sommaire).toBeVisible();
    await expect(sommaire.getByRole("link", { name: "Objectifs" })).toBeVisible();

    await sommaire.getByRole("link", { name: "Manipuler" }).click();
    expect(new URL(page.url()).hash).toBe("#manipuler");
    await contexte.close();
  });

  test("les numéros de paragraphe ne polluent pas le nom accessible", async ({ page }) => {
    await page.goto(LECON);
    const sommaire = page.getByRole("navigation", { name: "Sommaire de la leçon" });
    // « 1Objectifs » serait le symptôme d'une cote lue comme un mot.
    await expect(sommaire.getByRole("link", { name: "Objectifs", exact: true })).toBeVisible();
    await expect(
      sommaire.getByRole("link", { name: "Fiches à étudier", exact: true })
    ).toBeVisible();
  });

  test("le sommaire se parcourt entièrement au clavier", async ({ page }) => {
    await page.goto(LECON);
    const liens = page.locator(".pl-toc a");
    const total = await liens.count();
    await liens.first().focus();
    for (let i = 1; i < total; i += 1) {
      await page.keyboard.press("Tab");
      await expect(liens.nth(i)).toBeFocused();
    }
    await page.keyboard.press("Enter");
    /*
      `page.url()` était lu SYNCHRONIQUEMENT après la frappe, sans aucune
      attente : l'assertion courait avant que la navigation d'ancre ne soit
      validée. Elle passait sur une machine au repos et tombait sous charge
      — observé lors d'une campagne complète du lot F2a. `expect.poll`
      réessaie jusqu'au délai imparti, sans rien changer à ce qui est
      vérifié.
    */
    await expect.poll(() => new URL(page.url()).hash).not.toBe("");
  });

  test("le repère suit la lecture sans jamais toucher à l'adresse", async ({ page }) => {
    await page.goto(LECON);
    await page.evaluate(() => document.fonts.ready);
    const courante = () => page.locator('.pl-toc a[aria-current="true"]');

    await expect(courante()).toHaveCount(1);
    for (const cible of ["fiches", "manipuler", "essentiel"]) {
      await page.evaluate((id) => document.getElementById(id)?.scrollIntoView(), cible);
      await expect.poll(async () => courante().getAttribute("href")).toBe(`#${cible}`);
      // Le défilement ne réécrit pas l'URL : l'historique resterait
      // inutilisable et le bouton « retour » sauterait de section en section.
      expect(new URL(page.url()).hash, `après ${cible}`).toBe("");
    }
  });

  test("un seul repère à la fois", async ({ page }) => {
    await page.goto(LECON);
    await page.evaluate(() => document.getElementById("se-tester")?.scrollIntoView());
    await expect(page.locator('.pl-toc a[aria-current="true"]')).toHaveCount(1);
  });

  test("le défilement n'est pas animé quand le lecteur le demande", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(LECON);
    const comportement = await page
      .locator(".pl-root")
      .first()
      .evaluate((el) => getComputedStyle(el).scrollBehavior);
    expect(comportement).toBe("auto");
  });
});

test.describe("sas de sortie", () => {
  test("annonce le nombre de questions jouables et mène au quiz", async ({ page }) => {
    await page.goto(LECON);
    const sas = page.locator(".pl-sortie a");
    await expect(sas).toHaveAttribute("href", "#se-tester");
    const texte = (await sas.textContent()) ?? "";
    expect(texte).toMatch(/^\d+ questions? porten?t sur cette leçon$/);

    // Le compte annoncé est celui du vivier réellement jouable : autant de
    // questions que le lecteur en trouvera dans « Se tester ».
    const annonce = Number(texte.match(/^(\d+)/)?.[1]);
    const total = await page
      .locator("#se-tester")
      .locator("..")
      .getByText(/Question 1 \/ \d+/);
    const compteur = (await total.textContent()) ?? "";
    expect(Number(compteur.match(/\/ (\d+)/)?.[1])).toBe(annonce);
  });

  test("accorde le singulier et le pluriel", async ({ page }) => {
    // Sur les quatorze leçons, aucune ne doit écrire « 1 questions portent ».
    for (const [slug] of COTES) {
      await page.goto(`/cours/${slug}`);
      const sas = page.locator(".pl-sortie a");
      if ((await sas.count()) === 0) continue;
      const texte = (await sas.textContent()) ?? "";
      const n = Number(texte.match(/^(\d+)/)?.[1]);
      expect(texte, slug).toBe(
        n === 1 ? "1 question porte sur cette leçon" : `${n} questions portent sur cette leçon`
      );
    }
  });
});

test.describe("voir aussi", () => {
  test("renvoie vers des routes canoniques existantes", async ({ page }) => {
    await page.goto(LECON);
    const bloc = page.getByRole("navigation", { name: "Voir aussi" });
    await expect(bloc).toBeVisible();
    const liens = await bloc
      .locator("a")
      .evaluateAll((a) => a.map((l) => l.getAttribute("href") ?? ""));
    expect(liens.length).toBeGreaterThan(1);
    for (const href of liens) {
      expect(href, "route relative attendue").toMatch(/^\/[a-z0-9/-]+$/);
      const reponse = await page.request.get(href);
      expect(reponse.status(), href).toBe(200);
    }
  });

  test("le précédent et le suivant sont déterministes", async ({ page }) => {
    // La 7ᵉ leçon a la 6ᵉ pour précédente et la 8ᵉ pour suivante, toujours.
    await page.goto(LECON);
    const bloc = page.getByRole("navigation", { name: "Voir aussi" });
    const liens = await bloc
      .locator("a")
      .evaluateAll((a) => a.map((l) => l.getAttribute("href") ?? ""));
    expect(liens).toContain("/cours/trainee-induite-et-allongement");
    expect(liens).toContain("/cours/la-polaire-et-la-finesse");
  });
});
