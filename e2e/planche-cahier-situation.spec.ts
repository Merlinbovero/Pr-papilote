import { expect, test } from "@playwright/test";

/**
 * Lot M7b — Le Cahier et La Situation.
 *
 * Deux familles, deux jeux de garanties, tenus séparément.
 *
 * Pour **Le Cahier**, ce qui compte est ce que le lot **n'a pas fabriqué** :
 * aucune chronologie déduite de la prose, aucun bloc de citation extrait du
 * corps. Les motifs existent au manifeste, aucun champ canonique ne les porte,
 * et les inventer aurait été le vrai risque de cette famille.
 *
 * Pour **La Situation**, ce qui compte est le contraire : une section
 * obligatoire qu'aucun contenu ne peut faire disparaître, et un libellé de date
 * qui ne surpromet pas.
 */

const CAHIER = "/culture/personnalites/helene-boucher";
const CAHIER_HORS_CULTURE = "/eopan/histoire/histoire-de-l-aeronautique-navale";
const SITUATION = "/culture/geopolitique-defense/red-flag";

test.describe("Le Cahier", () => {
  test("porte sa cote gelée et la famille déclarée", async ({ page }) => {
    await page.goto(CAHIER);
    await expect(page.locator(".pl-cart")).toContainText("CULT · D.4.03");
    await expect(page.locator(".pl-root")).toHaveAttribute("data-famille", "cahier");
  });

  test("porte l’encre de sa FAMILLE, pas celle du module hôte", async ({ page }) => {
    // Une histoire de l'Aéronautique navale vit dans le module EOPAN et reste
    // sienne : l'encre dit le fonds documentaire, pas l'étagère. La première
    // version du composant appliquait la règle de la notice — quatre encres
    // différentes là où il n'en fallait qu'une.
    for (const url of [CAHIER, CAHIER_HORS_CULTURE]) {
      await page.goto(url);
      await expect(page.locator(".pl-root"), url).toHaveAttribute("data-module", "sienne");
    }
  });

  test("ouvre sur une lettrine, et une seule", async ({ page }) => {
    await page.goto(CAHIER);
    await expect(page.locator(".pl-ouverture")).toHaveCount(1);
  });

  test("la lettrine ne retire aucun caractère au texte", async ({ page }) => {
    // Elle est posée par `::first-letter`. Découper la chaîne pour isoler la
    // lettre aurait été un changement de contenu déguisé en ornement : le
    // premier mot doit rester entier dans le texte rendu.
    await page.goto(CAHIER);
    const premier = await page.locator(".pl-ouverture p").first().innerText();
    expect(premier.startsWith("Hélène Boucher")).toBe(true);
  });

  test("n’invente ni chronologie ni citation", async ({ page }) => {
    await page.goto(CAHIER);
    // Aucun champ canonique ne porte de chronologie : l'annexe n'en affiche
    // pas. Le seul bloc `.pl-chrono` est l'historique de révision, qui est une
    // donnée réelle du contenu.
    const chrono = page.locator(".pl-annexe .pl-chrono");
    expect(await chrono.count()).toBeGreaterThan(0);
    await expect(page.locator(".pl-annexe")).toContainText("Historique");
    await expect(page.locator(".pl-annexe")).not.toContainText("Chronologie");
    // Aucun bloc de citation fabriqué à partir du corps.
    await expect(page.locator("blockquote")).toHaveCount(0);
  });

  test("garde le tableau « Repères » tel que le contenu l’a écrit", async ({ page }) => {
    await page.goto(CAHIER);
    const table = page.locator("#reperes").locator("xpath=following::table[1]");
    await expect(table).toContainText("23 mai 1908, Paris");
    await expect(table).toContainText("Caudron Rafale");
  });

  test("crédite la photographie et lie sa source", async ({ page }) => {
    await page.goto(CAHIER);
    const legende = page.locator(".pl-photo .pl-legende");
    await expect(legende).toContainText("Domaine public");
    await expect(legende.getByRole("link")).toHaveAttribute("href", /commons\.wikimedia\.org/);
  });

  test("ne porte pas de fiche signalétique : ce n’est pas une notice", async ({ page }) => {
    await page.goto(CAHIER);
    await expect(page.locator("#signaletique")).toHaveCount(0);
  });
});

test.describe("La Situation", () => {
  const TOUTES = [
    ["/culture/geopolitique-defense/grandes-dates-aviation-militaire-francaise", "CULT · E.2.01"],
    ["/culture/geopolitique-defense/operations-exterieures-recentes", "CULT · E.2.02"],
    ["/culture/geopolitique-defense/organisation-de-la-defense-francaise", "CULT · E.2.03"],
    ["/culture/geopolitique-defense/red-flag", "CULT · E.2.04"],
  ] as const;

  for (const [url, cote] of TOUTES) {
    test(`${url} — cote, bandeau documentaire et section obligatoire`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator(".pl-cart")).toContainText(cote);
      await expect(page.locator(".pl-root")).toHaveAttribute("data-famille", "situation");

      // Le bandeau, au-dessus du chapô — il ne descend jamais.
      const bandeau = page.locator(".pl-arrete");
      await expect(bandeau).toHaveCount(1);
      await expect(bandeau).toContainText(/Informations vérifiées au/i);
      const chapoApres = await page.evaluate(() => {
        const a = document.querySelector(".pl-arrete");
        const c = document.querySelector(".pl-chapo");
        return Boolean(a && c && a.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(chapoApres, "le bandeau doit précéder le chapô").toBe(true);

      // La section obligatoire, de plein rang — jamais reléguée en note.
      await expect(page.locator("#ce-qui-reste-incertain")).toHaveCount(1);
      await expect(page.locator("#ce-qui-reste-incertain .pl-sec-n")).toHaveCount(1);
      await expect(page.locator(".pl-toc")).toContainText("Ce qui reste incertain");
    });
  }

  test("n’écrit jamais « arrêté au » : ce n’est pas ce que la donnée dit", async ({ page }) => {
    // `verifiedAt` est la date de dernière vérification des faits, pas une date
    // d'arrêt éditorial. Écrire « arrêté au » ferait passer l'une pour l'autre.
    for (const [url] of TOUTES) {
      await page.goto(url);
      const corps = (await page.locator(".pl-corps").innerText()).toLowerCase();
      expect(corps, `${url} ne doit pas simuler une date d'arrêt`).not.toContain("arrêté au");
      const annexe = (await page.locator(".pl-annexe").innerText()).toLowerCase();
      expect(annexe).toContain("ne vaut pas date d’arrêt éditorial");
    }
  });

  test("la formulation de repli parle de la documentation, pas du sujet", async ({ page }) => {
    // Elle ne doit surtout pas laisser entendre qu'il n'y a pas d'incertitude :
    // elle dit qu'aucune n'est documentée dans cette version.
    await page.goto(SITUATION);
    const bloc = page.locator(".pl-incertain");
    await expect(bloc).toContainText("n’est explicitement documenté dans cette version");
    await expect(bloc).toContainText("elle ne signifie pas que tout est établi");
  });
});
