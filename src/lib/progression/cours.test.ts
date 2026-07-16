import { describe, expect, it } from "vitest";
import { deriveCourseStatus, type CourseProgressSignals } from "./cours";

const base: CourseProgressSignals = {
  opened: true,
  consultedStepIndexes: [],
  obligatoryStepIndexes: [1, 2],
  quizDone: false,
  quizScore: 0,
  activeCriticalErrors: 0,
};

describe("progression d'un cours — règle pure", () => {
  it("non commencé si jamais ouvert", () => {
    expect(deriveCourseStatus({ ...base, opened: false })).toBe("non-commence");
  });

  it("découverte à l'ouverture, sans étape consultée", () => {
    expect(deriveCourseStatus(base)).toBe("decouverte");
  });

  it("en cours dès qu'une étape est consultée", () => {
    expect(deriveCourseStatus({ ...base, consultedStepIndexes: [1] })).toBe("en-cours");
  });

  it("étudié quand toutes les étapes obligatoires sont consultées", () => {
    expect(deriveCourseStatus({ ...base, consultedStepIndexes: [1, 2] })).toBe("etudie");
  });

  it("maîtrisé quand le quiz est réussi au seuil, sans erreur critique", () => {
    expect(
      deriveCourseStatus({
        ...base,
        consultedStepIndexes: [1, 2],
        quizDone: true,
        quizScore: 0.85,
      })
    ).toBe("maitrise");
  });

  it("pas maîtrisé si une erreur critique reste active", () => {
    expect(
      deriveCourseStatus({
        ...base,
        consultedStepIndexes: [1, 2],
        quizDone: true,
        quizScore: 0.9,
        activeCriticalErrors: 1,
      })
    ).toBe("etudie");
  });

  it("pas maîtrisé si le score est sous le seuil", () => {
    expect(
      deriveCourseStatus({
        ...base,
        consultedStepIndexes: [1, 2],
        quizDone: true,
        quizScore: 0.5,
      })
    ).toBe("etudie");
  });
});
