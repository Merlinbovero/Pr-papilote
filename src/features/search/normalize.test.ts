import { describe, expect, it } from "vitest";
import { boundedLevenshtein, normalizeText } from "./normalize";

describe("normalizeText", () => {
  it("plie les accents et la casse", () => {
    expect(normalizeText("MÉTÉOROLOGIE")).toBe("meteorologie");
    expect(normalizeText("Aéronautique Navale")).toBe("aeronautique navale");
  });

  it("neutralise traits d'union et ponctuation", () => {
    expect(normalizeText("porte-avions")).toBe(normalizeText("porte avions"));
    expect(normalizeText("l'appontage")).toBe("l appontage");
  });

  it("ramène les pluriels au singulier (règle s/x)", () => {
    expect(normalizeText("Porte avion")).toBe(normalizeText("Porte-avions"));
    expect(normalizeText("brins d'arrêt")).toBe("brin d arret");
    expect(normalizeText("travaux")).toBe("travau");
  });

  it("préserve les sigles courts", () => {
    expect(normalizeText("CDG")).toBe("cdg");
    expect(normalizeText("11F")).toBe("11f");
  });
});

describe("boundedLevenshtein", () => {
  it("mesure les fautes de frappe courantes", () => {
    expect(boundedLevenshtein("apontage", "appontage", 2)).toBe(1);
    expect(boundedLevenshtein("catobar", "catobar", 2)).toBe(0);
  });

  it("coupe court au-delà de la borne", () => {
    expect(boundedLevenshtein("rafale", "helicoptere", 2)).toBe(3);
  });
});
