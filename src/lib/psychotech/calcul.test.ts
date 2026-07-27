import { describe, expect, it } from "vitest";

import {
  buildCalcSession,
  CALC_FORMAT_LIST,
  CALC_FORMATS,
  CALC_PACE_SECONDS,
  CALC_THEMES,
  fmt,
  generateCalcQuestion,
  levelAt,
  questionAt,
  scoreCalcSession,
  type CalcLevel,
  type CalcQuestion,
  type CalcTheme,
} from "@/lib/psychotech/calcul";

const LEVELS: CalcLevel[] = [1, 2, 3];
const THEMES = CALC_THEMES.map((t) => t.theme);

function sample(theme: CalcTheme, level: CalcLevel, count = 80): CalcQuestion[] {
  return Array.from({ length: count }, (_, i) =>
    generateCalcQuestion(i * 53 + level, theme, level)
  );
}

/** Convertit « 12,5 » en 12.5 — l'inverse de `fmt`. */
function parse(text: string): number {
  return Number(text.replace(",", "."));
}

describe("écriture des nombres", () => {
  it("écrit la virgule à la française et n’aligne pas de décimales inutiles", () => {
    expect(fmt(12.5)).toBe("12,5");
    expect(fmt(30)).toBe("30");
    expect(fmt(-4.25)).toBe("-4,25");
  });

  it("absorbe les artefacts de virgule flottante", () => {
    expect(fmt(0.1 + 0.2)).toBe("0,3");
  });
});

describe("génération des questions", () => {
  it.each(THEMES)("thème %s : quatre propositions distinctes à chaque niveau", (theme) => {
    for (const level of LEVELS) {
      for (const question of sample(theme, level, 40)) {
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
      }
    }
  });

  it.each(THEMES)("thème %s : la bonne réponse est bien dans les propositions", (theme) => {
    for (const level of LEVELS) {
      for (const question of sample(theme, level, 40)) {
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(4);
      }
    }
  });

  it.each(THEMES)("thème %s : un énoncé et une méthode, toujours", (theme) => {
    for (const level of LEVELS) {
      for (const question of sample(theme, level, 30)) {
        expect(question.prompt.length).toBeGreaterThan(5);
        expect(question.method.length).toBeGreaterThan(15);
      }
    }
  });

  it("donne la même question pour la même graine, une autre sinon", () => {
    expect(generateCalcQuestion(77, "multiplication", 2)).toEqual(
      generateCalcQuestion(77, "multiplication", 2)
    );
    expect(generateCalcQuestion(77, "multiplication", 2)).not.toEqual(
      generateCalcQuestion(78, "multiplication", 2)
    );
  });

  it("fait piocher « tout mélangé » dans plusieurs thèmes réels", () => {
    const themes = new Set(sample("melange", 2, 120).map((q) => q.theme));
    expect(themes.size).toBeGreaterThan(4);
    expect(themes.has("melange" as never)).toBe(false);
  });
});

