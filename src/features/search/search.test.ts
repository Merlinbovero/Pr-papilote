import { describe, expect, it } from "vitest";
import { searchEntries } from "./search";
import type { SearchEntry } from "./types";

const entries: SearchEntry[] = [
  {
    id: "eopn",
    type: "module",
    title: "EOPN — Élève Officier du Personnel Navigant",
    moduleName: "EOPN",
    moduleSlug: "eopn",
    url: "/eopn",
    keywords: ["Armée de l'Air et de l'Espace"],
  },
  {
    id: "eopn.appareils",
    type: "categorie",
    title: "Appareils — EOPN",
    moduleName: "EOPN",
    moduleSlug: "eopn",
    url: "/eopn/appareils",
  },
  {
    id: "fondamentaux.meteorologie",
    type: "categorie",
    title: "Météorologie — Fondamentaux aéronautiques",
    moduleName: "Fondamentaux aéronautiques",
    moduleSlug: "fondamentaux",
    url: "/fondamentaux/meteorologie",
    keywords: ["météo"],
  },
];

describe("searchEntries", () => {
  it("retourne une liste vide pour une requête vide", () => {
    expect(searchEntries(entries, "")).toEqual([]);
    expect(searchEntries(entries, "   ")).toEqual([]);
  });

  it("trouve un module par son sigle", () => {
    const results = searchEntries(entries, "EOPN");
    expect(results.map((r) => r.id)).toContain("eopn");
  });

  it("tolère l'approximation (recherche floue)", () => {
    const results = searchEntries(entries, "meteorologie");
    expect(results.map((r) => r.id)).toContain("fondamentaux.meteorologie");
  });

  it("trouve par mot-clé synonyme", () => {
    const results = searchEntries(entries, "météo");
    expect(results.map((r) => r.id)).toContain("fondamentaux.meteorologie");
  });

  it("restreint au module courant en recherche contextuelle", () => {
    const results = searchEntries(entries, "appareils", { moduleSlug: "eopn" });
    expect(results.every((r) => r.moduleSlug === "eopn")).toBe(true);
    expect(results.map((r) => r.id)).toContain("eopn.appareils");
  });

  it("respecte la limite de résultats", () => {
    expect(searchEntries(entries, "e", { limit: 1 }).length).toBeLessThanOrEqual(1);
  });
});
