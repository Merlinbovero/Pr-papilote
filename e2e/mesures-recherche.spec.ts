import { expect, test } from "@playwright/test";

/**
 * Banc de mesure de la recherche à la demande — lot M10.
 *
 * Chaque phase est chronométrée séparément dans la page, avec `performance.now`,
 * plutôt que déduite d'un total : téléchargement, analyse JSON, validation,
 * import du module, puis affichage des premiers résultats. Un total unique
 * n'aurait pas dit où passe le temps.
 */
const ROUTES = [
  ["accueil", "/"],
  ["hub", "/eopan"],
  ["fiche", "/eopan/appareils/rafale-m"],
  ["leçon", "/cours/forces-et-lois-de-newton"],
] as const;

test("mesures — poids initial et requêtes avant ouverture", async ({ page }, info) => {
  const lignes: string[] = [];
  for (const [nom, url] of ROUTES) {
    let requetesIndex = 0;
    let requetes = 0;
    const onReq = (r: import("@playwright/test").Request) => {
      requetes += 1;
      if (r.url().includes("recherche-index")) requetesIndex += 1;
    };
    page.on("request", onReq);
    const reponse = await page.goto(url);
    await page.waitForLoadState("networkidle");
    const html = (await reponse!.text()).length;
    const js = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((r) => r.name.endsWith(".js"))
        .reduce((n, r) => n + ((r as PerformanceResourceTiming).transferSize || 0), 0)
    );
    page.off("request", onReq);
    lignes.push(
      `${nom.padEnd(8)} HTML ${(html / 1024).toFixed(0)} Ko · JS transféré ${(js / 1024).toFixed(0)} Ko · requêtes ${requetes} · requêtes index ${requetesIndex}`
    );
    expect(requetesIndex, `${nom} : aucune requête d'index avant ouverture`).toBe(0);
  }
  await info.attach("poids-initial", { body: lignes.join("\n"), contentType: "text/plain" });
  console.log("\n" + lignes.join("\n"));
});

test("mesures — phases de la première ouverture, cache froid", async ({ page }, info) => {
  await page.goto("/eopan/appareils/rafale-m");
  await page.waitForLoadState("networkidle");

  const m = await page.evaluate(async () => {
    const t0 = performance.now();
    const rep = await fetch("/generated/recherche-index.json", { cache: "reload" });
    const texte = await rep.text();
    const t1 = performance.now();
    const donnees = JSON.parse(texte);
    const t2 = performance.now();
    // Validation : même forme que le schéma partagé, mesurée séparément.
    const ok =
      donnees.schema === 1 &&
      Array.isArray(donnees.entries) &&
      donnees.entries.every(
        (e: Record<string, unknown>) =>
          typeof e.id === "string" && typeof e.title === "string" && typeof e.url === "string"
      );
    const t3 = performance.now();
    const ressource = performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("recherche-index"))
      .at(-1) as PerformanceResourceTiming | undefined;
    return {
      ok,
      entrees: donnees.entries.length,
      brut: texte.length,
      transfere: ressource?.transferSize ?? 0,
      telechargement: t1 - t0,
      parsing: t2 - t1,
      validation: t3 - t2,
    };
  });
  expect(m.ok).toBe(true);

  // Import du module de palette et premiers résultats, mesurés sur l'interface.
  const t0 = Date.now();
  await page.getByRole("link", { name: "Rechercher" }).click();
  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible();
  const ouverture = Date.now() - t0;
  const t1 = Date.now();
  await page.getByPlaceholder(/Appareil, notion/).fill("catobar");
  await expect(page.getByRole("option", { name: /CATOBAR/ }).first()).toBeVisible();
  const premiersResultats = Date.now() - t1;

  const rapport = [
    `entrées ${m.entrees} · brut ${(m.brut / 1024).toFixed(0)} Ko · transféré ${(m.transfere / 1024).toFixed(0)} Ko`,
    `téléchargement ${m.telechargement.toFixed(0)} ms`,
    `parsing JSON ${m.parsing.toFixed(1)} ms`,
    `validation ${m.validation.toFixed(1)} ms`,
    `ouverture (import + fetch + rendu) ${ouverture} ms`,
    `premiers résultats après saisie ${premiersResultats} ms`,
  ].join("\n");
  await info.attach("phases", { body: rapport, contentType: "text/plain" });
  console.log("\n" + rapport);
});

test("mesures — cache chaud, 304, seconde ouverture", async ({ page }, info) => {
  await page.goto("/eopan/appareils/rafale-m");
  await page.waitForLoadState("networkidle");

  const froid = await page.evaluate(async () => {
    const t = performance.now();
    await (await fetch("/generated/recherche-index.json", { cache: "reload" })).text();
    return performance.now() - t;
  });
  const chaud = await page.evaluate(async () => {
    const t = performance.now();
    const r = await fetch("/generated/recherche-index.json");
    await r.text();
    return { ms: performance.now() - t, statut: r.status };
  });

  // Seconde ouverture dans la même session : aucune requête ne doit partir.
  let apres = 0;
  page.on("request", (r) => {
    if (r.url().includes("recherche-index")) apres += 1;
  });
  await page.getByRole("link", { name: "Rechercher" }).click();
  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible();
  const premiere = apres;
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible();

  expect(apres, "aucune requête à la seconde ouverture").toBe(premiere);

  const rapport = `cache froid ${froid.toFixed(0)} ms · cache chaud ${chaud.ms.toFixed(0)} ms (HTTP ${chaud.statut}) · requêtes 1re ouverture ${premiere} · 2e ouverture +0`;
  await info.attach("cache", { body: rapport, contentType: "text/plain" });
  console.log("\n" + rapport);
});

test("mesures — échec réseau puis nouvelle tentative", async ({ page }) => {
  await page.goto("/eopan/appareils/rafale-m");
  await page.waitForLoadState("networkidle");

  // Premier essai : l'artefact est injoignable.
  await page.route("**/generated/recherche-index.json", (r) => r.abort());
  await page.getByRole("link", { name: "Rechercher" }).click();
  // `getByRole("alert")` attrape aussi l'annonceur de route de Next : on vise
  // le bloc d'erreur de la palette, pas l'outillage du framework.
  const alerte = page.locator(".pl-recherche-erreur");
  await expect(alerte).toContainText(/n’a pas pu être chargée/);
  await expect(alerte.getByRole("link")).toHaveAttribute("href", "/recherche");

  // Second essai : le réseau revient, la promesse ayant été libérée.
  await page.unroute("**/generated/recherche-index.json");
  await page.getByRole("link", { name: "Rechercher" }).first().click();
  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible();
});
