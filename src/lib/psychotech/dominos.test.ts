import { describe, expect, it } from "vitest";

import {
  buildDominoSession,
  DOMINO_LEVEL_LIST,
  DOMINO_LEVELS,
  EMPTY_ANSWER,
  generateDominoPuzzle,
  isComplete,
  makeDomino,
  mod7,
  sameDomino,
  scoreDominoSession,
  verdictFor,
  type DominoLevel,
  type DominoPuzzle,
} from "@/lib/psychotech/dominos";

const LEVELS: DominoLevel[] = [1, 2, 3];

/** Un échantillon large : les défauts de génération sont rares par nature. */
function sample(level: DominoLevel, count = 150): DominoPuzzle[] {
  return Array.from({ length: count }, (_, i) => generateDominoPuzzle(i * 31 + level, level));
}

describe("arithmétique du domino", () => {
  it("ramène toute valeur dans 0–6, le blanc suivant le 6", () => {
    expect(mod7(7)).toBe(0);
    expect(mod7(-1)).toBe(6);
    expect(mod7(13)).toBe(6);
    expect(mod7(0)).toBe(0);
  });

  it("normalise les deux moitiés à la construction", () => {
    expect(makeDomino(8, -2)).toEqual({ top: 1, bottom: 5 });
  });

  it("ne confond pas un domino et son inverse", () => {
    expect(sameDomino(makeDomino(2, 5), makeDomino(2, 5))).toBe(true);
    expect(sameDomino(makeDomino(2, 5), makeDomino(5, 2))).toBe(false);
  });
});

describe("génération des séries", () => {
  it.each(LEVELS)("niveau %i : toutes les moitiés restent dans 0–6", (level) => {
    for (const puzzle of sample(level)) {
      for (const tile of puzzle.tiles) {
        expect(tile.top).toBeGreaterThanOrEqual(0);
        expect(tile.top).toBeLessThanOrEqual(6);
        expect(tile.bottom).toBeGreaterThanOrEqual(0);
        expect(tile.bottom).toBeLessThanOrEqual(6);
      }
    }
  });

  it.each(LEVELS)("niveau %i : autant de placements que de tuiles", (level) => {
    for (const puzzle of sample(level)) {
      expect(puzzle.places).toHaveLength(puzzle.tiles.length);
    }
  });

  it.each(LEVELS)("niveau %i : la solution est bien la tuile masquée", (level) => {
    for (const puzzle of sample(level)) {
      expect(puzzle.solution).toEqual(puzzle.tiles[puzzle.missingIndex]);
    }
  });

  it.each(LEVELS)("niveau %i : la première tuile n'est jamais masquée", (level) => {
    for (const puzzle of sample(level)) {
      expect(puzzle.missingIndex).toBeGreaterThan(0);
    }
  });

  it.each(LEVELS)("niveau %i : au moins trois tuiles visibles avant de conclure", (level) => {
    for (const puzzle of sample(level)) {
      const visible = puzzle.tiles.length - 1;
      expect(visible).toBeGreaterThanOrEqual(4);
    }
  });

  it.each(LEVELS)("niveau %i : les liens dessinés pointent des tuiles existantes", (level) => {
    for (const puzzle of sample(level)) {
      for (const [a, b] of puzzle.edges) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThan(puzzle.tiles.length);
        expect(a).not.toBe(b);
      }
    }
  });

  it("laisse ligne et grille sans liens — l'ordre y est conventionnel", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 60)) {
        if (puzzle.layout === "ligne" || puzzle.layout === "grille") {
          expect(puzzle.edges).toHaveLength(0);
        }
      }
    }
  });

  it("relie toujours les dispositions non conventionnelles", () => {
    for (const puzzle of sample(3, 200)) {
      if (puzzle.layout === "spirale" || puzzle.layout === "branche") {
        expect(puzzle.edges.length).toBeGreaterThan(0);
      }
    }
  });

  it("n'associe l'arbre qu'à la règle entrelacée", () => {
    for (const puzzle of sample(3, 200)) {
      if (puzzle.layout === "branche") {
        expect(puzzle.rule).toContain("entrelacées");
      }
    }
  });

  it("ne place jamais deux tuiles au même endroit", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 80)) {
        const keys = puzzle.places.map((p) => `${p.x}:${p.y}`);
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });

  it("donne la même série pour la même graine, une autre pour une autre", () => {
    expect(generateDominoPuzzle(4242, 2)).toEqual(generateDominoPuzzle(4242, 2));
    expect(generateDominoPuzzle(4242, 2)).not.toEqual(generateDominoPuzzle(4243, 2));
  });

  it("explique toujours la règle — la correction doit apprendre quelque chose", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 60)) {
        expect(puzzle.rule.length).toBeGreaterThan(20);
      }
    }
  });

  it("monte en complexité de disposition avec le niveau", () => {
    const l1 = new Set(sample(1, 120).map((p) => p.layout));
    const l3 = new Set(sample(3, 120).map((p) => p.layout));
    expect([...l1].every((k) => k === "ligne" || k === "grille")).toBe(true);
    expect(l3.has("spirale") || l3.has("branche")).toBe(true);
  });
});

