import { describe, expect, it } from "vitest";
import {
  attitudesConfusable,
  angleDelta,
  composeOrientationSession,
  generateOrientationQuestion,
  ORIENTATION_FORMATS,
  ORIENTATION_SESSION_SIZE,
  scoreOrientation,
  type OrientationQuestion,
} from "./orientation";

/**
 * Tests du test d'orientation — invariants des générateurs (déterminisme,
 * 5 choix distincts, bonne réponse présente et unique), composition de
 * session et notation.
 */

describe("orientation — générateur", () => {
  const difficulties = [1, 2, 3] as const;
  const seeds = [1, 42, 999, 123456, 2027];

  it("5 choix, bonne réponse présente, déterministe", () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const q = generateOrientationQuestion(seed, difficulty);
        expect(q.choices).toHaveLength(5);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(5);
        // La bonne réponse est l'attitude cible.
        expect(q.choices[q.correctIndex]).toEqual(q.target);
        // Déterminisme.
        expect(generateOrientationQuestion(seed, difficulty)).toEqual(q);
      }
    }
  });

  it("les cinq choix sont non confondables deux à deux (une seule bonne réponse)", () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        const { choices } = generateOrientationQuestion(seed, difficulty);
        for (let i = 0; i < choices.length; i++) {
          for (let j = i + 1; j < choices.length; j++) {
            expect(attitudesConfusable(choices[i], choices[j])).toBe(false);
          }
        }
      }
    }
  });

  it("les attitudes restent dans des bornes réalistes", () => {
    for (const difficulty of difficulties) {
      for (const seed of seeds) {
        for (const a of generateOrientationQuestion(seed, difficulty).choices) {
          expect(a.cap).toBeGreaterThanOrEqual(0);
          expect(a.cap).toBeLessThan(360);
          expect(Math.abs(a.pitch)).toBeLessThanOrEqual(55);
          expect(Math.abs(a.roll)).toBeLessThanOrEqual(180);
        }
      }
    }
  });

  it("réserve le vol sur le dos et les fortes assiettes au niveau 3", () => {
    const rolls: Record<1 | 2 | 3, number[]> = { 1: [], 2: [], 3: [] };
    const pitches: Record<1 | 2 | 3, number[]> = { 1: [], 2: [], 3: [] };
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const { target } = generateOrientationQuestion(seed, difficulty);
        rolls[difficulty].push(Math.abs(target.roll));
        pitches[difficulty].push(Math.abs(target.pitch));
      }
    }
    // Niveaux 1 et 2 : jamais sur le dos (inclinaison au plus 90°).
    expect(Math.max(...rolls[1])).toBeLessThanOrEqual(90);
    expect(Math.max(...rolls[2])).toBeLessThanOrEqual(90);
    // Niveau 3 : le vol sur le dos apparaît, et les assiettes montent plus haut.
    expect(rolls[3].some((r) => r > 90)).toBe(true);
    expect(Math.max(...pitches[3])).toBeGreaterThan(Math.max(...pitches[1]));
  });

  it("le modèle est l'un des deux appareils disponibles", () => {
    for (const seed of seeds) {
      const q = generateOrientationQuestion(seed, 2);
      expect(["jet", "biplane"]).toContain(q.model);
    }
  });
});

describe("angleDelta", () => {
  it("mesure l'écart circulaire minimal", () => {
    expect(angleDelta(10, 20)).toBe(10);
    expect(angleDelta(350, 10)).toBe(20);
    expect(angleDelta(0, 180)).toBe(180);
    expect(angleDelta(90, 270)).toBe(180);
    // Vol sur le dos : +175 et −175 ne sont distants que de 10°.
    expect(angleDelta(175, -175)).toBe(10);
  });
});

describe("orientation — formats", () => {
  it("propose le format officiel (27 questions / 7 min) et un format court (10 questions)", () => {
    expect(ORIENTATION_FORMATS.officiel.size).toBe(27);
    expect(ORIENTATION_FORMATS.officiel.durationSeconds).toBe(420);
    expect(ORIENTATION_FORMATS.court.size).toBe(10);
  });

  it("garde la même cadence dans les deux formats (à une seconde près)", () => {
    const paceOf = (f: { size: number; durationSeconds: number }) => f.durationSeconds / f.size;
    const officiel = paceOf(ORIENTATION_FORMATS.officiel);
    const court = paceOf(ORIENTATION_FORMATS.court);
    expect(Math.abs(officiel - court)).toBeLessThan(1);
  });

  it("compose une session de la taille du format demandé", () => {
    for (const format of Object.values(ORIENTATION_FORMATS)) {
      expect(composeOrientationSession(format.size, 42)).toHaveLength(format.size);
    }
  });
});

describe("orientation — session", () => {
  it("compose 27 questions, difficulté progressive, ids uniques", () => {
    const session = composeOrientationSession(ORIENTATION_SESSION_SIZE, 2026);
    expect(session).toHaveLength(27);
    expect(new Set(session.map((q) => q.id)).size).toBe(27);
    expect(session[0].difficulty).toBe(1);
    expect(session[13].difficulty).toBe(2);
    expect(session[26].difficulty).toBe(3);
  });

  it("est déterministe par graine", () => {
    expect(composeOrientationSession(9, 77)).toEqual(composeOrientationSession(9, 77));
  });
});

describe("orientation — notation", () => {
  const mk = (
    id: string,
    chosen: number | null,
    correct: number
  ): {
    questionId: string;
    chosenIndex: number | null;
    correctIndex: number;
  } => ({ questionId: id, chosenIndex: chosen, correctIndex: correct });

  it("compte justes, répondues et précision", () => {
    const score = scoreOrientation([
      mk("a", 2, 2), // juste
      mk("b", 0, 1), // faux
      mk("c", null, 3), // sans réponse
      mk("d", 4, 4), // juste
    ]);
    expect(score.total).toBe(4);
    expect(score.answered).toBe(3);
    expect(score.correct).toBe(2);
    expect(score.precision).toBeCloseTo(2 / 3);
  });

  it("précision nulle si rien répondu", () => {
    const score = scoreOrientation([mk("a", null, 1), mk("b", null, 0)]);
    expect(score.precision).toBe(0);
  });
});

// garde-fou de typage
const _typecheck: OrientationQuestion | null = null;
void _typecheck;