describe("justesse des calculs", () => {
  it("additions et soustractions : la proposition juste est le vrai résultat", () => {
    for (const question of sample("addition-soustraction", 1, 60)) {
      const [, a, sign, b] = /^(-?[\d,]+) ([+−]) (-?[\d,]+) = \?$/.exec(question.prompt) ?? [];
      const expected = sign === "+" ? parse(a) + parse(b) : parse(a) - parse(b);
      expect(parse(question.choices[question.correctIndex])).toBeCloseTo(expected, 3);
    }
  });

  it("multiplications de niveau 1 : le produit exact", () => {
    for (const question of sample("multiplication", 1, 60)) {
      const [, a, b] = /^(\d+) × (\d+) = \?$/.exec(question.prompt) ?? [];
      expect(parse(question.choices[question.correctIndex])).toBe(Number(a) * Number(b));
    }
  });

  it("divisions de niveau 1 : le quotient exact, jamais un reste", () => {
    for (const question of sample("division", 1, 60)) {
      const [, a, b] = /^(\d+) ÷ (\d+) = \?$/.exec(question.prompt) ?? [];
      const quotient = Number(a) / Number(b);
      expect(Number.isInteger(quotient)).toBe(true);
      expect(parse(question.choices[question.correctIndex])).toBe(quotient);
    }
  });

  it("fractions de niveau 1 : la fraction tombe juste", () => {
    for (const question of sample("fractions-pourcentages", 1, 60)) {
      const [, num, den, base] = /^(\d+)\/(\d+) de (\d+) = \?$/.exec(question.prompt) ?? [];
      const expected = (Number(base) * Number(num)) / Number(den);
      expect(Number.isInteger(expected)).toBe(true);
      expect(parse(question.choices[question.correctIndex])).toBe(expected);
    }
  });

  it("hausses puis baisses : le piège de l’addition des pourcentages est bien posé", () => {
    for (const question of sample("fractions-pourcentages", 3, 40)) {
      const [, base, up, down] =
        /^(\d+), augmenté de (\d+) % puis diminué de (\d+) % = \?$/.exec(question.prompt) ?? [];
      const expected = Number(base) * (1 + Number(up) / 100) * (1 - Number(down) / 100);
      expect(parse(question.choices[question.correctIndex])).toBeCloseTo(expected, 2);
      // Le naïf « +up −down » figure parmi les propositions quand il diffère.
      const naive = Number(base) * (1 + (Number(up) - Number(down)) / 100);
      if (Math.abs(naive - expected) > 0.01) {
        expect(question.choices.map(parse).some((v) => Math.abs(v - naive) < 0.01)).toBe(true);
      }
    }
  });
});

describe("grilles 3×3", () => {
  it("porte une grille cohérente, avec une seule case vide", () => {
    for (const level of LEVELS) {
      for (const question of sample("matrices", level, 50)) {
        const grid = question.grid;
        expect(grid).toBeDefined();
        if (!grid) continue;
        expect(grid.cells).toHaveLength(9);
        expect(grid.cells.filter((c) => c === null)).toHaveLength(1);
        expect(grid.cells[grid.missingIndex]).toBeNull();
      }
    }
  });

  it("les totaux affichés correspondent vraiment aux nombres, case cherchée comprise", () => {
    for (const level of LEVELS) {
      for (const question of sample("matrices", level, 50)) {
        const grid = question.grid;
        if (!grid) continue;
        const answer = parse(question.choices[question.correctIndex]);
        const full = grid.cells.map((c, i) => (i === grid.missingIndex ? answer : (c as number)));
        grid.rowTotals.forEach((total, r) => {
          if (total === null) return;
          expect(full[r * 3] + full[r * 3 + 1] + full[r * 3 + 2]).toBeCloseTo(total, 3);
        });
        grid.colTotals.forEach((total, c) => {
          if (total === null) return;
          expect(full[c] + full[c + 3] + full[c + 6]).toBeCloseTo(total, 3);
        });
      }
    }
  });

  it("laisse toujours un chemin de résolution : ligne ou colonne", () => {
    for (const level of LEVELS) {
      for (const question of sample("matrices", level, 50)) {
        const grid = question.grid;
        if (!grid) continue;
        const row = Math.floor(grid.missingIndex / 3);
        const col = grid.missingIndex % 3;
        expect(grid.rowTotals[row] !== null || grid.colTotals[col] !== null).toBe(true);
      }
    }
  });

  it("coupe le raccourci de la ligne au niveau 3", () => {
    for (const question of sample("matrices", 3, 40)) {
      const grid = question.grid;
      if (!grid) continue;
      const row = Math.floor(grid.missingIndex / 3);
      expect(grid.rowTotals[row]).toBeNull();
      expect(grid.colTotals[grid.missingIndex % 3]).not.toBeNull();
    }
  });

  it("n’en met pas dans les autres thèmes", () => {
    for (const question of sample("multiplication", 2, 20)) {
      expect(question.grid).toBeUndefined();
    }
  });
});

