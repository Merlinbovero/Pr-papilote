import { expect, test } from "@playwright/test";

/**
 * Lot M6b — La Planche d'identification.
 *
 * Ce que ce fichier garde, dans l'ordre d'importance :
 *
 *  1. **les ancres publiques** — `#l-essentiel`, `#pieges`, `#sources` et les
 *     identifiants de section existaient avant la migration. Un lecteur a pu
 *     les coller ailleurs ; elles doivent encore atterrir au bon endroit ;
 *  2. **la cote gelée** — celle du référentiel, pas une valeur recalculée ;
 *  3. **ce que le lot n'avait pas le droit de retirer** — la commande
 *     d'impression, le crédit photographique et son lien de source, les
 *     relations, le quiz de notion ;
 *  4. **la frontière du bloc hôte** — NotionQuiz reste intact, et la
 *     typographie PLANCHE s'arrête à son bord ;
 *  5. **la séparation des familles** — une fiche non migrée ne doit porter
 *     aucune marque de La Planche.
 */

const NOTICE = "/eopan/appareils/rafale-m";
/**
 * Une fiche d'une AUTRE famille — Le Dossier. Elle sert de témoin : le gabarit
 * de notice ne doit pas avoir déteint sur elle.
 */
const AUTRE_FAMILLE = "/eopan/missions/la-patrouille-maritime";

/** Quelques cotes gelées (`content/_referentiels/cotes.json`). */
const COTES: [string, string][] = [
  ["/eopan/appareils/rafale-m", "EOPAN · C.6.10"],
  ["/eopan/appareils/atlantique-2", "EOPAN · C.6.01"],
  ["/eopan/ban/hyeres", "EOPAN · C.9.01"],
  ["/eopan/navires/charles-de-gaulle", "EOPAN · C.7.01"],
  ["/eopn/appareils/rafale", "EOPN · C.6.11"],
  ["/eopn/bases/cognac", "EOPN · C.8.01"],
  ["/alat/appareils/tigre", "ALAT · C.6.09"],
  ["/alat/grades/grades-de-l-armee-de-terre", "ALAT · C.13.01"],
  // Lot M7a — les notices d'appareils étrangers, reclassées depuis Le Cahier.
  ["/culture/aviation-mondiale/a-10-thunderbolt-ii", "CULT · C.1.01"],
  ["/culture/aviation-mondiale/f-14-tomcat", "CULT · C.1.02"],
  ["/culture/aviation-mondiale/uh-60-black-hawk", "CULT · C.1.17"],
];

