/**
 * Modèle PUR de l'interaction « Incidence et décrochage » (docs/editorial/cours.md).
 * Aucune dépendance React : on décrit ici, pour quelques valeurs d'incidence,
 * l'état de l'écoulement (collé, à la limite, décollé) et le coefficient de
 * portance associé — la portance croît avec l'incidence PUIS s'effondre au
 * décrochage. Valeurs pédagogiques (ordres de grandeur), pas une polaire réelle.
 */

export type IncidenceLevel = "faible" | "moyenne" | "critique" | "decrochage";

export const INCIDENCE_LEVELS: readonly IncidenceLevel[] = [
  "faible",
  "moyenne",
  "critique",
  "decrochage",
];

export const INCIDENCE_LABELS: Record<IncidenceLevel, string> = {
  faible: "Faible (~3°)",
  moyenne: "Moyenne (~10°)",
  critique: "Critique (~15°)",
  decrochage: "Décrochage (~20°)",
};

/** Angle indicatif (degrés) pour l'affichage. */
export const INCIDENCE_ANGLE: Record<IncidenceLevel, number> = {
  faible: 3,
  moyenne: 10,
  critique: 15,
  decrochage: 20,
};

/** Coefficient de portance indicatif : monte jusqu'au critique, chute ensuite. */
export const INCIDENCE_CZ: Record<IncidenceLevel, number> = {
  faible: 0.35,
  moyenne: 1.1,
  critique: 1.5,
  decrochage: 0.9,
};

export type FlowState = "colle" | "limite" | "decolle";

export const FLOW_STATE: Record<IncidenceLevel, FlowState> = {
  faible: "colle",
  moyenne: "colle",
  critique: "limite",
  decrochage: "decolle",
};

export interface IncidenceState {
  level: IncidenceLevel;
}

export const INITIAL_INCIDENCE: IncidenceState = { level: "faible" };

export interface IncidenceMetrics {
  angle: number;
  cz: number;
  flow: FlowState;
  /** Vrai au-delà de l'incidence critique (portance effondrée). */
  stalled: boolean;
}

export function incidenceMetrics(level: IncidenceLevel): IncidenceMetrics {
  return {
    angle: INCIDENCE_ANGLE[level],
    cz: INCIDENCE_CZ[level],
    flow: FLOW_STATE[level],
    stalled: level === "decrochage",
  };
}

/** Alternative textuelle décrivant l'état courant (accessibilité). */
export function describeIncidence(state: IncidenceState): string {
  const m = incidenceMetrics(state.level);
  const base = `Incidence ${INCIDENCE_LABELS[state.level].toLowerCase()}, coefficient de portance Cz ≈ ${m.cz.toFixed(2)}.`;
  if (m.flow === "colle") {
    return `${base} L'écoulement suit le profil (couche limite collée) ; la portance croît avec l'incidence.`;
  }
  if (m.flow === "limite") {
    return `${base} On atteint l'incidence critique : le Cz est maximal et l'écoulement est à la limite du décollement.`;
  }
  return `${base} Au-delà de l'incidence critique, l'écoulement décolle de l'extrados : la portance s'effondre, c'est le décrochage.`;
}
