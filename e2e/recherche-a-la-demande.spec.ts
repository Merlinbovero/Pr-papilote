import { expect, test } from "@playwright/test";

/**
 * La recherche à la demande sur les routes PLANCHE — lot M10.
 *
 * Ce qui est vérifié tient en une phrase : l'index ne coûte rien tant qu'on ne
 * s'en sert pas, et il ne coûte qu'une fois quand on s'en sert.
 */
const FICHE = "/eopan/appareils/rafale-m";
const LECON = "/cours/forces-et-lois-de-newton";

function compteur(page: import("@playwright/test").Page) {
  const etat = { index: 0, chunks: 0 };
  page.on("request", (r) => {
    const u = r.url();
    if (u.includes("/recherche-index")) etat.index += 1;
    else if (/\/_next\/static\/chunks\/.*\.js$/.test(u)) etat.chunks += 1;
  });
  return etat;
}

for (const url of [FICHE, LECON]) {
  test(`${url} — aucune requête d'index avant ouverture`, async ({ page }) => {
    const n = compteur(page);
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    expect(n.index, "l'index ne doit pas être chargé au chargement de la page").toBe(0);

    // Et il n'est pas non plus dans le HTML.
    const html = await page.content();
    expect(html).not.toContain("recherche-index");
  });
}

test("une seule requête à la première ouverture, aucune ensuite", async ({ page }) => {
  const n = compteur(page);
  await page.goto(FICHE);
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "Rechercher" }).click();
  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible();
  expect(n.index, "une seule requête d'index").toBe(1);

  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible();
  expect(n.index, "aucune requête supplémentaire").toBe(1);
});

test("ouvertures répétées avant résolution : un seul chargement", async ({ page }) => {
  const n = compteur(page);
  // On ralentit l'index pour ouvrir plusieurs fois pendant le chargement.
  await page.route("**/recherche-index", async (route) => {
    await new Promise((r) => setTimeout(r, 900));
    await route.continue();
  });
  await page.goto(FICHE);
  await page.waitForLoadState("domcontentloaded");

  const lien = page.getByRole("link", { name: "Rechercher" });
  await lien.click();
  await lien.click({ force: true }).catch(() => {});
  await page.keyboard.press("Control+k");
  await page.keyboard.press("Control+k");

  await expect(page.getByPlaceholder(/Appareil, notion/)).toBeVisible({ timeout: 15000 });
  expect(n.index, "la promesse combinée doit dédupliquer").toBe(1);
});

test("le lien reste un lien : Ctrl+clic n’ouvre pas la palette", async ({ page, context }) => {
  await page.goto(FICHE);
  await page.waitForLoadState("networkidle");
  const avant = context.pages().length;
  await page.getByRole("link", { name: "Rechercher" }).click({ modifiers: ["Control"] });
  await page.waitForTimeout(400);
  // La palette ne s'ouvre pas ; le navigateur garde la main.
  await expect(page.getByPlaceholder(/Appareil, notion/)).toHaveCount(0);
  expect(context.pages().length).toBeGreaterThanOrEqual(avant);
});

test("sans JavaScript, le lien mène à /recherche", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(FICHE);
  const href = await page.getByRole("link", { name: "Rechercher" }).getAttribute("href");
  expect(href).toBe("/recherche");
  await ctx.close();
});
