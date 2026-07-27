import { describe, expect, it } from "vitest";

import {
  axialExtent,
  buildFormeSession,
  FORME_FORMATS,
  FORME_LEVEL_LIST,
  FORME_LEVELS,
  FORME_PACE_SECONDS,
  generateFormePuzzle,
  isConnectedAssembly,
  isRevolution,
  levelForPosition,
  noPieceHidden,
  pieceSignature,
  scoreFormeSession,
  setSignature,
  shapeDistance,
  SLIT_FACING,
  type FormeLevel,
  type FormePuzzle,
} from "@/lib/psychotech/formes";

const LEVELS: FormeLevel[] = [1, 2, 3];

function sample(level: FormeLevel, count = 60): FormePuzzle[] {
  return Array.from({ length: count }, (_, i) => generateFormePuzzle(i * 137 + level, level));
}

describe("génération", () => {
  it("est déterministe pour une graine donnée", () => {
    expect(generateFormePuzzle(42, 2)).toEqual(generateFormePuzzle(42, 2));
    expect(generateFormePuzzle(42, 2)).not.toEqual(generateFormePuzzle(43, 2));
  });

  it("propose toujours quatre jeux et une seule bonne réponse", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 40)) {
        expect(puzzle.options).toHaveLength(4);
        expect(puzzle.answerIndex).toBeGreaterThanOrEqual(0);
        expect(puzzle.answerIndex).toBeLessThan(4);
        expect(puzzle.differences[puzzle.answerIndex]).toBe("");
      }
    }
  });

  it("donne à l’assemblage le nombre de pièces annoncé par le niveau", () => {
    for (const level of LEVELS) {
      const attendu = FORME_LEVELS[level].pieces;
      for (const puzzle of sample(level, 30)) {
        expect(puzzle.assembly).toHaveLength(attendu);
        for (const option of puzzle.options) expect(option).toHaveLength(attendu);
      }
    }
  });

  it("montre exactement les pièces du bon jeu dans l’assemblage", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 40)) {
        const montre = setSignature(puzzle.assembly.map((p) => p.piece));
        expect(setSignature(puzzle.options[puzzle.answerIndex])).toBe(montre);
      }
    }
  });
});

describe("une seule réponse défendable", () => {
  it("n’offre jamais deux jeux identiques", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 40)) {
        const signatures = puzzle.options.map(setSignature);
        expect(new Set(signatures).size).toBe(4);
      }
    }
  });

  it("écarte chaque mauvais jeu d’au moins la distance exigée par le niveau", () => {
    for (const level of LEVELS) {
      const { minDistance } = FORME_LEVELS[level];
      for (const puzzle of sample(level, 40)) {
        const vrai = puzzle.options[puzzle.answerIndex];
        puzzle.options.forEach((option, index) => {
          if (index === puzzle.answerIndex) return;
          // Un distracteur diffère par une pièce et une seule.
          const differentes = option.filter(
            (piece, i) => pieceSignature(piece) !== pieceSignature(vrai[i])
          );
          expect(differentes).toHaveLength(1);
          const i = option.findIndex(
            (piece, j) => pieceSignature(piece) !== pieceSignature(vrai[j])
          );
          expect(shapeDistance(vrai[i], option[i])).toBeGreaterThanOrEqual(minDistance);
        });
      }
    }
  });

  it("explique en français ce qui cloche dans chaque mauvais jeu", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 20)) {
        puzzle.differences.forEach((difference, index) => {
          if (index === puzzle.answerIndex) return;
          expect(difference.length).toBeGreaterThan(10);
        });
      }
    }
  });
});

