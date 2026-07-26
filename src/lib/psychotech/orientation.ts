/**
 * Test d'orientation spatiale (sélections type EOPN/SPEP).
 *
 * Le candidat lit un instrument (horizon artificiel + compas) donnant une
 * ATTITUDE — cap, assiette, inclinaison — et choisit, parmi cinq vues d'un
 * aéronef, celle dont l'attitude correspond. Ce module est la LOGIQUE PURE :
 * génération déterministe par graine (rejouable, testable, infinie), sans
 * aucun rendu. Le rendu 3D (Three.js) vit dans
 * `src/features/psychotech/orientation-test.tsx`.
 *
 * Une attitude tient en trois nombres, donc les combinaisons sont quasi
 * infinies : chaque question tire une attitude cible au hasard, plus quatre
 * distracteurs qui reproduisent les confusions classiques (inclinaison
 * inversée, cap réciproque, assiette inversée…).
 */

import { createRng, seededShuffle } from "@/features/quiz/engine";

export type OrientationModel = "jet" | "biplane";

export interface Attitude {
  /** Cap / direction du nez, 0-359°. */
  cap: number;
  /** Assiette : + = montée (nez haut), − = descente. Degrés. */
  pitch: number;
  /** Inclinaison / roulis : + = virage à droite, − à gauche. Degrés. */
  roll: number;
}

export interface OrientationQuestion {
  id: string;
  difficulty: 1 | 2 | 3;
  model: OrientationModel;
  /** Attitude affichée par l'instrument (la bonne réponse). */
  target: Attitude;
  /** Cinq attitudes proposées (dont la cible), ordre mélangé. */
  choices: Attitude[];
  correctIndex: number;
}

export const ORIENTATION_SESSION_SIZE = 27;
export const ORIENTATION_DURATION_SECONDS = 7 * 60;

const MODELS: OrientationModel[] = ["jet", "biplane"];

function intFrom(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[intFrom(rng, 0, items.length - 1)];
}

/** Écart circulaire minimal entre deux caps (0-180). */
export function capDelta(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}

/**
 * Deux attitudes sont « confondables » (donc ambiguës comme choix distincts)
 * si leurs trois composantes sont toutes proches. On les écarte pour garantir
 * une seule bonne réponse évidente.
 */
export function attitudesConfusable(a: Attitude, b: Attitude): boolean {
  return (
    capDelta(a.cap, b.cap) < 25 &&
    Math.abs(a.pitch - b.pitch) < 15 &&
    Math.abs(a.roll - b.roll) < 20
  );
}

function clampRoll(v: number): number {
  return Math.max(-90, Math.min(90, v));
}
function clampPitch(v: number): number {
  return Math.max(-55, Math.min(55, v));
}

/** Génère une question déterministe (famille orientation). */
export function generateOrientationQuestion(
  seed: number,
  difficulty: 1 | 2 | 3
): OrientationQuestion {
  const rng = createRng(seed);
  const model = pick(rng, MODELS);

  // Attitude cible — amplitude croissante avec la difficulté.
  let target: Attitude;
  if (difficulty === 1) {
    target = {
      cap: pick(rng, [0, 45, 90, 135, 180, 225, 270, 315]),
      pitch: pick(rng, [-20, 0, 20]),
      roll: pick(rng, [-45, -30, 0, 30, 45]),
    };
  } else if (difficulty === 2) {
    target = {
      cap: intFrom(rng, 0, 23) * 15,
      pitch: pick(rng, [-35, -20, 0, 20, 35]),
      roll: pick(rng, [-70, -45, -30, 30, 45, 70]),
    };
  } else {
    target = {
      cap: intFrom(rng, 0, 71) * 5,
      pitch: intFrom(rng, -9, 9) * 5,
      roll: intFrom(rng, -18, 18) * 5,
    };
  }

  // Pool de distracteurs = confusions classiques du test.
  const transforms: ((t: Attitude) => Attitude)[] = [
    (t) => ({ ...t, roll: clampRoll(-t.roll) }), // roulis inversé
    (t) => ({ ...t, pitch: clampPitch(-t.pitch) }), // assiette inversée
    (t) => ({ ...t, cap: (t.cap + 180) % 360 }), // cap réciproque
    (t) => ({ ...t, cap: (t.cap + 90) % 360 }), // cap +90
    (t) => ({ ...t, cap: (t.cap + 270) % 360 }), // cap −90
    (t) => ({ ...t, pitch: clampPitch(-t.pitch), roll: clampRoll(-t.roll) }), // les deux inversés
    (t) => ({ ...t, cap: (t.cap + 180) % 360, roll: clampRoll(-t.roll) }),
    (t) => ({ ...t, roll: clampRoll(t.roll >= 0 ? t.roll - 60 : t.roll + 60) }),
    (t) => ({ ...t, pitch: clampPitch(t.pitch >= 0 ? t.pitch - 40 : t.pitch + 40) }),
  ];

  const order = seededShuffle(
    transforms.map((_, i) => i),
    seed + 101
  );
  const distractors: Attitude[] = [];
  for (const idx of order) {
    if (distractors.length >= 4) break;
    const cand = transforms[idx](target);
    if (attitudesConfusable(cand, target)) continue;
    if (distractors.some((d) => attitudesConfusable(cand, d))) continue;
    distractors.push(cand);
  }
  // Filet de sécurité : compléter avec des décalages de cap si besoin.
  let extra = 60;
  while (distractors.length < 4) {
    const cand: Attitude = { ...target, cap: (target.cap + extra) % 360 };
    if (
      !attitudesConfusable(cand, target) &&
      !distractors.some((d) => attitudesConfusable(cand, d))
    ) {
      distractors.push(cand);
    }
    extra += 40;
    if (extra > 400) break;
  }

  const choices = seededShuffle([target, ...distractors], seed + 202);
  const correctIndex = choices.findIndex(
    (c) => c.cap === target.cap && c.pitch === target.pitch && c.roll === target.roll
  );

  return {
    id: `psy.orientation.${seed}`,
    difficulty,
    model,
    target,
    choices,
    correctIndex,
  };
}

/** Compose une session : difficulté progressive par tiers, identifiants uniques. */
export function composeOrientationSession(
  size: number = ORIENTATION_SESSION_SIZE,
  seed: number = Date.now()
): OrientationQuestion[] {
  const questions: OrientationQuestion[] = [];
  const third = size / 3;
  for (let i = 0; i < size; i++) {
    const difficulty: 1 | 2 | 3 = i < third ? 1 : i < 2 * third ? 2 : 3;
    questions.push(generateOrientationQuestion(seed + i * 7919, difficulty));
  }
  return questions;
}

export interface OrientationAnswer {
  questionId: string;
  /** Index choisi, ou null si sans réponse (temps écoulé / passé). */
  chosenIndex: number | null;
  correctIndex: number;
}

export interface OrientationScore {
  total: number;
  answered: number;
  correct: number;
  /** Justes / répondues (0 si rien répondu). */
  precision: number;
}

export function scoreOrientation(answers: OrientationAnswer[]): OrientationScore {
  const total = answers.length;
  const answered = answers.filter((a) => a.chosenIndex !== null).length;
  const correct = answers.filter((a) => a.chosenIndex === a.correctIndex).length;
  return {
    total,
    answered,
    correct,
    precision: answered === 0 ? 0 : correct / answered,
  };
}
