import { describe, expect, it } from "vitest";

import {
  adjacentPairs,
  allCells,
  buildTriangleSession,
  generateTrianglePuzzle,
  key,
  levelForPosition,
  pointsUp,
  scoreTriangleSession,
  TRIANGLE_FORMATS,
  TRIANGLE_LEVEL_LIST,
  TRIANGLE_LEVELS,
  TRIANGLE_PACE_SECONDS,
  TRIANGLE_RULES,
  type TriangleLevel,
  type TrianglePuzzle,
} from "@/lib/psychotech/triangles";

const LEVELS: TriangleLevel[] = [1, 2, 3];

function sample(level: TriangleLevel, count = 60): TrianglePuzzle[] {
  return Array.from({ length: count }, (_, i) => generateTrianglePuzzle(i * 173 + level, level));
}

describe("géométrie", () => {
  it("compte les cases d’une figure de côté n comme n²", () => {
    expect(allCells(4)).toHaveLength(16);
    expect(allCells(5)).toHaveLength(25);
  });

  it("alterne les pointes en haut et en bas le long d’une ligne", () => {
    const ligne = allCells(4).filter((cell) => cell.row === 2);
    expect(ligne.map((cell) => pointsUp(cell.col))).toEqual([true, false, true, false, true]);
  });

  it("n’assemble que des cases qui partagent une arête", () => {
    for (const [a, b] of adjacentPairs(4)) {
      // Un losange, c'est toujours une pointe en haut et une pointe en bas.
      expect(pointsUp(a.col)).not.toBe(pointsUp(b.col));
      const memeLigne = a.row === b.row && Math.abs(a.col - b.col) === 1;
      const dessous = b.row === a.row + 1 && b.col === a.col + 1;
      expect(memeLigne || dessous).toBe(true);
    }
  });

  it("propose les trois orientations de losange", () => {
    const pairs = adjacentPairs(4);
    expect(pairs.some(([a, b]) => a.row === b.row && b.col === a.col + 1)).toBe(true);
    expect(pairs.some(([a, b]) => a.row === b.row && b.col === a.col - 1)).toBe(true);
    expect(pairs.some(([a, b]) => b.row === a.row + 1)).toBe(true);
  });
});

describe("génération", () => {
  it("est déterministe pour une graine donnée", () => {
    expect(generateTrianglePuzzle(42, 2)).toEqual(generateTrianglePuzzle(42, 2));
    expect(generateTrianglePuzzle(42, 2)).not.toEqual(generateTrianglePuzzle(43, 2));
  });

  it("remplit toute la figure et propose quatre losanges", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        expect(Object.keys(puzzle.grid)).toHaveLength(puzzle.size * puzzle.size);
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.differences[puzzle.answerIndex]).toBe("");
      }
    }
  });

  it("donne à la bonne proposition exactement le contenu du trou", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const bonne = puzzle.options[puzzle.answerIndex];
        puzzle.hole.forEach((cell, i) => {
          expect(bonne.contents[i]).toEqual(puzzle.grid[key(cell.row, cell.col)]);
        });
      }
    }
  });

  it("n’offre jamais deux propositions identiques", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const signatures = puzzle.options.map((option) =>
          option.contents.map((c) => `${c.color}/${c.decor}`).join("|")
        );
        expect(new Set(signatures).size).toBe(4);
      }
    }
  });

  it("respecte la taille de figure annoncée par le niveau", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 20)) {
        expect(puzzle.size).toBe(TRIANGLE_LEVELS[level].size);
      }
    }
  });

  it("ne pose des marques qu’à partir du niveau 2", () => {
    for (const puzzle of sample(1, 20)) {
      expect(Object.values(puzzle.grid).every((cell) => cell.decor === 0)).toBe(true);
    }
    const avecMarques = sample(2, 20).filter((puzzle) =>
      Object.values(puzzle.grid).some((cell) => cell.decor > 0)
    );
    expect(avecMarques.length).toBeGreaterThan(0);
  });
});