describe("imbrication", () => {
  it("n’avale jamais une pièce dans une autre", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 40)) {
        expect(noPieceHidden(puzzle.assembly)).toBe(true);
      }
    }
  });

  it("tient l’assemblage d’un seul tenant", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 40)) {
        expect(isConnectedAssembly(puzzle.assembly)).toBe(true);
      }
    }
  });

  it("enfile les pièces de révolution sur un axe commun, en les chevauchant", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const enfilees = puzzle.assembly.filter((p) => isRevolution(p.piece.kind));
        expect(enfilees.length).toBeGreaterThanOrEqual(2);
        for (const { pose } of enfilees) {
          // Sur l'axe X : rien ne dévie latéralement.
          expect(pose.position[1]).toBe(0);
          expect(pose.position[2]).toBe(0);
        }
        const tries = [...enfilees].sort((a, b) => a.pose.position[0] - b.pose.position[0]);
        for (let i = 1; i < tries.length; i += 1) {
          const gap = tries[i].pose.position[0] - tries[i - 1].pose.position[0];
          const demi = (axialExtent(tries[i].piece) + axialExtent(tries[i - 1].piece)) / 2;
          expect(gap).toBeLessThan(demi);
        }
      }
    }
  });

  it("fait traverser l’enfilade par des barres plus longues qu’elle", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        const barres = puzzle.assembly.filter((p) => !isRevolution(p.piece.kind));
        const enfilees = puzzle.assembly.filter((p) => isRevolution(p.piece.kind));
        const etendue = enfilees.reduce(
          (max, p) => Math.max(max, Math.abs(p.pose.position[0]) + axialExtent(p.piece) / 2),
          0
        );
        for (const { piece } of barres) {
          expect(piece.radius).toBeGreaterThan(etendue);
        }
      }
    }
  });

  it("garde l’entaille tournée vers l’observateur, à tous les niveaux", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        for (const { pose } of puzzle.assembly.filter((p) => isRevolution(p.piece.kind))) {
          // Au-delà d'un radian d'écart, le creux passerait derrière la pièce
          // et deux jeux deviendraient également défendables.
          expect(Math.abs(pose.rotation[0] - SLIT_FACING)).toBeLessThanOrEqual(1.01);
        }
      }
    }
  });

  it("ne bascule l’assemblage qu’en lacet au niveau 1, dans les trois axes ensuite", () => {
    for (const puzzle of sample(1, 20)) {
      expect(puzzle.tilt[0]).toBe(0);
      expect(puzzle.tilt[2]).toBe(0);
    }
    const libres = sample(3, 20);
    expect(libres.filter((p) => Math.abs(p.tilt[0]) > 0.05).length).toBeGreaterThan(0);
    expect(libres.filter((p) => Math.abs(p.tilt[2]) > 0.05).length).toBeGreaterThan(0);
  });
});

describe("réserve d’assemblages", () => {
  it("ne boucle pas sur une session officielle", () => {
    for (const level of LEVELS) {
      const vus = new Set<string>();
      for (let seed = 0; seed < 3000; seed += 1) {
        const puzzle = generateFormePuzzle(seed * 31 + 5, level);
        vus.add(setSignature(puzzle.options[puzzle.answerIndex]));
      }
      // Très au-delà des 20 questions du format officiel.
      expect(vus.size).toBeGreaterThan(1500);
    }
  });
});

describe("formats et sessions", () => {
  it("annonce le format officiel des sélections", () => {
    expect(FORME_FORMATS.officiel.size).toBe(20);
    expect(FORME_FORMATS.officiel.durationSeconds).toBe(480);
  });

  it("garde la cadence officielle sur le format court", () => {
    expect(FORME_FORMATS.officiel.durationSeconds / FORME_FORMATS.officiel.size).toBe(
      FORME_PACE_SECONDS
    );
    expect(FORME_FORMATS.court.durationSeconds / FORME_FORMATS.court.size).toBe(FORME_PACE_SECONDS);
  });

  it("fait monter la difficulté par tiers", () => {
    expect(levelForPosition(0, 20)).toBe(1);
    expect(levelForPosition(9, 20)).toBe(2);
    expect(levelForPosition(19, 20)).toBe(3);
  });

  it("construit une session de la bonne longueur, sans répétition", () => {
    const session = buildFormeSession(7, "officiel");
    expect(session).toHaveLength(20);
    expect(new Set(session.map((p) => p.id)).size).toBe(20);
  });

  it("décrit trois niveaux, du plus franc au plus fin", () => {
    expect(FORME_LEVEL_LIST).toHaveLength(3);
    expect(FORME_LEVELS[1].pieces).toBeLessThan(FORME_LEVELS[3].pieces);
    expect(FORME_LEVELS[1].minDistance).toBeGreaterThan(FORME_LEVELS[3].minDistance);
  });
});

describe("notation", () => {
  const puzzles = buildFormeSession(3, "court");

  it("compte les bonnes réponses et la plus longue série", () => {
    const answers = puzzles.map((p, i) => (i < 5 ? p.answerIndex : (p.answerIndex + 1) % 4));
    const score = scoreFormeSession(puzzles, answers);
    expect(score.correct).toBe(5);
    expect(score.answered).toBe(8);
    expect(score.bestStreak).toBe(5);
  });

  it("ne crédite rien pour une session vide", () => {
    const score = scoreFormeSession(puzzles, []);
    expect(score.correct).toBe(0);
    expect(score.precision).toBe(0);
  });

  it("rapporte la précision sur l’ensemble des questions", () => {
    const answers = puzzles.map((p) => p.answerIndex);
    expect(scoreFormeSession(puzzles, answers).precision).toBe(100);
  });
});
