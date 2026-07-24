/**
 * SECPIL — modèle pur de l'entraîneur psychomoteur (reconstitution accessible).
 *
 * Inspiré de l'épreuve psychomotrice des sélections EOPN : suivre un point sur un
 * « 8 » (manche), poser un carré sur un point qui apparaît en haut (palonnier) et
 * additionner mentalement des nombres, puis donner la somme courante. Notre version
 * remplace manche et palonnier par la souris et les flèches — une **reconstitution
 * du principe** (attention partagée), sans lien avec le logiciel officiel.
 *
 * Deux axes réglables :
 *  - le **mode** (progression) — quelles tâches sont actives : palonnier seul, « 8 »
 *    seul, chiffres seuls, « 8 » + chiffres, puis tout ensemble ;
 *  - le **niveau** (1 à 5, quand les chiffres sont actifs) — à quel rythme on demande
 *    la somme et la taille des nombres.
 *
 * Ce module ne contient que de la logique pure et testable ; le rendu temps réel et
 * la lecture des commandes vivent dans `src/features/psychotech/secpil-simulator.tsx`.
 * Coordonnées normalisées dans [-1, 1] ; le composant les projette en pixels.
 */
import { createRng } from "@/features/quiz/engine";

/** Les trois tâches élémentaires. */
export type SecpilTask = "palonnier" | "manche" | "calcul";

/** Modes de progression : introduction progressive des tâches. */
export type SecpilMode = "palonnier" | "manche" | "calcul" | "manche-calcul" | "tout";

export interface SecpilModeInfo {
  mode: SecpilMode;
  label: string;
  hint: string;
  tasks: SecpilTask[];
}

export const SECPIL_MODES: readonly SecpilModeInfo[] = [
  {
    mode: "palonnier",
    label: "Palonnier seul",
    hint: "Amener le carré sur le point qui apparaît en haut (flèches ◀ ▶).",
    tasks: ["palonnier"],
  },
  {
    mode: "manche",
    label: "Le « 8 » seul",
    hint: "Suivre le point sur le « 8 » à la souris.",
    tasks: ["manche"],
  },
  {
    mode: "calcul",
    label: "Chiffres seuls",
    hint: "Additionner les nombres qui apparaissent, donner la somme.",
    tasks: ["calcul"],
  },
  {
    mode: "manche-calcul",
    label: "Le « 8 » + chiffres",
    hint: "Suivre le « 8 » tout en additionnant les nombres.",
    tasks: ["manche", "calcul"],
  },
  {
    mode: "tout",
    label: "Tout ensemble",
    hint: "Manche, palonnier et calcul en même temps — l'épreuve complète.",
    tasks: ["manche", "palonnier", "calcul"],
  },
] as const;

export function modeTasks(mode: SecpilMode): SecpilTask[] {
  return SECPIL_MODES.find((m) => m.mode === mode)?.tasks ?? [];
}

/** Quand demander la somme courante. */
export type SecpilCheckpoint = "crossing" | "full8" | "double8" | "free";

export interface SecpilLevelInfo {
  level: number;
  label: string;
  /** Valeur maximale d'un nombre (9 = chiffres, 99 = nombres à deux chiffres). */
  numberMax: number;
  checkpoint: SecpilCheckpoint;
}

export const SECPIL_LEVELS: readonly SecpilLevelInfo[] = [
  { level: 1, label: "Somme à chaque croisement", numberMax: 9, checkpoint: "crossing" },
  { level: 2, label: "Somme à chaque « 8 » complet", numberMax: 9, checkpoint: "full8" },
  { level: 3, label: "Additions à deux chiffres", numberMax: 99, checkpoint: "full8" },
  { level: 4, label: "Somme tous les deux « 8 »", numberMax: 99, checkpoint: "double8" },
  { level: 5, label: "Champ libre (somme à la fin)", numberMax: 99, checkpoint: "free" },
] as const;

export function levelInfo(level: number): SecpilLevelInfo {
  return SECPIL_LEVELS.find((l) => l.level === level) ?? SECPIL_LEVELS[0];
}

/** Durée d'un « 8 » complet (s). Calée sur la vidéo de référence (~1 min le tour). */
export const MANCHE_PERIOD_S = 56;
/** Le point du palonnier reste à une position ~2,8 s avant de réapparaître ailleurs. */
export const PALONNIER_DWELL_MS = 2800;
/** Un nombre reste affiché 3 s, puis 3 s de repos, puis le suivant. */
export const SECPIL_NUMBER_ON_MS = 3000;
export const SECPIL_NUMBER_OFF_MS = 3000;
export const SECPIL_NUMBER_CYCLE_MS = SECPIL_NUMBER_ON_MS + SECPIL_NUMBER_OFF_MS;

/** Intervalle (ms) entre deux demandes de somme, selon le point de contrôle. */
export function checkpointIntervalMs(cp: SecpilCheckpoint): number {
  const period = MANCHE_PERIOD_S * 1000;
  switch (cp) {
    case "crossing":
      return period / 2; // le « 8 » passe au centre deux fois par tour
    case "full8":
      return period;
    case "double8":
      return period * 2;
    case "free":
      return Number.POSITIVE_INFINITY;
  }
}

