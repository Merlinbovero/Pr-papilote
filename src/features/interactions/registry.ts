/**
 * Registre des interactions pédagogiques (docs/editorial/cours.md §interactions).
 *
 * Module PUR (aucune dépendance React/Node) : il fait autorité sur les
 * identifiants d'interaction valides. Le chargeur de cours l'utilise pour
 * refuser au build toute référence `interactions[]` inexistante ; la page de
 * cours l'utilise pour résoudre le composant à afficher.
 *
 * Ajouter une interaction = enregistrer son id ici, puis brancher son
 * composant dans le rendu (src/features/interactions/registry.tsx).
 */

export interface InteractionMeta {
  id: string;
  title: string;
  /** Résumé de ce que l'interaction fait comprendre. */
  summary: string;
}

export const INTERACTIONS: readonly InteractionMeta[] = [
  {
    id: "forces-et-vecteurs",
    title: "Forces et vecteurs sur un avion",
    summary:
      "Afficher, masquer et faire varier les quatre forces du vol pour comprendre un vecteur-force et la notion de résultante.",
  },
  {
    id: "venturi",
    title: "Effet Venturi : vitesse et pression",
    summary:
      "Faire varier le rétrécissement d'un conduit pour voir la vitesse augmenter et la pression statique chuter au col (Bernoulli).",
  },
  {
    id: "incidence-decrochage",
    title: "Incidence et décrochage",
    summary:
      "Augmenter l'angle d'incidence pour voir l'écoulement rester collé, atteindre l'incidence critique, puis décoller — la portance s'effondre.",
  },
];

const BY_ID = new Map(INTERACTIONS.map((i) => [i.id, i]));

export function isKnownInteraction(id: string): boolean {
  return BY_ID.has(id);
}

export function getInteractionMeta(id: string): InteractionMeta | undefined {
  return BY_ID.get(id);
}

export const INTERACTION_IDS: readonly string[] = INTERACTIONS.map((i) => i.id);