describe("la figure obéit à une règle", () => {
  /** Retrouve la règle de couleur qui explique entièrement la figure. */
  function rulesExplaining(puzzle: TrianglePuzzle) {
    return TRIANGLE_RULES.filter((rule) => {
      if ((rule.minSize ?? 0) > puzzle.size) return false;
      const byClass = new Map<string, number>();
      return allCells(puzzle.size).every((cell) => {
        const name = rule.classOf(cell.row, cell.col, puzzle.size);
        const color = puzzle.grid[key(cell.row, cell.col)].color;
        const known = byClass.get(name);
        if (known === undefined) {
          byClass.set(name, color);
          return true;
        }
        return known === color;
      });
    });
  }

  it("colorie toujours selon l’une des règles annoncées", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        expect(rulesExplaining(puzzle).length).toBeGreaterThan(0);
      }
    }
  });

  it("nomme la règle en français dans la correction", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 20)) {
        expect(puzzle.rule.length).toBeGreaterThan(20);
        expect(puzzle.rule.endsWith(".")).toBe(true);
      }
    }
  });

  it("n’emploie dans les propositions que des couleurs présentes dans la figure", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const vues = new Set(Object.values(puzzle.grid).map((cell) => cell.color));
        for (const option of puzzle.options) {
          for (const content of option.contents) {
            // Une couleur absente de la figure s'écarterait sans réfléchir.
            expect(vues.has(content.color)).toBe(true);
          }
        }
      }
    }
  });

  it("emploie plusieurs couleurs — une figure unie ne se déduit pas", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const couleurs = new Set(Object.values(puzzle.grid).map((cell) => cell.color));
        expect(couleurs.size).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("le trou reste déductible", () => {
  it("laisse toujours une case sœur visible pour chaque case manquante", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        // Une règle qui explique la figure doit relier chaque case du trou à
        // au moins une case visible de même classe : sans cela, rien dans la
        // figure ne dit ce qui manque.
        const rules = TRIANGLE_RULES.filter((rule) => {
          if ((rule.minSize ?? 0) > puzzle.size) return false;
          const byClass = new Map<string, number>();
          return allCells(puzzle.size).every((cell) => {
            const name = rule.classOf(cell.row, cell.col, puzzle.size);
            const color = puzzle.grid[key(cell.row, cell.col)].color;
            const known = byClass.get(name);
            if (known === undefined) {
              byClass.set(name, color);
              return true;
            }
            return known === color;
          });
        });

        const deductible = rules.some((rule) =>
          puzzle.hole.every((cell) => {
            const target = rule.classOf(cell.row, cell.col, puzzle.size);
            return allCells(puzzle.size).some(
              (other) =>
                !puzzle.hole.some((h) => h.row === other.row && h.col === other.col) &&
                rule.classOf(other.row, other.col, puzzle.size) === target
            );
          })
        );
        expect(deductible).toBe(true);
      }
    }
  });

  it("laisse le trou dans la figure, sur deux cases adjacentes", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const pairs = adjacentPairs(puzzle.size);
        const trouve = pairs.some(
          ([a, b]) =>
            a.row === puzzle.hole[0].row &&
            a.col === puzzle.hole[0].col &&
            b.row === puzzle.hole[1].row &&
            b.col === puzzle.hole[1].col
        );
        expect(trouve).toBe(true);
      }
    }
  });

  it("explique en français ce qui cloche dans chaque mauvaise proposition", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 20)) {
        puzzle.differences.forEach((difference, i) => {
          if (i === puzzle.answerIndex) return;
          expect(difference.length).toBeGreaterThan(10);
        });
      }
    }
  });
});

describe("réserve de figures", () => {
  it("ne boucle pas sur une session officielle", () => {
    for (const level of LEVELS) {
      const vues = new Set<string>();
      for (let seed = 0; seed < 2000; seed += 1) {
        const puzzle = generateTrianglePuzzle(seed * 37 + 11, level);
        // Identité d'une question : la figure, la position du trou et l'ordre
        // des propositions.
        vues.add(
          Object.entries(puzzle.grid)
            .map(([k, v]) => `${k}=${v.color}.${v.decor}`)
            .join(",") +
            `|${puzzle.hole.map((c) => key(c.row, c.col)).join("-")}` +
            `|${puzzle.options.map((o) => o.contents.map((c) => `${c.color}.${c.decor}`).join("")).join("/")}`
        );
      }
      expect(vues.size).toBeGreaterThan(1800);
    }
  });
});

describe("formats et sessions", () => {
  it("annonce le format officiel des sélections", () => {
    expect(TRIANGLE_FORMATS.officiel.size).toBe(20);
    expect(TRIANGLE_FORMATS.officiel.durationSeconds).toBe(480);
  });

  it("garde la cadence officielle sur le format court", () => {
    expect(TRIANGLE_FORMATS.officiel.durationSeconds / TRIANGLE_FORMATS.officiel.size).toBe(
      TRIANGLE_PACE_SECONDS
    );
    expect(TRIANGLE_FORMATS.court.durationSeconds / TRIANGLE_FORMATS.court.size).toBe(
      TRIANGLE_PACE_SECONDS
    );
  });

  it("fait monter la difficulté par tiers", () => {
    expect(levelForPosition(0, 20)).toBe(1);
    expect(levelForPosition(9, 20)).toBe(2);
    expect(levelForPosition(19, 20)).toBe(3);
  });

  it("construit une session de la bonne longueur, sans répétition", () => {
    const session = buildTriangleSession(7, "officiel");
    expect(session).toHaveLength(20);
    expect(new Set(session.map((p) => p.id)).size).toBe(20);
  });

  it("décrit trois niveaux, du format officiel aux règles combinées", () => {
    expect(TRIANGLE_LEVEL_LIST).toHaveLength(3);
    expect(TRIANGLE_LEVELS[1].size).toBe(4);
    expect(TRIANGLE_LEVELS[1].decor).toBe(false);
    expect(TRIANGLE_LEVELS[3].decor).toBe(true);
  });
});

describe("notation", () => {
  const puzzles = buildTriangleSession(3, "court");

  it("compte les bonnes réponses et la plus longue série", () => {
    const answers = puzzles.map((p, i) => (i < 5 ? p.answerIndex : (p.answerIndex + 1) % 4));
    const score = scoreTriangleSession(puzzles, answers);
    expect(score.correct).toBe(5);
    expect(score.answered).toBe(8);
    expect(score.bestStreak).toBe(5);
  });

  it("ne crédite rien pour une session vide", () => {
    const score = scoreTriangleSession(puzzles, []);
    expect(score.correct).toBe(0);
    expect(score.precision).toBe(0);
  });
});