test.describe("La Planche d'identification", () => {
  for (const [url, cote] of COTES) {
    test(`${url} porte sa cote gelée ${cote}`, async ({ page }) => {
      await page.goto(url);
      // Deux fois : au cartouche et dans la marge technique. Les deux lisent
      // la même valeur, celle du référentiel.
      await expect(page.locator(".pl-cart")).toContainText(cote);
    });
  }

  test("les ancres publiques du gabarit historique atterrissent encore", async ({ page }) => {
    await page.goto(NOTICE);
    for (const ancre of ["l-essentiel", "role-et-missions", "pieges", "sources"]) {
      const cible = page.locator(`#${ancre}`);
      await expect(cible, `ancre #${ancre}`).toHaveCount(1);
    }
  });

  test("le sommaire est utilisable sans JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(NOTICE);
    const liens = page.locator(".pl-toc a");
    expect(await liens.count()).toBeGreaterThan(3);
    // Chaque ancre du sommaire vise un élément qui existe dans le document.
    for (const href of await liens.evaluateAll((l) =>
      l.map((a) => (a.getAttribute("href") ?? "").replace("#", ""))
    )) {
      await expect(page.locator(`#${href}`), `cible de #${href}`).toHaveCount(1);
    }
    await ctx.close();
  });

  test("conserve la commande d'impression, retirée par erreur en cours de lot", async ({
    page,
  }) => {
    await page.goto(NOTICE);
    await expect(page.getByRole("button", { name: "Version PDF" })).toBeVisible();
  });

  test("crédite la photographie et lie sa source", async ({ page }) => {
    await page.goto(NOTICE);
    const legende = page.locator(".pl-photo .pl-legende");
    await expect(legende).toContainText("US Navy");
    await expect(legende).toContainText("Domaine public");
    await expect(legende.getByRole("link")).toHaveAttribute("href", /commons\.wikimedia\.org/);
  });

  test("ne recadre ni ne teinte la photographie", async ({ page }) => {
    await page.goto(NOTICE);
    // `.pl-planche` teinte ses images au laboratoire ; une notice n'emploie
    // jamais cette classe. Le filtre calculé doit rester « none ».
    await expect(page.locator(".pl-photo")).toHaveCount(1);
    await expect(page.locator(".pl-planche")).toHaveCount(0);
    const filtre = await page
      .locator(".pl-photo img")
      .first()
      .evaluate((el) => getComputedStyle(el).filter);
    expect(filtre).toBe("none");
  });

  test("monte NotionQuiz intact dans un bloc hôte", async ({ page }) => {
    await page.goto(NOTICE);
    const hote = page.locator(".pl-hote", { has: page.getByRole("button", { name: /Tester/ }) });
    await expect(hote).toHaveCount(1);
    // La typographie du corps s'arrête au bord : le bloc garde sa fonte.
    const fonte = await hote
      .getByRole("button", { name: /Tester/ })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fonte).not.toContain("Spectral");
  });

  test("garde les relations vers les fiches voisines", async ({ page }) => {
    await page.goto(NOTICE);
    const annexe = page.locator(".pl-annexe");
    await expect(annexe.getByRole("link", { name: "Flottille 11F" })).toBeVisible();
  });

  test("une fiche d'une autre famille ne porte pas les marques de la notice", async ({ page }) => {
    // **Réécrit au lot M9b, et c'était nécessaire.** Ce test disait « une fiche
    // NON MIGRÉE ne porte aucune marque de La Planche » et prenait pour témoin
    // une page servie par `FicheTransition`. M9b migre la dernière famille :
    // plus aucune page n'est non migrée, et le témoin lui-même est devenu un
    // Dossier. La prémisse a disparu avec le composant.
    //
    // Ce qu'il faut continuer de garantir n'a pas changé : les familles ne
    // déteignent pas l'une sur l'autre. Le témoin porte donc maintenant les
    // marques communes de PLANCHE — c'est le but de la migration — mais pas
    // celles PROPRES à la notice : ni fiche signalétique, ni cote de famille C.
    await page.goto(AUTRE_FAMILLE);
    await expect(page.locator("#signaletique")).toHaveCount(0);
    const cartouche = await page.locator(".pl-cart").innerText();
    expect(cartouche.split("·")[1]?.trim().split(".")[0]).toBe("A");
  });

  test("chaque module porte son encre, jamais celle d'un autre", async ({ page }) => {
    // La couleur porte un sens : l'encre dit de quel module relève la notice.
    // Une notice servie en gris neutre signalerait une encre non déclarée dans
    // la feuille du système — le défaut que M6b avait trouvé sur EOPN et ALAT.
    const ENCRES: [string, string][] = [
      ["/eopan/appareils/rafale-m", "marine"],
      ["/eopn/appareils/rafale", "air"],
      ["/alat/appareils/tigre", "terre"],
      ["/culture/aviation-mondiale/f-14-tomcat", "sienne"],
    ];
    for (const [url, encre] of ENCRES) {
      await page.goto(url);
      await expect(page.locator(".pl-root"), url).toHaveAttribute("data-module", encre);
      const mod = await page
        .locator(".pl-root")
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--pl-mod").trim());
      // Une encre non déclarée retomberait sur `--pl-encre-2`, un gris.
      expect(mod, `${url} : --pl-mod ne doit pas être le gris neutre`).not.toBe("");
      expect(mod.toLowerCase(), url).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  test("une notice reclassée garde son bloc de spécifications", async ({ page }) => {
    // Les 17 fiches d'aviation mondiale portaient `specs` avant le lot ; le
    // gabarit du Cahier ne les rendait pas en tableau. La fiche signalétique
    // doit désormais les servir, sans qu'aucune valeur ne se perde.
    await page.goto("/culture/aviation-mondiale/f-14-tomcat");
    const table = page.locator("#signaletique").locator("xpath=following::table[1]");
    await expect(table).toContainText("Mach 2,34");
    await expect(table).toContainText("19,55 m (ailes déployées) / 11,65 m (ailes fléchées)");
  });

  test("le corps ne déborde jamais, du mobile au desktop", async ({ page }) => {
    /*
      ────────────────────────────────────────────────────────────────────
      INSTRUMENTATION TEMPORAIRE — À RETIRER APRÈS DIAGNOSTIC.

      Ce contrôle échoue en intégration continue, et seulement là, sur les
      deux projets et après deux reprises :

          page.goto: Test timeout of 30000ms exceeded
          navigating to "…/eopn/grades/grades-de-l-armee-de-l-air",
          waiting until "load"

      Il passe en local, sur machine au repos comme en campagne complète.
      Changer `next dev` pour une compilation de production N'A RIEN CHANGÉ :
      la compilation à la demande n'est donc pas la cause racine.

      Ce qu'il faut établir : laquelle des trois conditions d'une navigation
      n'est pas atteinte — document reçu, DOMContentLoaded, `load` — et ce
      qui la retient. Le découpage `commit` → `domcontentloaded` → `load`
      ci-dessous sert à isoler la phase ; il n'est PAS le correctif.

      Piste principale : la route porte UNE seule image, en `fill`, SANS
      `loading="lazy"` — donc attendue par `load` — servie par
      `/_next/image` et dotée d'un `sizes` responsive. Chaque changement de
      viewport peut donc réclamer une variante différente, optimisée à la
      demande. Mesuré au repos : 0,07 à 0,16 s par largeur. Reste à savoir
      ce que cela devient sous contention du runner.
      ────────────────────────────────────────────────────────────────────
    */
    const ouvertes = new Map<string, { debut: number; type: string; statut?: number }>();
    const dernieres: string[] = [];
    const journal: string[] = [];
    let largeurCourante = 0;

    page.on("request", (r) => ouvertes.set(r.url(), { debut: Date.now(), type: r.resourceType() }));
    page.on("response", (r) => {
      const e = ouvertes.get(r.url());
      if (e) e.statut = r.status();
      dernieres.push(`${r.status()} ${r.request().resourceType()} ${r.url().slice(0, 110)}`);
      if (dernieres.length > 12) dernieres.shift();
    });
    page.on("requestfinished", (r) => ouvertes.delete(r.url()));
    page.on("requestfailed", (r) => ouvertes.delete(r.url()));
    page.on("domcontentloaded", () => journal.push(`[${largeurCourante}] domcontentloaded`));
    page.on("load", () => journal.push(`[${largeurCourante}] load`));
    page.on("console", (m) => {
      if (m.type() === "error")
        journal.push(`[${largeurCourante}] console: ${m.text().slice(0, 120)}`);
    });
    page.on("pageerror", (e) =>
      journal.push(`[${largeurCourante}] pageerror: ${e.message.slice(0, 120)}`)
    );
    page.on("crash", () => journal.push(`[${largeurCourante}] CRASH`));

    async function rapport(phase: string) {
      const readyState = await page
        .evaluate(() => document.readyState)
        .catch(() => "(page.evaluate ne répond plus)");
      const images = await page
        .evaluate(() =>
          [...document.images]
            .filter((i) => !i.complete)
            .map((i) => ({
              currentSrc: i.currentSrc.slice(0, 130),
              loading: i.loading,
              naturalWidth: i.naturalWidth,
            }))
        )
        .catch(() => "(indisponible)");
      const sw = await page
        .evaluate(() => Boolean(navigator.serviceWorker?.controller))
        .catch(() => "(indisponible)");
      console.log(
        [
          `\n═══ DIAGNOSTIC — bloqué en « ${phase} » à ${largeurCourante}px ═══`,
          `readyState        : ${readyState}`,
          `serviceWorker     : ${JSON.stringify(sw)}`,
          `requêtes ouvertes : ${ouvertes.size}`,
          ...[...ouvertes.entries()].map(
            ([u, e]) =>
              `   ${e.type} statut=${e.statut ?? "AUCUN"} depuis ${Date.now() - e.debut}ms — ${u.slice(0, 130)}`
          ),
          `images incomplètes: ${JSON.stringify(images)}`,
          `dernières réponses:`,
          ...dernieres.map((d) => `   ${d}`),
          `journal           :`,
          ...journal.map((j) => `   ${j}`),
          "════════════════════════════════════════════════════════════\n",
        ].join("\n")
      );
    }

    for (const largeur of [390, 834, 1440]) {
      largeurCourante = largeur;
      const t0 = Date.now();
      await page.setViewportSize({ width: largeur, height: 900 });
      journal.push(`[${largeur}] viewport posé en ${Date.now() - t0}ms`);

      try {
        const t1 = Date.now();
        await page.goto("/eopn/grades/grades-de-l-armee-de-l-air", { waitUntil: "commit" });
        journal.push(`[${largeur}] commit en ${Date.now() - t1}ms`);

        const t2 = Date.now();
        await page.waitForLoadState("domcontentloaded", { timeout: 8000 }).catch(async (e) => {
          await rapport("domcontentloaded");
          throw e;
        });
        journal.push(`[${largeur}] domcontentloaded en ${Date.now() - t2}ms`);

        const t3 = Date.now();
        await page.waitForLoadState("load", { timeout: 8000 }).catch(async (e) => {
          await rapport("load");
          throw e;
        });
        journal.push(`[${largeur}] load en ${Date.now() - t3}ms`);
      } catch (e) {
        console.log(`\n[DIAGNOSTIC] échec à ${largeur}px : ${(e as Error).message.slice(0, 200)}`);
        throw e;
      }

      const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(debordement, `débordement à ${largeur}px`).toBe(0);
    }
    console.log(`\n[DIAGNOSTIC] parcours complet :\n   ${journal.join("\n   ")}`);
  });
});
