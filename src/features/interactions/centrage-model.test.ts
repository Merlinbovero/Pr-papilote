import { describe, expect, it } from "vitest";
import {
  centrageMetrics,
  centrageStatut,
  describeCentrage,
  FOYER,
  LIMITE_ARRIERE,
  LIMITE_AVANT,
} from "./centrage-model";

describe("interaction centrage — modèle pur", () => {
  it("un centre de gravité derrière le foyer est instable", () => {
    expect(centrageStatut(FOYER + 2)).toBe("instable");
    expect(centrageMetrics(FOYER + 2).margeStatique).toBeLessThan(0);
  });

  it("dans la plage, la marge statique est positive", () => {
    const m = centrageMetrics((LIMITE_AVANT + LIMITE_ARRIERE) / 2);
    expect(m.dansLaPlage).toBe(true);
    expect(m.margeStatique).toBeGreaterThan(0);
  });

  it("hors des limites, le centrage n'est pas dans la plage", () => {
    expect(centrageMetrics(LIMITE_AVANT - 2).statut).toBe("hors-avant");
    expect(centrageMetrics(LIMITE_ARRIERE + 1).statut).toBe("hors-arriere");
    expect(centrageMetrics(LIMITE_AVANT - 2).dansLaPlage).toBe(false);
  });

  it("l'alternative textuelle qualifie le centrage et cite la marge statique", () => {
    expect(describeCentrage({ cg: 21 })).toContain("marge statique");
    expect(describeCentrage({ cg: FOYER + 3 })).toContain("instable");
  });
});
