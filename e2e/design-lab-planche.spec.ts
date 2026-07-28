import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Prototype PLANCHE — vérifications de non-régression.
 *
 * Ces tests ne s'exécutent que si le drapeau est levé côté serveur. Ils
 * couvrent ce qui ne se voit pas dans une capture : l'isolation des jetons,
 * l'absence de débordement, la navigation clavier, le focus visible et le
 * dépouillement réel de la session.
 */

const ECRANS = [
  { nom: "lecon", chemin: "/design-lab/planche/lecon", marge: "wide" },
  { nom: "appareil", chemin: "/design-lab/planche/appareil", marge: "rail" },
  { nom: "banc", chemin: "/design-lab/planche/banc", marge: "none" },
] as const;

const VUES = [
  { nom: "desktop", width: 1512, height: 1000 },
  { nom: "tablette", width: 834, height: 1112 },
  { nom: "mobile", width: 390, height: 844 },
] as const;

test.describe("Prototype PLANCHE", () => {
  test("les jetons de production ne sont pas remplacés", async ({ page }) => {
    await page.goto("/design-lab/planche/lecon");
    const fuite = await page.evaluate(() => {
      const racine = getComputedStyle(document.documentElement);
      // Aucun jeton `--pl-*` ne doit exister sur :root — ils vivent sous
      // `.pl-root`. Si l'un remonte, l'isolation est rompue.
      return ["--pl-fond", "--pl-encre", "--pl-serif", "--pl-marge"].filter(
        (jeton) => racine.getPropertyValue(jeton).trim() !== ""
      );
    });
    expect(fuite).toEqual([]);
  });

  test("le marginMode est déclaré dans le DOM, pas déduit", async ({ page }) => {
    for (const ecran of ECRANS) {
      await page.goto(ecran.chemin);
      await expect(page.locator(".pl-root")).toHaveAttribute("data-marge", ecran.marge);
    }
  });

  for (const ecran of ECRANS) {
    for (const vue of VUES) {
      test(`${ecran.nom} — ${vue.nom} : aucun débordement horizontal`, async ({ page }) => {
        await page.setViewportSize({ width: vue.width, height: vue.height });
        await page.goto(ecran.chemin);
        await page.evaluate(() => document.fonts.ready);
        const debordement = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(debordement).toBe(0);
      });
    }

    test(`${ecran.nom} — aucune violation d'accessibilité détectable`, async ({ page }) => {
      await page.goto(ecran.chemin);
      const resultats = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(resultats.violations).toEqual([]);
    });
  }

  test("les petites capitales sont réelles, jamais synthétisées", async ({ page }) => {
    await page.goto("/design-lab/planche/lecon");
    await page.evaluate(() => document.fonts.ready);
    const mesure = await page.evaluate(() => {
      const sonde = document.createElement("span");
      sonde.textContent = "definition";
      sonde.style.cssText =
        "font-family:'Planche Spectral';font-size:48px;position:absolute;visibility:hidden";
      document.body.appendChild(sonde);
      const normal = sonde.getBoundingClientRect().width;
      sonde.style.fontVariantCaps = "small-caps";
      const petites = sonde.getBoundingClientRect().width;
      document.body.removeChild(sonde);
      return { normal, petites };
    });
    // Une synthèse par le navigateur redimensionne les capitales sans changer
    // les chasses : la largeur bougerait à peine. Un vrai jeu `smcp` a ses
    // propres dessins, donc une largeur nettement différente.
    expect(Math.abs(mesure.petites - mesure.normal)).toBeGreaterThan(mesure.normal * 0.05);
  });

  test("Le Banc — la session se joue et se corrige au clavier seul", async ({ page }) => {
    await page.goto("/design-lab/planche/banc");
    await page.getByRole("button", { name: "Commencer" }).click();

    // Le dépouillement est total : plus de bandeau, de marge, d'annexe ni de
    // cartouche tant que la session dure.
    await expect(page.locator(".pl-top")).toHaveCount(0);
    await expect(page.locator(".pl-marge")).toHaveCount(0);
    await expect(page.locator(".pl-annexe")).toHaveCount(0);
    await expect(page.locator(".pl-cart")).toHaveCount(0);

    // Le focus est déjà sur la première proposition : aucune tabulation
    // n'est nécessaire pour commencer à répondre.
    await expect(page.locator(".pl-opt").first()).toBeFocused();

    // Le chronomètre décompte sans changer de couleur ni s'alarmer.
    const chrono = page.locator(".pl-banc-h span").nth(1);
    await expect(chrono).toHaveText(/^0[78]:\d\d$/);

    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press(["a", "b", "c", "d"][i % 4]);
    }

    await expect(page.getByRole("heading", { name: "Résultat" })).toBeVisible();
    // La correction montre les deux pièces côte à côte, et la couleur double
    // le libellé au lieu de le remplacer.
    const comparaisons = page.locator(".pl-cmp");
    if ((await comparaisons.count()) > 0) {
      await expect(comparaisons.first().getByText("Votre réponse")).toBeVisible();
      await expect(comparaisons.first().getByText("Réponse attendue")).toBeVisible();
    }
  });

  test("le focus clavier reste visible", async ({ page }) => {
    await page.goto("/design-lab/planche/banc");
    await page.keyboard.press("Tab");
    const contour = await page.evaluate(() => {
      const actif = document.activeElement;
      if (!actif) return null;
      const style = getComputedStyle(actif);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(contour).not.toBeNull();
    expect(contour?.style).not.toBe("none");
    expect(Number.parseFloat(contour?.width ?? "0")).toBeGreaterThanOrEqual(2);
  });

  test("la donnée inconnue s'écrit « — » et jamais autrement", async ({ page }) => {
    await page.goto("/design-lab/planche/appareil");
    const vides = page.locator(".pl-vide");
    expect(await vides.count()).toBeGreaterThan(0);
    for (const cellule of await vides.all()) {
      await expect(cellule).toHaveText("—");
    }
    await expect(page.getByText("N/A")).toHaveCount(0);
  });

  test("la silhouette est annoncée comme un démonstrateur, jamais comme le Rafale M", async ({
    page,
  }) => {
    await page.goto("/design-lab/planche/appareil");
    const legende = page.getByText("Silhouette générique — démonstrateur visuel.");
    await expect(legende).toBeVisible();
    await expect(page.getByText("ne représente pas le Rafale M")).toBeVisible();
  });
});

/**
 * Pointeur grossier — arbitrages du 2026-07-28.
 *
 * Le projet `mobile` de `playwright.config.ts` (Pixel 7) fournit déjà un
 * pointeur grossier ; ces tests ne s'exécutent que là.
 */
test.describe("Pointeur grossier", () => {
  test.skip(({ isMobile }) => !isMobile, "réservé aux projets tactiles");

  for (const ecran of ECRANS) {
    test(`${ecran.nom} — toute cible tactile atteint 44 px, sans chevauchement`, async ({
      page,
    }) => {
      await page.goto(ecran.chemin);
      await page.evaluate(() => document.fonts.ready);

      const bilan = await page.evaluate(() => {
        const cibles = [
          ...document.querySelectorAll(
            ".pl-root a, .pl-root button, .pl-root .pl-radio, .pl-root .pl-opt"
          ),
        ]
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              nom: `${el.tagName}.${String(el.className).split(" ")[0] || "—"}`,
              h: Math.round(r.height),
              top: r.top,
              bottom: r.bottom,
              left: r.left,
              right: r.right,
            };
          })
          .filter((r) => r.h > 0 && r.right > r.left);

        let chevauchements = 0;
        for (let i = 0; i < cibles.length; i += 1) {
          for (let j = i + 1; j < cibles.length; j += 1) {
            const a = cibles[i];
            const b = cibles[j];
            if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
              chevauchements += 1;
            }
          }
        }
        return {
          trop: cibles.filter((c) => c.h < 44).map((c) => `${c.nom} ${c.h}px`),
          chevauchements,
        };
      });

      expect(bilan.trop).toEqual([]);
      expect(bilan.chevauchements).toBe(0);
    });
  }

  test("les métadonnées ne descendent pas sous 12,5 px sur téléphone", async ({ page }) => {
    await page.goto("/design-lab/planche/lecon");
    await page.evaluate(() => document.fonts.ready);
    const tailles = await page.evaluate(() =>
      [".pl-cote", ".pl-cart", ".pl-legende", ".pl-pied", ".pl-an-note"]
        .map((s) => {
          const el = document.querySelector(s);
          return el ? { s, px: Number.parseFloat(getComputedStyle(el).fontSize) } : null;
        })
        .filter((x): x is { s: string; px: number } => x !== null)
    );
    expect(tailles.length).toBeGreaterThan(0);
    for (const { s, px } of tailles) {
      expect(px, s).toBeGreaterThanOrEqual(12.5);
    }
  });

  test("la justure descend sous 66 signes sans que le corps soit réduit", async ({ page }) => {
    await page.goto("/design-lab/planche/lecon");
    await page.evaluate(() => document.fonts.ready);
    const mesure = await page.evaluate(() => {
      const p = document.querySelector(".pl-corps p") as HTMLElement;
      const sonde = document.createElement("span");
      sonde.textContent = "0";
      sonde.style.cssText = `font:${getComputedStyle(p).font};visibility:hidden;position:absolute`;
      document.body.appendChild(sonde);
      const largeurSigne = sonde.getBoundingClientRect().width;
      document.body.removeChild(sonde);
      return {
        signes: Math.round(p.getBoundingClientRect().width / largeurSigne),
        corps: Number.parseFloat(getComputedStyle(p).fontSize),
      };
    });
    // Doctrine : sur écran étroit, la taille prime sur le compte de signes.
    // Le corps ne doit JAMAIS être réduit pour atteindre la justure cible.
    expect(mesure.corps).toBeGreaterThanOrEqual(15.5);
    expect(mesure.signes).toBeLessThan(66);
  });
});
