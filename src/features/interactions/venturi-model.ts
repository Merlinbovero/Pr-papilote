/**
 * Modèle PUR de l'interaction « Effet Venturi » (docs/editorial/cours.md).
 * Aucune dépendance React : on calcule ici, à partir d'un niveau de
 * rétrécissement, la vitesse au col et la variation de pression selon
 * Bernoulli — logique testable et réutilisable indépendamment du rendu.
 *
 * Hypothèses pédagogiques (BIA) : fluide incompressible, écoulement idéal, une
 * seule ligne de courant. Vitesse d'entrée V1 et masse volumique ρ fixées ;
 * la pression totale (statique + dynamique) se conserve (pt = ps + q = cste).
 */

export type Constriction = "aucun" | "moyen" | "fort";

export const CONSTRICTIONS: readonly Constriction[] = ["aucun", "moyen", "fort"];

export const CONSTRICTION_LABELS: Record<Constriction, string> = {
  aucun: "Aucun",
  moyen: "Moyen (section ÷ 2)",
  fort: "Fort (section ÷ 3)",
};

/** Rapport de sections S₂/S₁ au col selon le rétrécissement choisi. */
const RATIO: Record<Constriction, number> = { aucun: 1, moyen: 0.5, fort: 1 / 3 };

/** Masse volumique de l'air (atmosphère standard, niveau de la mer). */
export const RHO = 1.225;
/** Vitesse de référence à l'entrée (m/s). */
export const V1 = 10;

export interface VenturiState {
  constriction: Constriction;
}

export const INITIAL_VENTURI: VenturiState = { constriction: "moyen" };

export interface VenturiMetrics {
  /** Rapport de sections S₂/S₁ (≤ 1). */
  ratio: number;
  /** Facteur d'accélération V₂/V₁ = S₁/S₂. */
  speedFactor: number;
  /** Vitesse au col (m/s). */
  v2: number;
  /** Pression dynamique à l'entrée (Pa). */
  q1: number;
  /** Pression dynamique au col (Pa). */
  q2: number;
  /** Baisse de pression statique au col (Pa, positif = chute). */
  deltaP: number;
}

/** Grandeurs de l'écoulement pour un niveau de rétrécissement donné. */
export function venturiMetrics(constriction: Constriction): VenturiMetrics {
  const ratio = RATIO[constriction];
  const speedFactor = 1 / ratio;
  const v2 = V1 * speedFactor;
  const q1 = 0.5 * RHO * V1 * V1;
  const q2 = 0.5 * RHO * v2 * v2;
  return { ratio, speedFactor, v2, q1, q2, deltaP: q2 - q1 };
}

/** Alternative textuelle décrivant l'état courant (accessibilité). */
export function describeVenturi(state: VenturiState): string {
  const m = venturiMetrics(state.constriction);
  if (state.constriction === "aucun") {
    return (
      `Rétrécissement : aucun. La section est constante, la vitesse reste à ` +
      `${V1} m/s et la pression statique ne change pas. La pression totale ` +
      `(statique + dynamique) est conservée (Bernoulli).`
    );
  }
  return (
    `Rétrécissement : ${state.constriction}. La section est divisée par ` +
    `${Math.round(m.speedFactor)}, donc la vitesse est multipliée par ` +
    `${Math.round(m.speedFactor)} (${V1} → ${Math.round(m.v2)} m/s). ` +
    `La pression statique chute d'environ ${Math.round(m.deltaP)} Pa au col : ` +
    `la vitesse augmente, la pression diminue (effet Venturi). La pression ` +
    `totale reste conservée (Bernoulli).`
  );
}
