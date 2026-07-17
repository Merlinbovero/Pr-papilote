/**
 * Modèle PUR de l'interaction « Polaire d'Eiffel » (docs/editorial/cours.md).
 * Aucune dépendance React : on calcule ici, pour un angle d'incidence, les
 * coefficients Cz et Cx, la finesse Cz/Cx, et l'on nomme le point remarquable
 * de la polaire. Modèle pédagogique (polaire parabolique simplifiée), pas une
 * courbe expérimentale : les ordres de grandeur sont réalistes.
 */

export const ALPHA_MIN = -4;
export const ALPHA_MAX = 18;
export const ALPHA_STALL = 15;

const CX0 = 0.02; // traînée à portance nulle
const K = 0.05; // terme de traînée induite (Cx = Cx0 + k·Cz²)
const SLOPE = 0.09; // Cz par degré (pente de portance)
const ALPHA_CZ0 = -1; // incidence de portance nulle

/** Coefficient de portance à l'incidence donnée (chute après le décrochage). */
export function czAt(alpha: number): number {
  if (alpha <= ALPHA_STALL) {
    return SLOPE * (alpha - ALPHA_CZ0);
  }
  const czMax = SLOPE * (ALPHA_STALL - ALPHA_CZ0);
  return Math.max(czMax - (alpha - ALPHA_STALL) * 0.12, 0.3);
}

/** Coefficient de traînée (polaire parabolique + hausse après décrochage). */
export function cxAt(alpha: number): number {
  const cz = Math.max(czAt(alpha), 0);
  let cx = CX0 + K * cz * cz;
  if (alpha > ALPHA_STALL) {
    cx += (alpha - ALPHA_STALL) * 0.03;
  }
  return cx;
}

/** Finesse = Cz / Cx (nulle si Cz ≤ 0). */
export function finesseAt(alpha: number): number {
  const cz = czAt(alpha);
  if (cz <= 0) {
    return 0;
  }
  return cz / cxAt(alpha);
}

/** Incidence de finesse maximale (tangente issue de l'origine) : Cz = √(Cx0/k). */
export const ALPHA_FINESSE_MAX = Math.sqrt(CX0 / K) / SLOPE + ALPHA_CZ0;

export type PolaireRemarquable =
  "portance-nulle" | "finesse-max" | "cz-max" | "decrochage" | "courant";

export function remarquableAt(alpha: number): PolaireRemarquable {
  if (alpha > ALPHA_STALL + 0.5) {
    return "decrochage";
  }
  if (alpha >= ALPHA_STALL - 0.5) {
    return "cz-max";
  }
  if (Math.abs(alpha - ALPHA_FINESSE_MAX) < 1) {
    return "finesse-max";
  }
  if (Math.abs(alpha - ALPHA_CZ0) < 1) {
    return "portance-nulle";
  }
  return "courant";
}

export const REMARQUABLE_LABELS: Record<PolaireRemarquable, string> = {
  "portance-nulle": "portance nulle",
  "finesse-max": "finesse maximale",
  "cz-max": "Cz maximal (proche du décrochage)",
  decrochage: "décrochage",
  courant: "point courant",
};

export interface PolaireState {
  alpha: number;
}

export const INITIAL_POLAIRE: PolaireState = {
  alpha: Math.round(ALPHA_FINESSE_MAX),
};

export interface PolaireMetrics {
  alpha: number;
  cz: number;
  cx: number;
  finesse: number;
  remarquable: PolaireRemarquable;
}

export function polaireMetrics(alpha: number): PolaireMetrics {
  return {
    alpha,
    cz: czAt(alpha),
    cx: cxAt(alpha),
    finesse: finesseAt(alpha),
    remarquable: remarquableAt(alpha),
  };
}

/** Échantillonne la courbe (points {cx, cz}) de ALPHA_MIN à ALPHA_MAX. */
export function polaireCurve(step = 1): { alpha: number; cx: number; cz: number }[] {
  const points: { alpha: number; cx: number; cz: number }[] = [];
  for (let a = ALPHA_MIN; a <= ALPHA_MAX + 1e-9; a += step) {
    points.push({ alpha: a, cx: cxAt(a), cz: czAt(a) });
  }
  return points;
}

/** Alternative textuelle décrivant l'état courant (accessibilité). */
export function describePolaire(state: PolaireState): string {
  const m = polaireMetrics(state.alpha);
  const base = `Incidence ${m.alpha}°, Cz ≈ ${m.cz.toFixed(2)}, Cx ≈ ${m.cx.toFixed(3)}, finesse ≈ ${m.finesse.toFixed(1)}.`;
  switch (m.remarquable) {
    case "portance-nulle":
      return `${base} Point de portance nulle : l'aile ne porte pas.`;
    case "finesse-max":
      return `${base} Point de finesse maximale : le meilleur rapport portance/traînée.`;
    case "cz-max":
      return `${base} Cz maximal, juste avant le décrochage.`;
    case "decrochage":
      return `${base} Au-delà de l'incidence critique : la portance chute, c'est le décrochage.`;
    default:
      return `${base} Déplacez l'incidence pour parcourir la polaire.`;
  }
}
