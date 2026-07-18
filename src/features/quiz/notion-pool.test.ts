import { describe, expect, it } from "vitest";
import { getFiches, getQuestionsForFiche } from "@/lib/content/fiches";
import { buildConcoursPool, buildEnglishPool, buildNotionPool } from "./notion-pool";

describe("buildNotionPool", () => {
  it("ne retient que des formats jouables (qcm, vrai-faux) et normalise en choix", () => {
    // Une fiche réelle qui porte des questions (le graphe garantit ≥ 1).
    const fiche = getFiches().find((f) => getQuestionsForFiche(f.id).length > 0);
    expect(fiche).toBeDefined();

    const pool = buildNotionPool(fiche!.id);
    expect(pool.length).toBeGreaterThan(0);
    for (const question of pool) {
      expect(question.choices.length).toBeGreaterThanOrEqual(2);
      expect(question.correctChoices.length).toBeGreaterThanOrEqual(1);
      // Chaque bonne réponse pointe vers un choix existant.
      for (const index of question.correctChoices) {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(question.choices.length);
      }
      expect(question.explanation.length).toBeGreaterThan(0);
    }
  });

  it("renvoie un vivier vide pour un identifiant inconnu", () => {
    expect(buildNotionPool("inexistant.fiche.xyz")).toEqual([]);
  });
});

describe("buildConcoursPool", () => {
  it("réunit un vivier jouable et substantiel pour chaque concours", () => {
    for (const concours of ["eopan", "eopn", "alat"] as const) {
      const pool = buildConcoursPool(concours);
      expect(pool.length).toBeGreaterThan(0);
      // Formats jouables uniquement, avec au moins une bonne réponse valide.
      for (const question of pool) {
        expect(question.choices.length).toBeGreaterThanOrEqual(2);
        expect(question.correctChoices.length).toBeGreaterThanOrEqual(1);
        for (const index of question.correctChoices) {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(question.choices.length);
        }
      }
    }
  });
});

describe("buildEnglishPool", () => {
  it("réunit un vivier jouable d'anglais aéronautique", () => {
    const pool = buildEnglishPool();
    expect(pool.length).toBeGreaterThan(0);
    for (const question of pool) {
      expect(question.choices.length).toBeGreaterThanOrEqual(2);
      expect(question.correctChoices.length).toBeGreaterThanOrEqual(1);
    }
  });
});
