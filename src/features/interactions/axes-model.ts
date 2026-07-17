/**
 * Modèle PUR de l'interaction « Les trois axes et les gouvernes »
 * (docs/editorial/cours.md). Aucune dépendance React : on associe ici chaque
 * axe de rotation à sa gouverne, sa commande et le mouvement produit, et l'on
 * en tire une alternative textuelle accessible.
 */

export type Axe = "tangage" | "roulis" | "lacet";

export const AXES: readonly Axe[] = ["tangage", "roulis", "lacet"];

export const AXE_LABELS: Record<Axe, string> = {
  tangage: "Tangage",
  roulis: "Roulis",
  lacet: "Lacet",
};

export interface AxeInfo {
  /** Nom de l'axe géométrique. */
  axeGeometrique: string;
  /** Gouverne qui agit sur cet axe. */
  gouverne: string;
  /** Commande au poste de pilotage. */
  commande: string;
  /** Mouvement produit. */
  mouvement: string;
}

export const AXE_INFO: Record<Axe, AxeInfo> = {
  tangage: {
    axeGeometrique: "axe transversal (d'une aile à l'autre)",
    gouverne: "la gouverne de profondeur (empennage horizontal)",
    commande: "le manche, poussé ou tiré",
    mouvement: "le nez monte (cabré) ou descend (piqué)",
  },
  roulis: {
    axeGeometrique: "axe longitudinal (du nez à la queue)",
    gouverne: "les ailerons",
    commande: "le manche, à gauche ou à droite",
    mouvement: "les ailes s'inclinent d'un côté ou de l'autre",
  },
  lacet: {
    axeGeometrique: "axe vertical (perpendiculaire aux ailes)",
    gouverne: "la gouverne de direction (dérive)",
    commande: "le palonnier (les pieds)",
    mouvement: "le nez pivote à gauche ou à droite",
  },
};

export interface AxesState {
  axe: Axe;
}

export const INITIAL_AXES: AxesState = { axe: "tangage" };

/** Alternative textuelle décrivant l'axe courant (accessibilité). */
export function describeAxe(state: AxesState): string {
  const info = AXE_INFO[state.axe];
  return (
    `${AXE_LABELS[state.axe]} — rotation autour de l'${info.axeGeometrique}. ` +
    `Gouverne : ${info.gouverne}, actionnée par ${info.commande}. ` +
    `Effet : ${info.mouvement}.`
  );
}
