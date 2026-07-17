/**
 * Modèle PUR de l'interaction « Simulateur de centrage » (docs/editorial/cours.md).
 * Aucune dépendance React : à partir de la position du centre de gravité (en %
 * de la corde), on calcule la marge statique par rapport au foyer et l'on
 * qualifie le centrage (avant, arrière, hors plage, instable). Valeurs
 * pédagogiques (ordres de grandeur), pas les limites d'un aéronef réel.
 */

/** Position du foyer / point neutre (en % de la corde). */
export const FOYER = 30;
/** Limite avant de centrage (la plus « lourde du nez » admise). */
export const LIMITE_AVANT = 15;
/** Limite arrière de centrage (la plus « légère du nez » admise). */
export const LIMITE_ARRIERE = 28;

export const CG_MIN = 10;
export const CG_MAX = 35;

export type CentrageStatut = "hors-avant" | "avant" | "arriere" | "hors-arriere" | "instable";

export const CENTRAGE_LABELS: Record<CentrageStatut, string> = {
  "hors-avant": "hors plage — trop avant",
  avant: "centrage avant (dans la plage)",
  arriere: "centrage arrière (dans la plage)",
  "hors-arriere": "hors plage — trop arrière",
  instable: "instable — centre de gravité derrière le foyer",
};

export interface CentrageState {
  /** Position du centre de gravité, en % de la corde. */
  cg: number;
}

export const INITIAL_CENTRAGE: CentrageState = { cg: 21 };

export interface CentrageMetrics {
  cg: number;
  /** Marge statique = foyer − centre de gravité (en points de %). */
  margeStatique: number;
  statut: CentrageStatut;
  /** Vrai si le centre de gravité est dans la plage admise. */
  dansLaPlage: boolean;
}

export function centrageStatut(cg: number): CentrageStatut {
  if (cg >= FOYER) {
    return "instable";
  }
  if (cg > LIMITE_ARRIERE) {
    return "hors-arriere";
  }
  if (cg < LIMITE_AVANT) {
    return "hors-avant";
  }
  // Milieu de plage : avant du milieu → « avant », arrière → « arrière ».
  const milieu = (LIMITE_AVANT + LIMITE_ARRIERE) / 2;
  return cg <= milieu ? "avant" : "arriere";
}

export function centrageMetrics(cg: number): CentrageMetrics {
  const statut = centrageStatut(cg);
  return {
    cg,
    margeStatique: FOYER - cg,
    statut,
    dansLaPlage: statut === "avant" || statut === "arriere",
  };
}

/** Alternative textuelle décrivant l'état courant (accessibilité). */
export function describeCentrage(state: CentrageState): string {
  const m = centrageMetrics(state.cg);
  const base = `Centre de gravité à ${m.cg} % de la corde, marge statique de ${m.margeStatique.toFixed(0)} points (foyer à ${FOYER} %).`;
  switch (m.statut) {
    case "avant":
      return `${base} Centrage avant, dans la plage : avion stable mais plus lourd à cabrer.`;
    case "arriere":
      return `${base} Centrage arrière, dans la plage : avion plus maniable mais moins stable.`;
    case "hors-avant":
      return `${base} Hors plage, trop avant : dangereux (avion très lourd du nez).`;
    case "hors-arriere":
      return `${base} Hors plage, trop arrière : marge statique trop faible, dangereux.`;
    case "instable":
      return `${base} Le centre de gravité est derrière le foyer : l'avion est instable, situation dangereuse.`;
  }
}