describe("ordres de grandeur", () => {
  it("écarte assez les propositions pour que seul l’encadrement tranche", () => {
    for (const level of LEVELS) {
      for (const question of sample("ordres-de-grandeur", level, 60)) {
        const values = question.choices.map(parse).sort((a, b) => a - b);
        for (let i = 1; i < values.length; i += 1) {
          const ratio =
            Math.abs(values[i] - values[i - 1]) / Math.max(1e-6, Math.abs(values[i - 1]));
          expect(ratio).toBeGreaterThan(0.3);
        }
      }
    }
  });

  it("propose des nombres ronds — on estime, on ne calcule pas au millième", () => {
    for (const level of LEVELS) {
      for (const question of sample("ordres-de-grandeur", level, 60)) {
        for (const choice of question.choices) {
          expect(choice.split(",")[1]?.length ?? 0).toBeLessThanOrEqual(1);
        }
        // L'énoncé ne doit pas être plus précis que la réponse attendue.
        for (const number of question.prompt.match(/\d+,\d+/g) ?? []) {
          expect(number.split(",")[1].length).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("pose la question en approximation, pas en résultat exact", () => {
    for (const question of sample("ordres-de-grandeur", 1, 20)) {
      expect(question.prompt).toContain("≈");
    }
  });
});

describe("calculs du métier", () => {
  it("convertit les nœuds avec le facteur consigné dans les fiches", () => {
    for (const question of sample("metier", 1, 120)) {
      const [, kt] = /^(\d+) kt en km\/h ≈ \?$/.exec(question.prompt) ?? [];
      if (!kt) continue;
      expect(parse(question.choices[question.correctIndex])).toBeCloseTo(Number(kt) * 1.852, 2);
    }
  });

  it("convertit les pieds avec le facteur consigné dans les fiches", () => {
    for (const question of sample("metier", 1, 120)) {
      const [, ft] = /^(\d+) ft en mètres ≈ \?$/.exec(question.prompt) ?? [];
      if (!ft) continue;
      expect(parse(question.choices[question.correctIndex])).toBeCloseTo(Number(ft) * 0.3048, 2);
    }
  });

  it("présente les règles d’estimation comme des approximations", () => {
    const questions = sample("metier", 3, 60);
    const estimates = questions.filter(
      (q) => q.prompt.includes("1 en 60") || q.prompt.includes("3°")
    );
    expect(estimates.length).toBeGreaterThan(0);
    for (const question of estimates) {
      expect(question.method.toLowerCase()).toContain("approximation");
    }
  });
});

describe("formats et sessions", () => {
  it("annonce le format officiel des sélections", () => {
    expect(CALC_FORMATS.officiel.size).toBe(24);
    expect(CALC_FORMATS.officiel.durationSeconds).toBe(480);
  });

  it("garde la cadence officielle sur les formats courts", () => {
    expect(CALC_FORMATS.court.durationSeconds).toBe(10 * CALC_PACE_SECONDS);
    expect(CALC_FORMATS.standard.durationSeconds).toBe(20 * CALC_PACE_SECONDS);
  });

  it("ne chronomètre pas le format sans fin, et ne lui fixe pas de taille", () => {
    expect(CALC_FORMATS.illimite.durationSeconds).toBeNull();
    expect(CALC_FORMATS.illimite.size).toBeNull();
    expect(buildCalcSession(1, "multiplication", 2, "illimite")).toEqual([]);
  });

  it("propose les quatre longueurs", () => {
    expect(CALC_FORMAT_LIST.map((f) => f.key)).toEqual([
      "court",
      "standard",
      "officiel",
      "illimite",
    ]);
  });

  it("compose une session de la bonne taille", () => {
    expect(buildCalcSession(3, "division", 1, "officiel")).toHaveLength(24);
    expect(buildCalcSession(3, "division", 1, "court")).toHaveLength(10);
  });

  it("tient le niveau demandé quand il est fixe", () => {
    for (const question of buildCalcSession(3, "division", 2, "officiel")) {
      expect(question.level).toBe(2);
    }
  });

  it("monte en difficulté quand le niveau est progressif", () => {
    const session = buildCalcSession(3, "melange", "progressif", "officiel");
    expect(session[0].level).toBe(1);
    expect(session[12].level).toBe(2);
    expect(session[23].level).toBe(3);
  });

  it("monte aussi par paliers dans le format sans fin", () => {
    expect(levelAt(0, null)).toBe(1);
    expect(levelAt(12, null)).toBe(2);
    expect(levelAt(25, null)).toBe(3);
    expect(levelAt(300, null)).toBe(3);
  });

  it("fabrique les questions sans fin à la demande, de façon stable", () => {
    const a = questionAt(42, 137, "melange", "progressif", null);
    const b = questionAt(42, 137, "melange", "progressif", null);
    expect(a).toEqual(b);
    expect(a).not.toEqual(questionAt(42, 138, "melange", "progressif", null));
  });

  it("rejoue la même session pour la même graine", () => {
    expect(buildCalcSession(2026, "melange", "progressif", "court")).toEqual(
      buildCalcSession(2026, "melange", "progressif", "court")
    );
  });
});

describe("notation", () => {
  const questions = buildCalcSession(11, "multiplication", 1, "court");

  it("compte les justes, les traitées et la précision sur les traitées", () => {
    const answers = questions.map((q, i) => (i < 6 ? q.correctIndex : null));
    const score = scoreCalcSession(questions, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(6);
    expect(score.answered).toBe(6);
    expect(score.precision).toBe(100);
  });

  it("mesure la précision sur ce qu’on a répondu, pas sur ce qu’on a sauté", () => {
    const answers = questions.map((q, i) =>
      i < 4 ? q.correctIndex : i < 8 ? (q.correctIndex + 1) % 4 : null
    );
    const score = scoreCalcSession(questions, answers);
    expect(score.answered).toBe(8);
    expect(score.correct).toBe(4);
    expect(score.precision).toBe(50);
  });

  it("retient la plus longue série de bonnes réponses", () => {
    const answers = questions.map((q, i) =>
      [0, 1, 2, 5, 6, 7, 8].includes(i) ? q.correctIndex : (q.correctIndex + 1) % 4
    );
    expect(scoreCalcSession(questions, answers).bestStreak).toBe(4);
  });

  it("ne crédite rien pour une session vide", () => {
    const score = scoreCalcSession(questions, []);
    expect(score.correct).toBe(0);
    expect(score.precision).toBe(0);
    expect(score.bestStreak).toBe(0);
  });
});

/**
 * Le format « sans fin » invite à enchaîner 150 à 200 questions. Un thème dont
 * la réserve d'énoncés distincts se compterait en quelques centaines
 * s'épuiserait avant la fin d'une seule session — d'où ce plancher, mesuré et
 * non supposé. Les fourchettes de tirage ne doivent jamais rétrécir en silence.
 */
describe("réserve d’énoncés", () => {
  const DRAWS = 4000;
  const FLOOR = 600;

  function distinctPrompts(theme: CalcTheme, level: CalcLevel): number {
    const seen = new Set<string>();
    for (let seed = 0; seed < DRAWS; seed += 1) {
      const q = generateCalcQuestion(seed * 1000 + 7, theme, level);
      seen.add(`${q.prompt}|${JSON.stringify(q.grid ?? null)}|${q.choices[q.correctIndex]}`);
    }
    return seen.size;
  }

  for (const theme of THEMES) {
    for (const level of LEVELS) {
      it(`garde plus de ${FLOOR} énoncés distincts — ${theme} niveau ${level}`, () => {
        expect(distinctPrompts(theme, level)).toBeGreaterThan(FLOOR);
      });
    }
  }
});