/** Durée d'une session : deux « 8 » quand le manche est actif, sinon 60 s. */
export function sessionDurationMs(mode: SecpilMode): number {
  return modeTasks(mode).includes("manche") ? MANCHE_PERIOD_S * 1000 * 2 : 60_000;
}

/**
 * Instants (ms depuis le début) où l'on demande la somme. Vide si le calcul n'est
 * pas actif. En « champ libre », un seul point de contrôle, à la fin.
 */
export function checkpointTimes(mode: SecpilMode, level: number): number[] {
  if (!modeTasks(mode).includes("calcul")) return [];
  const sessionMs = sessionDurationMs(mode);
  const cp = levelInfo(level).checkpoint;
  if (cp === "free") return [sessionMs];
  const interval = checkpointIntervalMs(cp);
  const times: number[] = [];
  for (let t = interval; t <= sessionMs + 1; t += interval) {
    times.push(Math.min(Math.round(t), sessionMs));
  }
  if (times.length === 0 || times[times.length - 1] < sessionMs) times.push(sessionMs);
  return [...new Set(times)];
}

/** Position de la cible du manche sur un « 8 » vertical (Lissajous 1:2). */
export function mancheTarget(elapsedMs: number): { x: number; y: number } {
  const t = (elapsedMs / 1000) * ((2 * Math.PI) / MANCHE_PERIOD_S);
  return { x: 0.72 * Math.sin(2 * t), y: Math.sin(t) };
}

/**
 * Position horizontale du point du palonnier : il **apparaît à une position
 * aléatoire**, y reste `PALONNIER_DWELL_MS`, puis réapparaît ailleurs. Déterministe
 * pour un `seed` donné ; borné à [-0.85, 0.85].
 */
export function palonnierTargetAt(elapsedMs: number, seed: number): number {
  const slot = Math.floor(Math.max(0, elapsedMs) / PALONNIER_DWELL_MS);
  const rng = createRng(seed + slot * 7919);
  return rng() * 1.7 - 0.85;
}

export interface SecpilNumberStep {
  /** Nombre affiché. */
  value: number;
  /** Somme courante après ce nombre. */
  sum: number;
}

function pickNumber(rng: () => number, numberMax: number): number {
  return numberMax <= 9 ? Math.floor(rng() * 10) : 10 + Math.floor(rng() * 90);
}

/**
 * Séquence de nombres d'une session et la somme courante après chacun. Déterministe
 * pour un `seed`. `numberMax` ≤ 9 → chiffres 0-9 ; sinon nombres à deux chiffres.
 */
export function numberSequence(seed: number, count: number, numberMax: number): SecpilNumberStep[] {
  const rng = createRng(seed);
  const steps: SecpilNumberStep[] = [];
  let sum = 0;
  for (let i = 0; i < count; i += 1) {
    const value = pickNumber(rng, numberMax);
    sum += value;
    steps.push({ value, sum });
  }
  return steps;
}

/** Nombre de nombres présentés pendant une session (un toutes les 6 s). */
export function numberCountForSession(mode: SecpilMode): number {
  return Math.ceil(sessionDurationMs(mode) / SECPIL_NUMBER_CYCLE_MS) + 1;
}

/** Combien de nombres ont été révélés à l'instant `elapsedMs` (chacun apparaît par cycle). */
export function revealedCount(elapsedMs: number): number {
  return Math.floor(Math.max(0, elapsedMs) / SECPIL_NUMBER_CYCLE_MS) + 1;
}

/** Somme courante attendue à l'instant `elapsedMs`. */
export function expectedSumAt(steps: SecpilNumberStep[], elapsedMs: number): number {
  const n = Math.min(steps.length, revealedCount(elapsedMs));
  return n > 0 ? steps[n - 1].sum : 0;
}

/** Tolérance (unités normalisées) sous laquelle la précision de suivi est maximale. */
export const SECPIL_TOLERANCE = 0.14;
/** Erreur au-delà de laquelle la précision tombe à 0. */
export const SECPIL_MAX_ERROR = 1.1;

/** Convertit une erreur moyenne de suivi en précision 0–100. */
export function accuracyFromError(meanError: number): number {
  if (!Number.isFinite(meanError) || meanError <= SECPIL_TOLERANCE) return 100;
  if (meanError >= SECPIL_MAX_ERROR) return 0;
  const ratio = (meanError - SECPIL_TOLERANCE) / (SECPIL_MAX_ERROR - SECPIL_TOLERANCE);
  return Math.round((1 - ratio) * 100);
}

export interface SecpilScore {
  /** Précision manche 0–100 (null si inactif). */
  manche: number | null;
  /** Précision palonnier 0–100 (null si inactif). */
  palonnier: number | null;
  /** Réussite du calcul 0–100 (null si inactif). */
  calcul: number | null;
}

/** Note globale : moyenne des composantes actives (0–100). */
export function sessionOverall(score: SecpilScore): number {
  const parts = [score.manche, score.palonnier, score.calcul].filter(
    (v): v is number => v !== null
  );
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
