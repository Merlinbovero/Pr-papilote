import { describe, expect, it } from "vitest";

import {
  buildCodageSession,
  buildGrid,
  CODAGE_FORMATS,
  CODAGE_LEVEL_LIST,
  CODAGE_LEVELS,
  CODAGE_OPTIONS,
  CODAGE_PACE_SECONDS,
  codeDistance,
  scoreCodageSession,
  wordForCode,
  type CodageLevel,
} from "@/lib/psychotech/codage";

const LEVELS: CodageLevel[] = [1, 2, 3];

function sessions(level: CodageLevel, count = 20) {
  return Array.from({ length: count }, (_, i) =>
    buildCodageSession(i * 211 + level, "officiel", level)
  );
}

describe("grille", () => {
  it("est déterministe pour une graine donnée", () => {
    expect(buildGrid(42, 2)).toEqual(buildGrid(42, 2));
    expect(buildGrid(42, 2)).not.toEqual(buildGrid(43, 2));
  });

  it("compte le nombre de mots annoncé par le niveau", () => {
    for (const level of LEVELS) {
      for (const session of sessions(level, 15)) {
        expect(session.grid).toHaveLength(CODAGE_LEVELS[level].size);
      }
    }
  });

  it("n’a ni mot ni code en double — sinon la question n’aurait pas de réponse", () => {
    for (const level of LEVELS) {
      for (const session of sessions(level, 15)) {
        const mots = session.grid.map((e) => e.word);
        const codes = session.grid.map((e) => e.code);
        expect(new Set(mots).size).toBe(mots.length);
        expect(new Set(codes).size).toBe(codes.length);
      }
    }
  });

  it("n’emploie que des codes à quatre chiffres", () => {
    for (const level of LEVELS) {
      for (const session of sessions(level, 15)) {
        for (const { code } of session.grid) expect(code).toMatch(/^[1-9]\d{3}$/);
      }
    }
  });
});

describe("questions", () => {
  it("propose cinq codes, une seule bonne réponse", () => {
    for (const level of LEVELS) {
      for (const session of sessions(level, 10)) {
        for (const question of session.questions) {
          expect(question.options).toHaveLength(CODAGE_OPTIONS);
          expect(new Set(question.options).size).toBe(CODAGE_OPTIONS);
          expect(question.options[question.answerIndex]).toBe(
            session.grid[question.entryIndex].code
          );
        }
      }
    }
  });

  it("ne propose que des codes présents dans la grille — le trait de l’épreuve", () => {
    for (const level of LEVELS) {
      for (const session of sessions(level, 10)) {
        const codes = new Set(session.grid.map((e) => e.code));
        for (const question of session.questions) {
          for (const option of question.options) expect(codes.has(option)).toBe(true);
        }
      }
    }
  });

  it("choisit des distracteurs proches du bon code, de plus en plus au fil des niveaux", () => {
    // Part des mauvaises propositions qui ne diffèrent que d'un ou deux
    // chiffres du bon code. C'est ce qui fait qu'on ne peut pas répondre à vue.
    const proximite = (level: CodageLevel) => {
      let proches = 0;
      let total = 0;
      for (const session of sessions(level, 10)) {
        for (const question of session.questions) {
          const bon = question.options[question.answerIndex];
          for (const option of question.options) {
            if (option === bon) continue;
            total += 1;
            if (codeDistance(bon, option) <= 2) proches += 1;
          }
        }
      }
      return proches / total;
    };
    const [n1, n2, n3] = [proximite(1), proximite(2), proximite(3)];
    // Même au niveau le plus simple, la majorité des distracteurs se ressemble.
    expect(n1).toBeGreaterThan(0.55);
    expect(n2).toBeGreaterThan(n1);
    expect(n3).toBeGreaterThan(n2);
    expect(n3).toBeGreaterThan(0.85);
  });

  it("ne redemande jamais le même mot deux fois de suite", () => {
    for (const level of LEVELS) {
      for (const session of sessions(level, 10)) {
        for (let i = 1; i < session.questions.length; i += 1) {
          expect(session.questions[i].entryIndex).not.toBe(session.questions[i - 1].entryIndex);
        }
      }
    }
  });

  it("garde la même grille pour toute la session", () => {
    const session = buildCodageSession(5, "officiel", 2);
    // La grille est un objet unique : les questions n'y réfèrent que par rang.
    for (const question of session.questions) {
      expect(question.entryIndex).toBeGreaterThanOrEqual(0);
      expect(question.entryIndex).toBeLessThan(session.grid.length);
    }
  });
});

describe("formats", () => {
  it("annonce le format officiel des sélections", () => {
    expect(CODAGE_FORMATS.officiel.size).toBe(45);
    expect(CODAGE_FORMATS.officiel.durationSeconds).toBe(150);
  });

  it("garde la cadence officielle sur le format court", () => {
    expect(CODAGE_FORMATS.court.durationSeconds / CODAGE_FORMATS.court.size).toBeCloseTo(
      CODAGE_PACE_SECONDS,
      5
    );
  });

  it("construit une session de la bonne longueur", () => {
    expect(buildCodageSession(3, "officiel", 1).questions).toHaveLength(45);
    expect(buildCodageSession(3, "court", 1).questions).toHaveLength(15);
  });

  it("décrit trois niveaux, de la grille de douze à celle de trente", () => {
    expect(CODAGE_LEVEL_LIST).toHaveLength(3);
    expect(CODAGE_LEVELS[1].size).toBe(12);
    expect(CODAGE_LEVELS[3].size).toBe(30);
  });
});

describe("notation", () => {
  const session = buildCodageSession(9, "court", 1);

  it("compte les bonnes réponses, la justesse et la plus longue série", () => {
    const answers = session.questions.map((q, i) =>
      i < 9 ? q.answerIndex : i < 12 ? (q.answerIndex + 1) % CODAGE_OPTIONS : null
    );
    const score = scoreCodageSession(session.questions, answers);
    expect(score.correct).toBe(9);
    expect(score.answered).toBe(12);
    expect(score.total).toBe(15);
    expect(score.bestStreak).toBe(9);
    // La précision compte les questions non traitées, la justesse non.
    expect(score.precision).toBe(60);
    expect(score.justesse).toBe(75);
  });

  it("ne crédite rien pour une session vide", () => {
    const score = scoreCodageSession(session.questions, []);
    expect(score.correct).toBe(0);
    expect(score.precision).toBe(0);
    expect(score.justesse).toBe(0);
  });

  it("nomme le mot auquel appartenait le code donné par erreur", () => {
    const entry = session.grid[3];
    expect(wordForCode(session.grid, entry.code)).toBe(entry.word);
    expect(wordForCode(session.grid, "0000")).toBeUndefined();
  });
});
