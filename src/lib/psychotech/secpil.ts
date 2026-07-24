/**
 * SECPIL — modèle pur de l'entraîneur psychomoteur (reconstitution accessible).
 *
 * L'épreuve réelle du SECPIL (Système d'Évaluation des Candidats PILote, sélection
 * EOPN à Tours) fait suivre progressivement trois tâches simultanées : un point sur
 * un « 8 » au manche, une cible horizontale au palonnier, et un calcul mental (somme
 * courante de chiffres). Notre version remplace manche et palonnier par la souris et
 * les flèches — c'est une **reconstitution du principe** (attention partagée), sans
 * lien avec le logiciel officiel, à des fins d'entraînement.
 *
 * Ce module ne contient que de la logique pure et testable : la géométrie des cibles
 * (fonction du temps), la conversion erreur → précision, et la génération déterministe
 * de la séquence de calcul. Le rendu temps réel et la lecture des commandes vivent
 * dans le composant client `src/features/psychotech/secpil-simulator.tsx`.
 *
 * Toutes les coordonnées sont normalisées dans [-1, 1] sur chaque axe ; le composant
 * les projette ensuite en pixels.
 */
import { createRng } from "@/features/quiz/engine";

/** Les trois tâches élémentaires, dans l'ordre où elles sont introduites. */
export type SecpilTask = "palonnier" | "manche" | "calcul";

export interface SecpilPhase {
  /** Numéro de phase (1 à 4). */
  id: number;
  /** Libellé court affiché dans le bandeau. */
  label: string;
  /** Consigne d'une phrase. */
  consigne: string;
  /** Tâches actives, cumulées phase après phase. */
  tasks: SecpilTask[];
}

/** Durée d'une phase (~52 s dans l'épreuve réelle, source cockpitseeker). */
export const SECPIL_PHASE_MS = 52_000;

/** Un nouveau chiffre du calcul mental apparaît toutes les 3 s. */
export const SECPIL_DIGIT_INTERVAL_MS = 3_000;

/**
 * Les quatre phases à montée en charge progressive : palonnier seul, manche seul,
 * les deux, puis les deux plus le calcul mental — la structure de l'épreuve réelle.
 */
export const SECPIL_PHASES: readonly SecpilPhase[] = [
  {
    id: 1,
    label: "Palonnier seul",
    consigne: "Amenez le carré sur le point qui apparaît en haut — flèches ◀ ▶ (ou boutons).",
    tasks: ["palonnier"],
  },
  {
    id: 2,
    label: "Manche seul",
    consigne: "Suivez le point sur le « 8 » avec la souris (ou le doigt).",
    tasks: ["manche"],
  },
  {
    id: 3,
    label: "Manche + palonnier",
    consigne:
      "Les deux à la fois : souris pour le « 8 », flèches pour poser le carré sur le point.",
    tasks: ["manche", "palonnier"],
  },
  {
    id: 4,
    label: "Tout + calcul mental",
    consigne: "On garde les deux commandes et on additionne les chiffres au fur et à mesure.",
    tasks: ["manche", "palonnier", "calcul"],
  },
] as const;

/**
 * Durée d'un « 8 » complet (s). Calée sur l'épreuve réelle d'après la mesure
 * utilisateur : ~28 s entre deux passages au croisement central, soit ~56 s le
 * tour complet.
 */
export const MANCHE_PERIOD_S = 56;
/** Temps pendant lequel le point du palonnier reste à une position avant de réapparaître ailleurs (ms). */
export const PALONNIER_DWELL_MS = 2800;

/** Position de la cible du manche sur un « 8 » vertical (Lissajous 1:2). */
export function mancheTarget(elapsedMs: number): { x: number; y: number } {
  const t = (elapsedMs / 1000) * ((2 * Math.PI) / MANCHE_PERIOD_S);
  return { x: 0.72 * Math.sin(2 * t), y: Math.sin(t) };
}

/**
 * Position horizontale de la cible du palonnier. Ce n'est pas un va-et-vient :
 * un point **apparaît à une position aléatoire**, y reste `PALONNIER_DWELL_MS`,
 * puis réapparaît ailleurs. Il faut amener le réticule (le carré) dessus.
 * Déterministe pour un `seed` donné ; borné à [-0.85, 0.85] pour éviter les bords.
 */
export function palonnierTargetAt(elapsedMs: number, seed: number): number {
  const slot = Math.floor(Math.max(0, elapsedMs) / PALONNIER_DWELL_MS);
  const rng = createRng(seed + slot * 7919);
  return rng() * 1.7 - 0.85;
}

/** Tolérance (en unités normalisées) sous laquelle la précision est maximale. */
export const SECPIL_TOLERANCE = 0.14;
/** Erreur au-delà de laquelle la précision tombe à 0. */
export const SECPIL_MAX_ERROR = 1.1;

/**
 * Convertit une erreur moyenne (distance à la cible, unités normalisées) en une
 * précision 0–100 : pleine note sous la tolérance, décroissance linéaire ensuite.
 */
export function accuracyFromError(meanError: number): number {
  if (!Number.isFinite(meanError) || meanError <= SECPIL_TOLERANCE) return 100;
  if (meanError >= SECPIL_MAX_ERROR) return 0;
  const ratio = (meanError - SECPIL_TOLERANCE) / (SECPIL_MAX_ERROR - SECPIL_TOLERANCE);
  return Math.round((1 - ratio) * 100);
}

export interface SecpilMathStep {
  /** Chiffre affiché (0 à 9). */
  digit: number;
  /** Somme courante après ce chiffre. */
  sum: number;
}

/**
 * Génère la séquence de calcul mental d'une phase : `count` chiffres 0–9 et la somme
 * courante après chacun. Déterministe pour un `seed` donné (rejouabilité, tests).
 */
export function mathSequence(seed: number, count: number): SecpilMathStep[] {
  const rng = createRng(seed);
  const steps: SecpilMathStep[] = [];
  let sum = 0;
  for (let i = 0; i < count; i += 1) {
    const digit = Math.floor(rng() * 10);
    sum += digit;
    steps.push({ digit, sum });
  }
  return steps;
}

/** Nombre de chiffres présentés pendant une phase de calcul. */
export function digitCountForPhase(phaseMs: number = SECPIL_PHASE_MS): number {
  return Math.floor(phaseMs / SECPIL_DIGIT_INTERVAL_MS);
}

export interface SecpilPhaseScore {
  phaseId: number;
  /** Précision manche 0–100 (null si la tâche n'était pas active). */
  manche: number | null;
  /** Précision palonnier 0–100 (null si inactive). */
  palonnier: number | null;
  /** Réussite du calcul 0–100 (null si inactif). */
  calcul: number | null;
}

/** Moyenne des composantes actives d'une phase (0–100). */
export function phaseOverall(score: SecpilPhaseScore): number {
  const parts = [score.manche, score.palonnier, score.calcul].filter(
    (v): v is number => v !== null
  );
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/** Score global : moyenne des phases jouées (0–100). */
export function globalScore(scores: SecpilPhaseScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.map(phaseOverall).reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Courbe de progression : compare la précision motrice moyenne de la première et de
 * la dernière phase où le manche ou le palonnier étaient actifs. > 0 = amélioration.
 */
export function improvementTrend(scores: SecpilPhaseScore[]): number | null {
  const motor = scores
    .map((s) => {
      const parts = [s.manche, s.palonnier].filter((v): v is number => v !== null);
      return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
    })
    .filter((v): v is number => v !== null);
  if (motor.length < 2) return null;
  return Math.round(motor[motor.length - 1] - motor[0]);
}
