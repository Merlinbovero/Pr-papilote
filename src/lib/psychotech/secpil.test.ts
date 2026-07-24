import { describe, expect, it } from "vitest";
import {
  accuracyFromError,
  digitCountForPhase,
  globalScore,
  improvementTrend,
  mancheTarget,
  mathSequence,
  palonnierTarget,
  phaseOverall,
  SECPIL_MAX_ERROR,
  SECPIL_PHASE_MS,
  SECPIL_PHASES,
  SECPIL_TOLERANCE,
  type SecpilPhaseScore,
} from "./secpil";

describe("SECPIL — phases", () => {
  it("expose quatre phases à montée en charge cumulative", () => {
    expect(SECPIL_PHASES).toHaveLength(4);
    expect(SECPIL_PHASES.map((p) => p.id)).toEqual([1, 2, 3, 4]);
    // La dernière phase cumule les trois tâches.
    expect(SECPIL_PHASES[3].tasks).toEqual(["manche", "palonnier", "calcul"]);
    // Le calcul n'apparaît qu'en dernière phase.
    const withCalcul = SECPIL_PHASES.filter((p) => p.tasks.includes("calcul"));
    expect(withCalcul).toHaveLength(1);
  });
});

describe("SECPIL — géométrie des cibles", () => {
  it("garde la cible du manche dans le cadre normalisé", () => {
    for (let ms = 0; ms <= SECPIL_PHASE_MS; ms += 250) {
      const { x, y } = mancheTarget(ms);
      expect(x).toBeGreaterThanOrEqual(-1);
      expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(-1);
      expect(y).toBeLessThanOrEqual(1);
    }
  });

  it("fait passer le « 8 » par le centre (croisement)", () => {
    // À t=0 la cible est au centre.
    const start = mancheTarget(0);
    expect(Math.abs(start.x)).toBeLessThan(1e-6);
    expect(Math.abs(start.y)).toBeLessThan(1e-6);
  });

  it("garde la cible du palonnier sur l'axe horizontal [-1, 1]", () => {
    for (let ms = 0; ms <= SECPIL_PHASE_MS; ms += 250) {
      const x = palonnierTarget(ms);
      expect(x).toBeGreaterThanOrEqual(-1);
      expect(x).toBeLessThanOrEqual(1);
    }
  });
});

describe("SECPIL — précision", () => {
  it("donne 100 sous la tolérance et 0 au-delà de l'erreur max", () => {
    expect(accuracyFromError(0)).toBe(100);
    expect(accuracyFromError(SECPIL_TOLERANCE)).toBe(100);
    expect(accuracyFromError(SECPIL_MAX_ERROR)).toBe(0);
    expect(accuracyFromError(5)).toBe(0);
  });

  it("décroît de façon monotone avec l'erreur", () => {
    const a = accuracyFromError(0.3);
    const b = accuracyFromError(0.6);
    const c = accuracyFromError(0.9);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
  });
});

describe("SECPIL — calcul mental", () => {
  it("produit une somme courante exacte", () => {
    const steps = mathSequence(42, 20);
    let running = 0;
    for (const step of steps) {
      expect(step.digit).toBeGreaterThanOrEqual(0);
      expect(step.digit).toBeLessThanOrEqual(9);
      running += step.digit;
      expect(step.sum).toBe(running);
    }
  });

  it("est déterministe pour une graine donnée", () => {
    expect(mathSequence(7, 15)).toEqual(mathSequence(7, 15));
  });

  it("compte un chiffre toutes les trois secondes", () => {
    expect(digitCountForPhase(52_000)).toBe(17);
  });
});

describe("SECPIL — agrégation des scores", () => {
  it("ne moyenne que les composantes actives d'une phase", () => {
    const score: SecpilPhaseScore = {
      phaseId: 1,
      manche: null,
      palonnier: 80,
      calcul: null,
    };
    expect(phaseOverall(score)).toBe(80);
  });

  it("calcule le score global comme la moyenne des phases", () => {
    const scores: SecpilPhaseScore[] = [
      { phaseId: 1, manche: null, palonnier: 60, calcul: null },
      { phaseId: 2, manche: 80, palonnier: null, calcul: null },
    ];
    expect(globalScore(scores)).toBe(70);
  });

  it("mesure la progression motrice entre première et dernière phase", () => {
    const scores: SecpilPhaseScore[] = [
      { phaseId: 1, manche: null, palonnier: 50, calcul: null },
      { phaseId: 2, manche: 70, palonnier: null, calcul: null },
    ];
    expect(improvementTrend(scores)).toBe(20);
    expect(improvementTrend([scores[0]])).toBeNull();
  });
});
