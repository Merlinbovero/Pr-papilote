import { describe, expect, it } from "vitest";
import { FAMILY_INFO, generateQuestion } from "./generators";
import { composeSession, scoreSession } from "./session";
import { PSY_FAMILIES, type PsyAnswerEvent, type PsyFamily } from "./types";

/**
 * Tests du moteur psychotechnique — invariants des générateurs
 * (déterminisme, 4 choix uniques, bonne réponse présente), composition de
 * session (répartition, progression de difficulté) et notation.
 */

describe("générateurs — invariants sur toutes les familles", () => {
  const difficulties = [1, 2, 3] as const;
  const seeds = [1, 42, 999, 123456];

  for (const family of PSY_FAMILIES) {
    it(`${family} : 4 choix uniques, bonne réponse présente, déterministe`, () => {
      for (const difficulty of difficulties) {
        for (const seed of seeds) {
          const q = generateQuestion(family, seed, difficulty);
          expect(q.family).toBe(family);
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices).size).toBe(4);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(4);
          expect(q.method.length).toBeGreaterThan(10);
          expect(q.timeLimitSeconds).toBe(FAMILY_INFO[family].timeLimits[difficulty - 1]);

          const again = generateQuestion(family, seed, difficulty);
          expect(again).toEqual(q);
        }
      }
    });
  }

  it("mémoire : la bonne réponse est bien l'élément à la position demandée", () => {
    for (const seed of [5, 77, 2024]) {
      const q = generateQuestion("memoire", seed, 2);
      const items = q.exposure!.lines[0].split(/\s+/);
      const position = Number(q.prompt.match(/(\d+)/)![1]);
      expect(q.choices[q.correctIndex]).toBe(items[position - 1]);
    }
  });

  it("empan de chiffres : la bonne réponse est bien la séquence inversée", () => {
    for (const seed of [4, 61, 2027]) {
      const q = generateQuestion("empan-chiffres", seed, 2);
      const shown = q.exposure!.lines[0].split(/\s+/);
      const reversed = [...shown].reverse().join(" ");
      expect(q.choices[q.correctIndex]).toBe(reversed);
    }
  });

  it("attention : le compte annoncé correspond à la grille", () => {
    for (const seed of [3, 88, 4321]) {
      const q = generateQuestion("attention", seed, 2);
      const target = q.prompt.match(/« (.) »/)![1];
      const count = q
        .gridLines!.join(" ")
        .split(/\s+/)
        .filter((c) => c === target).length;
      expect(q.choices[q.correctIndex]).toBe(String(count));
    }
  });

  it("dissociation d'attention : la réponse correspond aux cadrans hors limite affichés", () => {
    // Reconstitue l'état « hors limite » depuis le panneau (valeur vs règle affichée).
    const isOut = (line: string): boolean => {
      const ruleMatch = line.match(/\(([^)]+)\)\s*$/)!;
      const rule = ruleMatch[1];
      const value = Number(line.slice(0, ruleMatch.index).match(/(-?\d+)\s+\S+\s*$/)![1]);
      if (rule.startsWith("min ")) return value < Number(rule.slice(4));
      if (rule.startsWith("max ")) return value > Number(rule.slice(4));
      const [lo, hi] = rule.split("–").map(Number);
      return value < lo || value > hi;
    };

    for (const seed of [2, 50, 808, 91234]) {
      // Niveaux 1-2 : le compte annoncé = nombre de cadrans hors limite.
      for (const difficulty of [1, 2] as const) {
        const q = generateQuestion("dissociation-attention", seed, difficulty);
        const outCount = q.gridLines!.filter(isOut).length;
        expect(q.choices[q.correctIndex]).toBe(String(outCount));
      }
      // Niveau 3 : un seul cadran hors limite, et c'est celui désigné.
      const q3 = generateQuestion("dissociation-attention", seed, 3);
      const outLines = q3.gridLines!.filter(isOut);
      expect(outLines).toHaveLength(1);
      expect(outLines[0].startsWith(q3.choices[q3.correctIndex])).toBe(true);
    }
  });

  it("rapidité : identiques ↔ chaînes réellement égales", () => {
    for (const seed of [11, 220, 3033, 40404]) {
      const q = generateQuestion("rapidite", seed, 3);
      const [, a, b] = q.prompt.split("\n");
      const verdict = q.choices[q.correctIndex];
      expect(verdict).toBe(a === b ? "Identiques" : "Différentes");
    }
  });
});

describe("composition de session", () => {
  it("répartit équitablement les familles et reste déterministe", () => {
    const families: PsyFamily[] = ["calcul-mental", "orientation"];
    const a = composeSession({ families, size: 20, seed: 42 });
    const b = composeSession({ families, size: 20, seed: 42 });
    expect(a).toHaveLength(20);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    const calcul = a.filter((q) => q.family === "calcul-mental").length;
    expect(calcul).toBe(10);
  });

  it("monte en difficulté par tiers", () => {
    const session = composeSession({ families: ["suites-numeriques"], size: 9, seed: 7 });
    expect(session.slice(0, 3).every((q) => q.difficulty === 1)).toBe(true);
    expect(session.slice(3, 6).every((q) => q.difficulty === 2)).toBe(true);
    expect(session.slice(6).every((q) => q.difficulty === 3)).toBe(true);
  });

  it("ne duplique pas les questions dans une session", () => {
    const session = composeSession({ families: ["attention", "memoire"], size: 20, seed: 3 });
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("notation de session", () => {
  it("calcule précision, vitesse et familles à retravailler", () => {
    const events: PsyAnswerEvent[] = [
      { questionId: "a", family: "calcul-mental", correct: true, elapsedMs: 4000 },
      { questionId: "b", family: "calcul-mental", correct: true, elapsedMs: 6000 },
      { questionId: "c", family: "calcul-mental", correct: false, elapsedMs: 8000 },
      { questionId: "d", family: "orientation", correct: false, elapsedMs: 5000 },
      { questionId: "e", family: "orientation", correct: false, elapsedMs: 5000 },
      { questionId: "f", family: "orientation", correct: true, elapsedMs: 5000 },
      { questionId: "g", family: "memoire", correct: undefined, elapsedMs: 15000 },
    ];
    const score = scoreSession(events);
    expect(score.asked).toBe(7);
    expect(score.answered).toBe(6);
    expect(score.correct).toBe(3);
    expect(score.precision).toBeCloseTo(0.5);

    const calcul = score.parFamille.find((f) => f.family === "calcul-mental")!;
    expect(calcul.precision).toBeCloseTo(2 / 3);
    expect(calcul.avgMs).toBe(6000);

    // orientation à 1/3 (< 60 % sur ≥ 3 questions) → à retravailler.
    expect(score.aRetravailler).toEqual(["orientation"]);
  });
});
