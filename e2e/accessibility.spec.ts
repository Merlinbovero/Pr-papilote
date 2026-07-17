import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibilité automatisée (ch. 9 §5) : scan axe des pages clés sur les
 * critères WCAG 2 niveaux A et AA. L'accessibilité fait partie de la qualité
 * du produit — une régression casse la CI.
 */
const keyPages: { name: string; path: string }[] = [
  { name: "accueil", path: "/" },
  { name: "hub de module", path: "/eopan" },
  { name: "fiche documentaire", path: "/eopan/appareils/rafale-m" },
  { name: "recherche", path: "/recherche" },
  { name: "dictionnaire", path: "/dictionnaire" },
  { name: "parcours BIA", path: "/bia" },
  { name: "cours (forces et lois de Newton)", path: "/cours/forces-et-lois-de-newton" },
  { name: "cours (pression et écoulement)", path: "/cours/pression-et-ecoulement" },
  { name: "cours (Bernoulli et Venturi)", path: "/cours/bernoulli-et-venturi" },
  { name: "cours (les souffleries)", path: "/cours/les-souffleries" },
  { name: "cours (la force aérodynamique)", path: "/cours/la-force-aerodynamique" },
  { name: "cours (traînée induite & allongement)", path: "/cours/trainee-induite-et-allongement" },
  { name: "cours (couche limite & décrochage)", path: "/cours/couche-limite-et-decrochage" },
  { name: "cours (la polaire & finesse)", path: "/cours/la-polaire-et-la-finesse" },
  { name: "cours (les types de profils)", path: "/cours/les-types-de-profils" },
  { name: "cours (hypersustentateurs)", path: "/cours/dispositifs-hypersustentateurs" },
  { name: "examen blanc BIA", path: "/bia/examen-blanc" },
  { name: "entraînement psychotechnique", path: "/psychotechnique/entrainement" },
  { name: "carte des bases aériennes", path: "/cartes/armee-de-l-air" },
  { name: "mentions légales", path: "/mentions-legales" },
];

for (const { name, path } of keyPages) {
  test(`${name} ne présente aucune violation WCAG A/AA`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
