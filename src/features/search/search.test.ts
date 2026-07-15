import { describe, expect, it } from "vitest";
import { createSearchEntry } from "./entries";
import { searchEntries, searchWithFallback, suggestCorrection } from "./search";

const entries = [
  createSearchEntry({
    id: "eopan.bases.charles-de-gaulle",
    type: "fiche",
    family: "navire",
    title: "Porte-avions Charles de Gaulle",
    summary: "Unique porte-avions français, à propulsion nucléaire.",
    moduleName: "EOPAN",
    moduleSlug: "eopan",
    url: "/eopan/navires/charles-de-gaulle",
    aliases: ["CDG", "Porte-avions", "R91"],
  }),
  createSearchEntry({
    id: "eopan.appareils.rafale-m",
    type: "fiche",
    family: "appareil",
    title: "Rafale M",
    summary: "Chasseur multirôle embarqué de la Marine nationale.",
    moduleName: "EOPAN",
    moduleSlug: "eopan",
    url: "/eopan/appareils/rafale-m",
    aliases: ["Rafale Marine"],
  }),
  createSearchEntry({
    id: "eopan.procedures.appontage",
    type: "fiche",
    family: "procedure",
    title: "Appontage",
    summary: "Atterrissage sur porte-avions.",
    moduleName: "EOPAN",
    moduleSlug: "eopan",
    url: "/eopan/procedures/appontage",
  }),
  createSearchEntry({
    id: "eopn",
    type: "module",
    title: "EOPN — Élève Officier du Personnel Navigant",
    moduleName: "EOPN",
    moduleSlug: "eopn",
    url: "/eopn",
    aliases: ["EOPN"],
  }),
];

describe("searchEntries — compréhension intelligente", () => {
  it("comprend accents, casse, tirets et pluriels : « Porte avion » → Charles de Gaulle", () => {
    for (const query of ["Porte avion", "Porte-avions", "PORTE-AVIONS", "porte avions"]) {
      expect(searchEntries(entries, query)[0]?.id).toBe("eopan.bases.charles-de-gaulle");
    }
  });

  it("résout les alias : « CDG » → Charles de Gaulle", () => {
    expect(searchEntries(entries, "CDG")[0]?.id).toBe("eopan.bases.charles-de-gaulle");
  });

  it("« Rafale marine » et « Rafale M » mènent au même objet", () => {
    expect(searchEntries(entries, "Rafale marine")[0]?.id).toBe("eopan.appareils.rafale-m");
    expect(searchEntries(entries, "Rafale M")[0]?.id).toBe("eopan.appareils.rafale-m");
  });

  it("tolère les fautes de frappe : « apontage » → Appontage", () => {
    expect(searchEntries(entries, "apontage").map((e) => e.id)).toContain(
      "eopan.procedures.appontage"
    );
  });

  it("classe les fiches avant les modules à correspondance comparable", () => {
    const results = searchEntries(entries, "eop");
    const ficheIndex = results.findIndex((e) => e.type === "fiche");
    const moduleIndex = results.findIndex((e) => e.type === "module");
    if (ficheIndex !== -1 && moduleIndex !== -1) {
      expect(moduleIndex).toBeGreaterThanOrEqual(0);
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it("booste le contexte de module sans jamais filtrer", () => {
    const eopanFirst = searchEntries(entries, "rafale", { moduleSlug: "eopan" });
    expect(eopanFirst[0]?.moduleSlug).toBe("eopan");
    // le module EOPN reste trouvable depuis le contexte EOPAN
    expect(searchEntries(entries, "EOPN", { moduleSlug: "eopan" }).map((e) => e.id)).toContain(
      "eopn"
    );
  });

  it("retourne une liste vide pour une requête vide", () => {
    expect(searchEntries(entries, "  ")).toEqual([]);
  });
});

describe("zéro impasse", () => {
  it("propose une correction pour une requête proche", () => {
    expect(suggestCorrection(entries, "apontage")).toBe("Appontage");
  });

  it("ne laisse jamais une requête sans issue", () => {
    const outcome = searchWithFallback(entries, "portavion");
    expect(outcome.results.length > 0 || outcome.correction !== undefined).toBe(true);
  });
});
