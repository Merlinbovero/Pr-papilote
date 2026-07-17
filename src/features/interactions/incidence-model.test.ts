import { describe, expect, it } from "vitest";
import { describeIncidence, incidenceMetrics, INCIDENCE_CZ } from "./incidence-model";

describe("interaction incidence/décrochage — modèle pur", () => {
  it("le Cz croît de faible à critique puis chute au décrochage", () => {
    expect(INCIDENCE_CZ.faible).toBeLessThan(INCIDENCE_CZ.moyenne);
    expect(INCIDENCE_CZ.moyenne).toBeLessThan(INCIDENCE_CZ.critique);
    // Effondrement post-décrochage : Cz plus faible qu'au critique.
    expect(INCIDENCE_CZ.decrochage).toBeLessThan(INCIDENCE_CZ.critique);
  });

  it("l'état de l'écoulement passe de collé à décollé", () => {
    expect(incidenceMetrics("faible").flow).toBe("colle");
    expect(incidenceMetrics("critique").flow).toBe("limite");
    expect(incidenceMetrics("decrochage").flow).toBe("decolle");
    expect(incidenceMetrics("decrochage").stalled).toBe(true);
  });

  it("l'alternative textuelle nomme le décrochage au-delà du critique", () => {
    expect(describeIncidence({ level: "faible" })).toContain("suit le profil");
    expect(describeIncidence({ level: "decrochage" })).toContain("décrochage");
  });
});
