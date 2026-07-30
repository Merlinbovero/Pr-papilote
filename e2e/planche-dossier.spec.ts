import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import yaml from "yaml";

/**
 * Contrôle permanent des 23 Dossiers de concours — lot M9b.
 *
 * Ce fichier vit dans un **commit séparé** de la migration : un `git revert` du
 * lot ne doit pas emporter le contrôle qui le surveille.
 *
 * Le corpus est lu au contenu, jamais listé à la main — une vingt-quatrième
 * fiche de concours entrerait automatiquement sous contrôle.
 */

const RACINE = path.join(process.cwd(), "content");

const CATEGORIES = [
  "alat/missions",
  "alat/presentation",
  "eopan/concepts",
  "eopan/missions",
  "eopan/presentation",
  "eopan/procedures",
  "eopan/selection",
  "eopn/missions",
  "eopn/presentation",
  "eopn/selection",
];

interface FicheBrute {
  id: string;
  slug: string;
  module: string;
  category: string;
  title: string;
  summary: string;
  image?: { author: string; license: string };
  sources: { title: string }[];
  content: {
    essentiel: { aRetenir: string[] };
    sections: { id: string; title: string }[];
    pieges: string[];
  };
}

const DOSSIERS = CATEGORIES.flatMap((cat) =>
  readdirSync(path.join(RACINE, cat))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => yaml.parse(readFileSync(path.join(RACINE, cat, f), "utf-8")) as FicheBrute)
);

const REFERENTIELS = JSON.parse(
  readFileSync(path.join(RACINE, "_referentiels", "cotes.json"), "utf-8")
).fiches as Record<string, string>;

const NATURES = JSON.parse(
  readFileSync(path.join(RACINE, "_referentiels", "archetypes.json"), "utf-8")
).naturesDossier as Record<string, string>;

test.describe("Le Dossier — les 23 fiches de concours", () => {
  test("le corpus contrôlé est complet", () => {
    expect(DOSSIERS).toHaveLength(23);
    expect(Object.keys(NATURES)).toHaveLength(10);
  });

  for (const fiche of DOSSIERS) {
    const url = `/${fiche.module}/${fiche.category}/${fiche.slug}`;

    test(`${fiche.module}/${fiche.slug} — cote, nature, encre, contenu, ancres`, async ({
      page,
    }) => {
      const reponse = await page.goto(url);
      expect(reponse?.status(), "statut HTTP").toBe(200);

      // La cote vient du référentiel gelé, et porte la lettre A.
      const cote = REFERENTIELS[fiche.id];
      expect(cote, `cote absente pour ${fiche.id}`).toBeTruthy();
      await expect(page.locator(".pl-cart")).toContainText(cote);
      expect(cote).toMatch(/^(EOPAN|EOPN|ALAT) · A\.\d{1,2}\.\d{2}$/);

      // La nature vient du référentiel, jamais d'une troncature du nom.
      const nature = NATURES[`${fiche.module}/${fiche.category}`];
      expect(nature, `nature absente pour ${fiche.module}/${fiche.category}`).toBeTruthy();
      await expect(page.locator(".pl-sur")).toContainText(nature);

      // L'encre de FAMILLE, la même pour les 23 — jamais celle du module.
      const racine = page.locator(".pl-root");
      await expect(racine).toHaveAttribute("data-module", "indigo");
      await expect(racine).toHaveAttribute("data-famille", "dossier");

      // Le contenu canonique survit intégralement.
      const corps = (await page.locator(".pl-corps").innerText()).replace(/\s+/g, " ");
      expect(corps, "titre").toContain(fiche.title);
      expect(corps, "chapô").toContain(fiche.summary.replace(/\s+/g, " "));
      for (const point of fiche.content.essentiel.aRetenir) {
        expect(corps, "à retenir").toContain(point.replace(/\s+/g, " "));
      }
      for (const piege of fiche.content.pieges) {
        expect(corps, "piège").toContain(piege.replace(/\s+/g, " "));
      }
      for (const source of fiche.sources) {
        expect(corps, "source").toContain(source.title.replace(/\s+/g, " "));
      }
      if (fiche.image) {
        expect(corps, "crédit photo").toContain(fiche.image.author);
        expect(corps, "licence photo").toContain(fiche.image.license);
      }

      // Chaque section rédigée porte son ancre, et le sommaire y mène.
      for (const section of fiche.content.sections) {
        // Sélecteur d'attribut : pas d'échappement à faire, et `CSS.escape`
        // n'existe pas dans le contexte Node du test.
        await expect(page.locator(`[id="${section.id}"]`), section.id).toHaveCount(1);
      }

      // Aucun identifiant HTML dupliqué : le sommaire sans JavaScript en dépend.
      const doublons = await page.evaluate(() => {
        const vus = new Set<string>();
        const doubles: string[] = [];
        for (const el of document.querySelectorAll("[id]")) {
          if (vus.has(el.id)) doubles.push(el.id);
          vus.add(el.id);
        }
        return doubles;
      });
      expect(doublons, "identifiants dupliqués").toEqual([]);

      const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(debordement, "débordement horizontal").toBe(0);
    });
  }

  test("les 86 questions de quiz sont toutes servies", async ({ page }) => {
    // Le vivier est la fonction la plus facile à perdre en changeant de
    // gabarit : elle ne laisse aucune trace dans le texte. On compte.
    let total = 0;
    for (const fiche of DOSSIERS) {
      await page.goto(`/${fiche.module}/${fiche.category}/${fiche.slug}`);
      const bloc = page.locator(".pl-hote").filter({ hasText: /tester/i });
      await expect(bloc, `${fiche.slug} doit porter son quiz`).toHaveCount(1);
      total += 1;
    }
    expect(total, "les 23 dossiers portent un quiz").toBe(23);
  });

  test("aucune fonte du site n’est chargée sur un Dossier", async ({ page }) => {
    // La preuve doit être RÉSEAU. Les fichiers `next/font` portent des noms
    // hachés où « Geist » n'apparaît pas : un contrôle par nom de fichier
    // conclurait « aucune Geist » et se tromperait. On lit les familles dans
    // les règles `@font-face` effectivement appliquées.
    await page.goto(`/${DOSSIERS[0].module}/${DOSSIERS[0].category}/${DOSSIERS[0].slug}`);
    const familles = await page.evaluate(() => {
      const noms: string[] = [];
      for (const feuille of Array.from(document.styleSheets)) {
        let regles: CSSRuleList;
        try {
          regles = feuille.cssRules;
        } catch {
          continue;
        }
        for (const regle of Array.from(regles)) {
          if (regle instanceof CSSFontFaceRule) {
            noms.push(regle.style.getPropertyValue("font-family").replace(/['"]/g, ""));
          }
        }
      }
      return noms;
    });
    // Les familles préfixées `__nextjs-` appartiennent à la surcouche d'erreur
    // de Next en développement — elle embarque sa propre Geist et n'est jamais
    // livrée. Mesuré sur un build de production servi par `next start`, les
    // seules familles présentes sont plancheSerif, plancheSans et plancheMono.
    // Les exclure ici ne relâche donc pas le contrôle : cela évite de mesurer
    // l'outillage au lieu de la page.
    const applicatives = familles.filter((nom) => !nom.startsWith("__nextjs-"));
    expect(applicatives.length, "aucune @font-face applicative trouvée").toBeGreaterThan(0);
    for (const nom of applicatives) {
      expect(nom, "fonte de la charte historique servie sur un Dossier").not.toMatch(
        /Geist|Archivo/i
      );
    }
  });
});
