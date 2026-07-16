/**
 * Modèle PUR de l'interaction « Forces et vecteurs » (docs/editorial/cours.md).
 * Aucune dépendance React : la logique (scénarios, résultante, alternative
 * textuelle) est ainsi testable et réutilisable indépendamment du rendu.
 */

export type ForceKey = "poids" | "portance" | "traction" | "trainee";
export type Scenario = "equilibre" | "acceleration";

export const FORCE_KEYS: readonly ForceKey[] = ["poids", "portance", "traction", "trainee"];

export const FORCE_LABELS: Record<ForceKey, string> = {
  poids: "Poids",
  portance: "Portance",
  traction: "Traction",
  trainee: "Traînée",
};

export interface ForcesState {
  scenario: Scenario;
  visible: Record<ForceKey, boolean>;
}

export const INITIAL_STATE: ForcesState = {
  scenario: "equilibre",
  visible: { poids: true, portance: true, traction: true, trainee: true },
};

/** Résultante des forces selon le scénario (V1 pédagogique, qualitative). */
export function resultante(scenario: Scenario): { nulle: boolean; texte: string } {
  return scenario === "equilibre"
    ? {
        nulle: true,
        texte:
          "La résultante est nulle : les forces s'équilibrent deux à deux, la vitesse reste constante.",
      }
    : {
        nulle: false,
        texte:
          "La traction dépasse la traînée : la résultante n'est pas nulle, dirigée vers l'avant — l'avion accélère.",
      };
}

/** Alternative textuelle décrivant l'état courant (accessibilité). */
export function describeForces(state: ForcesState): string {
  const shown = FORCE_KEYS.filter((k) => state.visible[k]).map((k) => FORCE_LABELS[k]);
  const scenarioTxt =
    state.scenario === "equilibre" ? "vol stabilisé (équilibre)" : "phase d'accélération";
  const forcesTxt = shown.length ? shown.join(", ") : "aucune force affichée";
  return `Situation : ${scenarioTxt}. Forces affichées : ${forcesTxt}. ${resultante(state.scenario).texte}`;
}
