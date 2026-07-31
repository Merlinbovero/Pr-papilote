import { expect, test, type Page } from "@playwright/test";

/**
 * Lot M3 — coexistence des deux chartes.
 *
 * Ce que ce fichier garde, et que rien d'autre ne garde :
 *  1. la traversée entre `(site)` et `(planche)` reste une **navigation
 *     client** — c'est la raison d'être de la racine commune ;
 *  2. les fontes ne fuient pas d'un groupe à l'autre ;
 *  3. le pansement `body:has(.pl-root)` a bien disparu ;
 *  4. les jetons PLANCHE ne touchent jamais `:root`.
 */

const INDEX = "/bia/aerodynamique-et-principes-du-vol";
const LECON = "/cours/couche-limite-et-decrochage";
const LECON_2 = "/cours/la-polaire-et-la-finesse";

/**
 * Témoin de persistance navigateur.
 *
 * Le jeton est réécrit à **chaque analyse de document**. S'il survit à une
 * navigation, le document n'a pas été rechargé : c'était une navigation
 * client. Il vit dans le harnais de test et non dans le bundle — un
 * diagnostic n'a rien à faire dans les pages publiées, et `addInitScript` a
 * exactement la même sémantique.
 */
async function poserTemoin(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __ppDoc: string }).__ppDoc = Math.random().toString(36).slice(2);
  });
}

function lireTemoin(page: Page) {
  return page.evaluate(() => (window as unknown as { __ppDoc: string }).__ppDoc);
}

test.describe("coexistence (site) ↔ (planche)", () => {
  test("les quatre parcours restent en navigation client", async ({ page }) => {
    await poserTemoin(page);
    await page.goto(INDEX);
    const depart = await lireTemoin(page);

    // 1. ancienne DA → PLANCHE
    await page
      .getByRole("link", { name: /la couche limite et le décrochage/i })
      .first()
      .click();
    await page.waitForURL(`**${LECON}`);
    expect(await lireTemoin(page)).toBe(depart);

    // 2. PLANCHE → ancienne DA
    await page.getByRole("link", { name: "Retour à la matière BIA" }).click();
    await page.waitForURL(`**${INDEX}`);
    expect(await lireTemoin(page)).toBe(depart);

    // 3. retour arrière
    await page.goBack();
    await page.waitForURL(`**${LECON}`);
    expect(await lireTemoin(page)).toBe(depart);

    // 4. PLANCHE → PLANCHE
    await page
      .getByRole("link", { name: /la polaire et la finesse/i })
      .first()
      .click();
    await page.waitForURL(`**${LECON_2}`);
    expect(await lireTemoin(page)).toBe(depart);
  });

  test("le thème choisi sur une route historique survit à la traversée", async ({ page }) => {
    await page.goto(INDEX);
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.goto(LECON);
    await expect(page.locator("html")).toHaveClass(/dark/);
    // Le registre sombre PLANCHE est bien celui qui s'applique.
    const fond = await page
      .locator(".pl-root")
      .first()
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--pl-fond").trim());
    expect(fond).toBe("#10141a");
  });
});

test.describe("isolation typographique", () => {
  test("la leçon ne charge ni Geist ni Archivo", async ({ page }) => {
    const fontes: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "font") fontes.push(r.url());
    });
    await page.goto(LECON);
    await page.evaluate(() => document.fonts.ready);
    expect(fontes.length).toBeGreaterThan(0);
    // Les fichiers PLANCHE portent leur nom de source ; ceux de next/font/google
    // sont nommés par empreinte. Aucun fichier non PLANCHE ne doit apparaître.
    for (const url of fontes) {
      expect(url).toMatch(/(spectral|fira[_-]sans|fira[_-]mono)/i);
    }
  });

  test("une route historique ne charge aucune fonte PLANCHE", async ({ page }) => {
    const fontes: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "font") fontes.push(r.url());
    });
    await page.goto(INDEX);
    await page.evaluate(() => document.fonts.ready);
    for (const url of fontes) {
      expect(url).not.toMatch(/(spectral|fira[_-]sans|fira[_-]mono)/i);
    }
  });

  test("les règles typographiques historiques ne portent plus sur PLANCHE", async ({ page }) => {
    await page.goto(LECON);
    await page.evaluate(() => document.fonts.ready);
    // Le titre de la leçon est en Spectral, pas en Archivo ni en Geist.
    // `next/font/local` nomme la famille d'après la variable exportée.
    const famille = await page
      .locator("h1.pl-titre")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(famille).toMatch(/plancheSerif/i);
    expect(famille).not.toMatch(/Archivo|Geist/i);
    // La portée historique n'existe pas sur cette route.
    await expect(page.locator(".site-root")).toHaveCount(0);
  });

  test("les routes historiques gardent leur portée `.site-root`", async ({ page }) => {
    await page.goto(INDEX);
    await expect(page.locator(".site-root")).toHaveCount(1);
    await expect(page.locator(".pl-root")).toHaveCount(0);
  });
});

