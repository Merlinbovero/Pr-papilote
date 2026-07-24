import { describe, expect, it } from "vitest";
import {
  accuracyFromError,
  checkpointIntervalMs,
  checkpointTimes,
  expectedSumAt,
  mancheTarget,
  MANCHE_PERIOD_S,
  modeTasks,
  numberSequence,
  palonnierTargetAt,
  PALONNIER_DWELL_MS,
  SECPIL_LEVELS,
  SECPIL_MAX_ERROR,
  SECPIL_MODES,
  SECPIL_NUMBER_CYCLE_MS,
  SECPIL_TOLERANCE,
  sessionDurationMs,
  sessionOverall,
  type SecpilScore,
} from "./secpil";

describe("SECPIL — modes et niveaux", () => {
  it("expose 5 modes de progression cumulant les tâches", () => {
    expect(SECPIL_MODES).toHaveLength(5);
    expect(modeTasks("palonnier")).toEqual(["palonnier"]);
    expect(modeTasks("tout")).toEqual(["manche", "palonnier", "calcul"]);
  });

  it("expose 5 niveaux, du plus guidé au champ libre", () => {
    expect(SECPIL_LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    expect(SECPIL_LEVELS[0].checkpoint).toBe("crossing");
    expect(SECPIL_LEVELS[4].checkpoint).toBe("free");
    // Le niveau 3 fait passer aux nombres à deux chiffres.
    expect(SECPIL_LEVELS[2].numberMax).toBe(99);
  });
});

describe("SECPIL — durée et points de contrôle", () => {
  it("dure deux « 8 » avec le manche, 60 s sinon", () => {
    expect(sessionDurationMs("tout")).toBe(MANCHE_PERIOD_S * 2000);
    expect(sessionDurationMs("palonnier")).toBe(60_000);
    expect(sessionDurationMs("calcul")).toBe(60_000);
  });

  it("cadence les points de contrôle selon le niveau", () => {
    expect(checkpointIntervalMs("crossing")).toBe(MANCHE_PERIOD_S * 500);
    expect(checkpointIntervalMs("full8")).toBe(MANCHE_PERIOD_S * 1000);
    expect(checkpointIntervalMs("double8")).toBe(MANCHE_PERIOD_S * 2000);
    expect(checkpointIntervalMs("free")).toBe(Number.POSITIVE_INFINITY);
  });

  it("ne place aucun point de contrôle sans calcul", () => {
    expect(checkpointTimes("manche", 1)).toEqual([]);
    expect(checkpointTimes("palonnier", 2)).toEqual([]);
  });

  it("place les points de contrôle à la bonne cadence, un final inclus", () => {
    // « tout » niveau 1 (croisement, toutes les 28 s) sur 112 s.
    expect(checkpointTimes("tout", 1)).toEqual([28_000, 56_000, 84_000, 112_000]);
    // niveau 2 (chaque « 8 », 56 s).
    expect(checkpointTimes("tout", 2)).toEqual([56_000, 112_000]);
    // niveau 4 (deux « 8 », 112 s) → un seul, à la fin.
    expect(checkpointTimes("tout", 4)).toEqual([112_000]);
    // champ libre → un seul, à la fin.
    expect(checkpointTimes("tout", 5)).toEqual([112_000]);
  });
});

describe("SECPIL — géométrie des cibles", () => {
  it("garde la cible du manche dans le cadre et passe par le centre", () => {
    expect(mancheTarget(0)).toEqual({ x: 0, y: 0 });
    for (let ms = 0; ms <= 120_000; ms += 500) {
      const { x, y } = mancheTarget(ms);
      expect(Math.abs(x)).toBeLessThanOrEqual(1);
      expect(Math.abs(y)).toBeLessThanOrEqual(1);
    }
  });

  it("fait apparaître le point du palonnier par paliers bornés", () => {
    for (let ms = 0; ms <= 60_000; ms += 250) {
      const x = palonnierTargetAt(ms, 42);
      expect(x).toBeGreaterThanOrEqual(-1);
      expect(x).toBeLessThanOrEqual(1);
    }
    expect(palonnierTargetAt(100, 42)).toBe(palonnierTargetAt(1500, 42));
    expect(palonnierTargetAt(100, 42)).not.toBe(palonnierTargetAt(PALONNIER_DWELL_MS + 100, 42));
  });
});

describe("SECPIL — nombres et somme", () => {
  it("produit une somme courante exacte et déterministe", () => {
    const steps = numberSequence(42, 20, 9);
    let running = 0;
    for (const s of steps) {
      expect(s.value).toBeGreaterThanOrEqual(0);
      expect(s.value).toBeLessThanOrEqual(9);
      running += s.value;
      expect(s.sum).toBe(running);
    }
    expect(numberSequence(7, 15, 99)).toEqual(numberSequence(7, 15, 99));
  });

  it("passe aux nombres à deux chiffres au-delà de 9", () => {
    for (const s of numberSequence(1, 30, 99)) {
      expect(s.value).toBeGreaterThanOrEqual(10);
      expect(s.value).toBeLessThanOrEqual(99);
    }
  });

  it("donne la somme attendue à un instant selon les nombres révélés", () => {
    const steps = numberSequence(3, 10, 9);
    // Juste après le premier nombre.
    expect(expectedSumAt(steps, 10)).toBe(steps[0].sum);
    // Après deux cycles.
    expect(expectedSumAt(steps, SECPIL_NUMBER_CYCLE_MS * 2 + 10)).toBe(steps[2].sum);
  });
});

describe("SECPIL — précision et note", () => {
  it("convertit l'erreur de suivi en précision", () => {
    expect(accuracyFromError(0)).toBe(100);
    expect(accuracyFromError(SECPIL_TOLERANCE)).toBe(100);
    expect(accuracyFromError(SECPIL_MAX_ERROR)).toBe(0);
    expect(accuracyFromError(0.3)).toBeGreaterThan(accuracyFromError(0.7));
  });

  it("moyenne les composantes actives d'une session", () => {
    const score: SecpilScore = { manche: 80, palonnier: null, calcul: 60 };
    expect(sessionOverall(score)).toBe(70);
    expect(sessionOverall({ manche: null, palonnier: null, calcul: null })).toBe(0);
  });
});
