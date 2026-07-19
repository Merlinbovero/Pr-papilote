import { describe, expect, it } from "vitest";
import {
  getCategories,
  getCategory,
  getCompetence,
  getCompetences,
  getModule,
  getModules,
} from "./referentials";

describe("référentiel des modules", () => {
  it("contient les six portes d'entrée dans l'ordre officiel", () => {
    expect(getModules().map((m) => m.slug)).toEqual([
      "eopan",
      "eopn",
      "alat",
      "psychotechnique",
      "fondamentaux",
      "culture",
    ]);
  });

  it("désigne trois concours et trois modules transverses", () => {
    const modules = getModules();
    expect(modules.filter((m) => m.kind === "concours")).toHaveLength(3);
    expect(modules.filter((m) => m.kind === "transverse")).toHaveLength(3);
  });

  it("retourne undefined pour un module inconnu", () => {
    expect(getModule("inconnu")).toBeUndefined();
  });
});

describe("référentiel des catégories", () => {
  it("donne exactement la même structure aux trois concours", () => {
    const eopan = getCategories("eopan");
    expect(eopan.length).toBeGreaterThan(0);
    expect(getCategories("eopn")).toEqual(eopan);
    expect(getCategories("alat")).toEqual(eopan);
  });

  it("couvre les rubriques imposées par la vision pour un concours", () => {
    const slugs = getCategories("eopan").map((c) => c.slug);
    for (const required of ["presentation", "appareils", "bases", "procedures", "quiz"]) {
      expect(slugs).toContain(required);
    }
  });

  it("fournit des catégories propres aux modules transverses", () => {
    expect(getCategories("fondamentaux").map((c) => c.slug)).toContain("meteorologie");
    expect(getCategories("psychotechnique").map((c) => c.slug)).toContain("exercices");
    expect(getCategories("culture").map((c) => c.slug)).toContain("aviation-mondiale");
  });

  it("trie les catégories par ordre d'affichage", () => {
    for (const mod of getModules()) {
      const orders = getCategories(mod.slug).map((c) => c.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it("retrouve une catégorie par slug et rejette les inconnues", () => {
    expect(getCategory("eopn", "appareils")?.name).toBe("Appareils");
    expect(getCategory("eopn", "inexistante")).toBeUndefined();
    expect(getCategories("module-inconnu")).toEqual([]);
  });
});

describe("référentiel des compétences", () => {
  it("charge un référentiel fermé sans identifiant en double", () => {
    const competences = getCompetences();
    expect(competences.length).toBeGreaterThan(0);
    const ids = competences.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("expose libellé, description et domaine pour chaque compétence", () => {
    for (const competence of getCompetences()) {
      expect(competence.label.length).toBeGreaterThan(0);
      expect(competence.description.length).toBeGreaterThan(0);
      expect(competence.domain.length).toBeGreaterThan(0);
    }
  });

  it("retrouve une compétence par identifiant et rejette les inconnues", () => {
    expect(getCompetence("calcul-mental")?.label).toBe("Calcul mental");
    expect(getCompetence("inexistante")).toBeUndefined();
  });
});
