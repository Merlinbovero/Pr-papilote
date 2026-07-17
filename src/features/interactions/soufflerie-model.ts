/**
 * Modèle PUR de l'interaction « Soufflerie à zones » (docs/editorial/cours.md).
 * Aucune dépendance React : on décrit ici chaque zone d'une soufflerie à circuit
 * ouvert et son rôle, et l'on en tire une alternative textuelle accessible.
 */

export type Zone = "collecteur" | "veine" | "diffuseur" | "ventilateur";

export const ZONES: readonly Zone[] = ["collecteur", "veine", "diffuseur", "ventilateur"];

export const ZONE_LABELS: Record<Zone, string> = {
  collecteur: "Collecteur",
  veine: "Veine d'essai",
  diffuseur: "Diffuseur",
  ventilateur: "Ventilateur",
};

export const ZONE_ROLES: Record<Zone, string> = {
  collecteur:
    "Convergent d'entrée : il accélère et régularise l'air (conservation du débit) avant la veine d'essai.",
  veine:
    "Section où l'écoulement est le plus uniforme : on y place la maquette et la balance aérodynamique mesure les efforts.",
  diffuseur:
    "Partie aval qui s'élargit : elle ralentit progressivement l'air et récupère une partie de l'énergie.",
  ventilateur: "Source d'énergie qui entretient le courant d'air dans toute la soufflerie.",
};

export interface SoufflerieState {
  zone: Zone;
}

export const INITIAL_SOUFFLERIE: SoufflerieState = { zone: "veine" };

/** Alternative textuelle décrivant la zone courante (accessibilité). */
export function describeSoufflerie(state: SoufflerieState): string {
  return `${ZONE_LABELS[state.zone]} — ${ZONE_ROLES[state.zone]}`;
}
