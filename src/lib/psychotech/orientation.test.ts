import { describe, expect, it } from "vitest";
import {
  attitudesConfusable,
  capDelta,
  composeOrientationSession,
  generateOrientationQuestion,
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
          expect(Math.abs(a.roll)).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it("le modèle est l'un des deux appareils disponibles", () => {
    for (const seed of seeds) {
      const q = generateOrientationQuestion(seed, 2);
      expect(["jet", "biplane"]).toContain(q.model);
    }
  });
});

describe("capDelta", () => {
  it("mesure l'écart circulaire minimal", () => {
    expect(capDelta(10, 20)).toBe(10);
    expect(capDelta(350, 10)).toBe(20);
    expect(capDelta(0, 180)).toBe(180);
    expect(capDelta(90, 270)).toBe(180);
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