describe("composition d'une session", () => {
  it.each(LEVELS)("niveau %i : dix séries", (level) => {
    expect(buildDominoSession(7, level)).toHaveLength(DOMINO_LEVELS[level].size);
  });

  it("ne sert pas deux fois la même série dans une session", () => {
    for (const level of LEVELS) {
      const session = buildDominoSession(99, level);
      const keys = session.map((p) => p.tiles.map((t) => `${t.top}${t.bottom}`).join("-"));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("rejoue la même session pour la même graine", () => {
    expect(buildDominoSession(2026, 3)).toEqual(buildDominoSession(2026, 3));
  });

  it("annonce trois niveaux, dix questions chacun, de plus en plus de temps", () => {
    expect(DOMINO_LEVEL_LIST).toHaveLength(3);
    expect(DOMINO_LEVEL_LIST.map((l) => l.size)).toEqual([10, 10, 10]);
    const durations = DOMINO_LEVEL_LIST.map((l) => l.durationSeconds);
    expect(durations[0]).toBeLessThan(durations[1]);
    expect(durations[1]).toBeLessThan(durations[2]);
  });
});

describe("notation", () => {
  const solution = makeDomino(3, 5);

  it("ne compte juste qu'un domino dont les deux moitiés sont bonnes", () => {
    expect(verdictFor({ top: 3, bottom: 5 }, solution).correct).toBe(true);
    expect(verdictFor({ top: 3, bottom: 4 }, solution).correct).toBe(false);
    expect(verdictFor({ top: 5, bottom: 3 }, solution).correct).toBe(false);
  });

  it("dit tout de même quelle moitié était juste", () => {
    const verdict = verdictFor({ top: 3, bottom: 4 }, solution);
    expect(verdict.topOk).toBe(true);
    expect(verdict.bottomOk).toBe(false);
  });

  it("ne tient pas une réponse partielle pour donnée", () => {
    expect(isComplete({ top: 3, bottom: null })).toBe(false);
    expect(isComplete(EMPTY_ANSWER)).toBe(false);
    expect(isComplete({ top: 0, bottom: 0 })).toBe(true);
  });

  it("compte les dominos justes, les moitiés justes et les séries traitées", () => {
    const puzzles = buildDominoSession(5, 1);
    const answers = puzzles.map((p, i) =>
      i < 6 ? { top: p.solution.top, bottom: p.solution.bottom } : EMPTY_ANSWER
    );
    const score = scoreDominoSession(puzzles, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(6);
    expect(score.answered).toBe(6);
    expect(score.precision).toBe(60);
    expect(score.halvesCorrect).toBeGreaterThanOrEqual(12);
  });

  it("ne crédite rien pour une session laissée vide", () => {
    const puzzles = buildDominoSession(5, 2);
    const score = scoreDominoSession(puzzles, []);
    expect(score.correct).toBe(0);
    expect(score.answered).toBe(0);
    expect(score.precision).toBe(0);
  });
});
