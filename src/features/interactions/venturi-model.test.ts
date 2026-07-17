import { describe, expect, it } from "vitest";
import { describeVenturi, INITIAL_VENTURI, V1, venturiMetrics } from "./venturi-model";

describe("interaction Venturi — modèle pur", () => {
  it("sans rétrécissement, la vitesse et la pression ne changent pas", () => {
    const m = venturiMetrics("aucun");
    expect(m.speedFactor).toBe(1);
    expect(m.v2).toBe(V1);
    expect(m.deltaP).toBe(0);
  });

  it("un rétrécissement accélère l'air et fait chuter la pression statique", () => {
    const moyen = venturiMetrics("moyen");
    expect(moyen.speedFactor).toBeCloseTo(2, 5);
    expect(moyen.v2).toBeCloseTo(2 * V1, 5);
    // Vitesse ↑ ⇒ pression dynamique ↑ ⇒ pression statique ↓ (chute > 0).
    expect(moyen.deltaP).toBeGreaterThan(0);
  });

  it("plus le rétrécissement est fort, plus la chute de pression est grande", () => {
    expect(venturiMetrics("fort").deltaP).toBeGreaterThan(venturiMetrics("moyen").deltaP);
  });

  it("l'alternative textuelle nomme l'effet Venturi et Bernoulli", () => {
    const txt = describeVenturi(INITIAL_VENTURI);
    expect(txt).toContain("Venturi");
    expect(txt).toContain("Bernoulli");
  });
});
