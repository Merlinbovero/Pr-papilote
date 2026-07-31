import { describe, expect, it } from "vitest";

import { getCourses } from "./cours";
import { getCategories, getCotesCours, getCoteCours } from "./referentials";

/**
 * Les cotes documentaires des leçons — lot M5.
 *
 * Une cote se note sur un cahier et se retrouve six mois plus tard. Trois
 * propriétés la rendent utilisable, et ce fichier les tient :
 *
 *  1. **unicité** — deux leçons ne portent jamais la même référence ;
 *  2. **stabilité** — la valeur est inscrite, pas dérivée ; ajouter ou
 *     déplacer une leçon ne renumérote rien ;
 *  3. **indépendance du tri** — le rendu ne consulte aucun ordre courant.
 *
 * Le tableau ci-dessous est le **gel**. Le modifier, c'est casser la promesse
 * faite au candidat qui a noté la référence : on n'y touche pas pour ranger,
 * seulement pour ajouter une ligne à la fin.
 */
const COTES_GELEES: Record<string, string> = {
  "forces-et-lois-de-newton": "FOND · B.1.01",
  "pression-et-ecoulement": "FOND · B.3.02",
  "bernoulli-et-venturi": "FOND · B.3.03",
  "les-souffleries": "FOND · B.3.04",
  "la-force-aerodynamique": "FOND · B.3.05",
  "trainee-induite-et-allongement": "FOND · B.3.06",
  "couche-limite-et-decrochage": "FOND · B.3.07",
  "la-polaire-et-la-finesse": "FOND · B.3.08",
  "les-types-de-profils": "FOND · B.3.09",
  "dispositifs-hypersustentateurs": "FOND · B.3.10",
  "les-axes-et-les-gouvernes": "FOND · B.3.11",
  "les-bilans-de-forces": "FOND · B.3.12",
  "les-effets-moteur": "FOND · B.3.13",
  "stabilite-et-centrage": "FOND · B.3.14",
};

describe("cotes documentaires des leçons", () => {
  it("chaque leçon publiée porte une cote", () => {
    const sans = getCourses()
      .map((c) => c.slug)
      .filter((slug) => getCoteCours(slug) === undefined);
    expect(sans, "leçons sans cote").toEqual([]);
  });

  it("aucune cote n'est portée par deux leçons", () => {
    const cotes = [...getCotesCours().values()];
    expect(new Set(cotes).size).toBe(cotes.length);
  });

  it("les cotes existantes n'ont pas bougé", () => {
    for (const [slug, cote] of Object.entries(COTES_GELEES)) {
      expect(getCoteCours(slug), slug).toBe(cote);
    }
  });

  it("suit la grammaire MODULE · F.C.NN", () => {
    for (const [slug, cote] of getCotesCours()) {
      expect(cote, slug).toMatch(/^[A-Z]{3,5} · [A-F]\.\d{1,2}\.\d{2}$/);
    }
  });

  it("ne dépend d'aucun tri courant : deux lectures rendent la même chose", () => {
    // La cote vient d'un fichier, pas d'un `sort()` : réordonner les leçons
    // en mémoire ne peut pas la déplacer.
    const premier = [...getCotesCours().entries()];
    const melange = [...getCourses()].reverse().map((c) => [c.slug, getCoteCours(c.slug)]);
    for (const [slug, cote] of melange) {
      expect(premier.find(([s]) => s === slug)?.[1]).toBe(cote);
    }
  });

  it("le dernier segment est un rang de PARCOURS, jamais un rang de catégorie", () => {
    // C'est la sémantique arrêtée, et elle se voit d'un coup d'œil sur la
    // deuxième leçon : « pression-et-ecoulement » est la **1re** leçon de la
    // catégorie Aérodynamique, mais la **2e** du parcours. Elle porte 02.
    // Si le NN était un rang de catégorie, elle porterait 01 — et « la leçon
    // 3 » désignerait deux leçons différentes selon la catégorie visée.
    expect(getCoteCours("pression-et-ecoulement")).toBe("FOND · B.3.02");

    const cours = [...getCourses()].sort((a, b) => a.ordre - b.ordre);
    for (const c of cours) {
      const nn = getCoteCours(c.slug)?.slice(-2);
      expect(Number(nn), `${c.slug} : NN doit valoir son rang de parcours`).toBe(c.ordre);
    }
  });

  it("le segment de catégorie est le rang déclaré au référentiel", () => {
    const rangs = new Map(getCategories("fondamentaux").map((c) => [c.slug, c.order]));
    for (const c of getCourses()) {
      const segment = getCoteCours(c.slug)?.split(".")[1];
      expect(Number(segment), `${c.slug} : C doit valoir le rang de sa catégorie`).toBe(
        rangs.get(c.categorieFondamentaux)
      );
    }
  });

  it("les rangs de parcours se suivent sans trou : « la leçon 7 » désigne une leçon", () => {
    const nn = [...getCotesCours().values()]
      .map((cote) => Number(cote.slice(-2)))
      .sort((a, b) => a - b);
    expect(nn).toEqual(Array.from({ length: nn.length }, (_, i) => i + 1));
  });

  /**
   * Le référentiel est indexé par **slug**. Un changement de slug ou d'URL ne
   * modifie donc jamais la cote : la correspondance doit être explicitement
   * migrée — on renomme la clé en gardant la valeur.
   *
   * Ces deux tests sont le mécanisme d'application : un slug renommé sans
   * migration laisse une leçon sans cote **et** une cote orpheline, donc deux
   * échecs. La migration devient un geste conscient, jamais un effet de bord.
   */
  it("le référentiel ne contient aucune cote orpheline", () => {
    // Une cote sans leçon serait une référence morte : elle pointerait vers
    // une page qui n'existe pas si un candidat la cherchait.
    const slugs = new Set(getCourses().map((c) => c.slug));
    const orphelines = [...getCotesCours().keys()].filter((slug) => !slugs.has(slug));
    expect(orphelines).toEqual([]);
  });
});
