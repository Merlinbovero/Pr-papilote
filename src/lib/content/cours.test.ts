import { describe, expect, it } from "vitest";
import { courseSchema, exerciceSchema } from "./cours-schema";
import { getCourses, getExercices, getCoursesByMatiere } from "./cours";
import { getFiches, getQuestions, getTermes } from "./fiches";
import { isKnownInteraction } from "@/features/interactions/registry";

/**
 * Le chargement (getCourses/getExercices) VALIDE déjà toute l'intégrité
 * référentielle au build : ces tests garantissent que le contrat tient et que
 * les cours publiés respectent les règles (références vivantes, unicité,
 * séquence cohérente, sources/questions présentes).
 */

describe("cours — chargement et intégrité", () => {
  const courses = getCourses();
  const exercices = getExercices();
  const ficheIds = new Set(getFiches().map((f) => f.id));
  const questionIds = new Set(getQuestions().map((q) => q.id));
  const termeIds = new Set(getTermes().map((t) => t.id));
  const exerciceIds = new Set(exercices.map((e) => e.id));

  it("charge au moins le cours 1", () => {
    expect(courses.length).toBeGreaterThanOrEqual(1);
    expect(courses.some((c) => c.id === "cours.forces-et-lois-de-newton")).toBe(true);
  });

  it("chaque cours respecte le schéma", () => {
    for (const c of courses) {
      expect(() => courseSchema.parse(c)).not.toThrow();
    }
  });

  it("toutes les références des cours sont vivantes", () => {
    for (const c of courses) {
      for (const f of c.fiches) expect(ficheIds.has(f)).toBe(true);
      for (const q of c.questions) expect(questionIds.has(q)).toBe(true);
      for (const t of c.termes) expect(termeIds.has(t)).toBe(true);
      for (const e of c.exercices) expect(exerciceIds.has(e)).toBe(true);
      for (const i of c.interactions) expect(isKnownInteraction(i)).toBe(true);
    }
  });

  it("les étapes de séquence pointent vers des références déclarées", () => {
    for (const c of courses) {
      for (const step of c.sequence) {
        if (step.kind === "fiche") expect(c.fiches).toContain(step.ref);
        if (step.kind === "interaction") expect(c.interactions).toContain(step.ref);
        if (step.kind === "exercice") expect(c.exercices).toContain(step.ref);
      }
    }
  });

  it("un cours publié possède des sources et des questions", () => {
    for (const c of courses.filter((x) => x.status === "publie")) {
      expect(c.sources.length).toBeGreaterThanOrEqual(1);
      expect(c.questions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("l'ordre est unique par matière BIA", () => {
    const byMatiere = new Map<string, Set<number>>();
    for (const c of courses) {
      const set = byMatiere.get(c.matiereBia) ?? new Set<number>();
      expect(set.has(c.ordre)).toBe(false);
      set.add(c.ordre);
      byMatiere.set(c.matiereBia, set);
    }
  });

  it("chaque exercice respecte le schéma et lie une fiche existante", () => {
    for (const e of exercices) {
      expect(() => exerciceSchema.parse(e)).not.toThrow();
      expect(ficheIds.has(e.notionLiee)).toBe(true);
    }
  });

  it("le cours 1 est projeté dans sa matière BIA", () => {
    const list = getCoursesByMatiere("aerodynamique-et-principes-du-vol");
    expect(list.some((c) => c.id === "cours.forces-et-lois-de-newton")).toBe(true);
  });
});