test.describe("gabarit PLANCHE en production", () => {
  test("le pansement body:has(.pl-root) a disparu : bandeau et pied sont rendus", async ({
    page,
  }) => {
    await page.goto(LECON);
    // Aucun `header`/`footer` de la charte historique n'est monté…
    await expect(page.locator(".site-root")).toHaveCount(0);
    // …et le chrome PLANCHE, lui, est bien visible.
    await expect(page.locator(".pl-top")).toBeVisible();
    await expect(page.locator(".pl-foot")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mentions légales" })).toBeVisible();
  });

  test("la recherche reste accessible par un lien, sans son index", async ({ page }) => {
    const reponse = await page.goto(LECON);
    const html = (await reponse?.text()) ?? "";
    await expect(page.getByRole("link", { name: "Rechercher" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Rechercher" })).toHaveAttribute(
      "href",
      "/recherche"
    );
    // L'index sérialisé de la palette pèse 431 kB par page : il ne doit
    // jamais revenir par un import de `buildSearchEntries` dans le bandeau.
    // 200 kB laisse la marge d'une leçon longue, très loin des 516 kB d'avant.
    expect(html.length).toBeLessThan(200_000);
  });

  test("les jetons PLANCHE ne touchent jamais `:root`", async ({ page }) => {
    await page.goto(LECON);
    const surRacine = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--pl-fond").trim()
    );
    expect(surRacine).toBe("");
  });

  test("le marginMode est déclaré par la page, pas déduit du DOM", async ({ page }) => {
    await page.goto(LECON);
    await expect(page.locator(".pl-univers > .pl-root")).toHaveAttribute("data-marge", "wide");
  });

  test("la leçon garde son plan de titres et son contenu", async ({ page }) => {
    await page.goto(LECON);
    await expect(
      page.getByRole("heading", { level: 1, name: /la couche limite et le décrochage/i })
    ).toBeVisible();
    for (const titre of ["Objectifs", "Prérequis", "Fiches à étudier", "Exercices guidés"]) {
      await expect(page.getByRole("heading", { name: titre })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: /essentiel à retenir/i })).toBeVisible();
    // La progression et le quiz continuent de fonctionner sous le nouveau gabarit.
    await expect(page.getByText("Ma progression", { exact: true })).toBeVisible();
  });

  test("sur pointeur grossier, toute cible du chrome atteint 44 px", async ({ page, isMobile }) => {
    test.skip(!isMobile, "réservé aux projets tactiles");
    await page.goto(LECON);
    await page.evaluate(() => document.fonts.ready);
    // Le bandeau, le pied de page et la bascule de registre sont neufs : ils
    // n'étaient couverts par aucun test du prototype.
    const trop = await page.evaluate(() =>
      [...document.querySelectorAll(".pl-top a, .pl-registre button, .pl-foot a")]
        .map((el) => ({
          nom: `${el.tagName}.${String(el.className).split(" ")[0] || "—"}`,
          h: Math.round(el.getBoundingClientRect().height),
        }))
        .filter((c) => c.h > 0 && c.h < 44)
        .map((c) => `${c.nom} ${c.h}px`)
    );
    expect(trop).toEqual([]);
  });

  test("aucun débordement horizontal sur les trois largeurs", async ({ page }) => {
    for (const width of [390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(LECON);
      await page.evaluate(() => document.fonts.ready);
      const depassement = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(depassement, `largeur ${width}`).toBeLessThanOrEqual(0);
    }
  });
});
