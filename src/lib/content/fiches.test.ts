import { describe, expect, it } from "vitest";
import {
  getFiche,
  getFicheLinks,
  getFiches,
  getFichesByCategory,
  getReadingMinutes,
  getTermes,
  getTermesForFiche,
} from "./fiches";

/**
 * Intégrité des cinq fiches pilotes — les cinq premiers nœuds réels du
 * graphe documentaire. Ces tests chargent le vrai contenu : ils échouent
 * si une fiche viole le contrat ou si une arête du graphe est invalide.
 */

describe("fiches pilotes", () => {
  it("charge les cinq nœuds pilotes", () => {
    const ids = getFiches().map((fiche) => fiche.id);
    for (const expected of [
      "eopan.appareils.rafale-m",
      "eopan.bases.charles-de-gaulle",
      "eopan.bases.flottille-11f",
      "eopan.procedures.appontage",
      "eopan.procedures.catobar",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("relie Rafale M et Charles de Gaulle dans les deux sens", () => {
    const rafale = getFicheLinks("eopan.appareils.rafale-m");
    expect(rafale.map((l) => l.targetId)).toContain("eopan.bases.charles-de-gaulle");
    expect(rafale.find((l) => l.targetId === "eopan.bases.charles-de-gaulle")?.label).toBe(
      "Embarque sur"
    );

    const cdg = getFicheLinks("eopan.bases.charles-de-gaulle");
    const inverse = cdg.find((l) => l.targetId === "eopan.appareils.rafale-m");
    expect(inverse?.label).toBe("Embarque");
    expect(inverse?.direction).toBe("entrante");
  });

  it("relie la 11F au Rafale M (dotée de / équipe)", () => {
    const links = getFicheLinks("eopan.bases.flottille-11f");
    expect(links.find((l) => l.targetId === "eopan.appareils.rafale-m")?.label).toBe("Doté de");
  });

  it("fait de CATOBAR le prérequis de l'appontage", () => {
    const appontage = getFiche("eopan", "procedures", "appontage");
    expect(appontage?.relations.prerequisites).toContain("eopan.procedures.catobar");
  });

  it("expose les termes du dictionnaire et leurs renvois", () => {
    expect(getTermes().map((t) => t.id)).toEqual(
      expect.arrayContaining(["terme.appontage", "terme.catobar"])
    );
    expect(getTermesForFiche("eopan.procedures.catobar").map((t) => t.id)).toContain(
      "terme.catobar"
    );
  });

  it("calcule un temps de lecture plausible", () => {
    const rafale = getFiche("eopan", "appareils", "rafale-m");
    expect(rafale).toBeDefined();
    expect(getReadingMinutes(rafale!)).toBeGreaterThanOrEqual(1);
    expect(getReadingMinutes(rafale!)).toBeLessThan(15);
  });

  it("classe chaque pilote dans sa famille documentaire (recatégorisation validée)", () => {
    expect(getFichesByCategory("eopan", "navires").map((f) => f.id)).toContain(
      "eopan.bases.charles-de-gaulle"
    );
    expect(getFichesByCategory("eopan", "unites").map((f) => f.id)).toContain(
      "eopan.bases.flottille-11f"
    );
    expect(getFichesByCategory("eopan", "concepts").map((f) => f.id)).toContain(
      "eopan.procedures.catobar"
    );
    // Les IDs restent gelés malgré le déplacement : le graphe n'a pas bougé.
  });
});
