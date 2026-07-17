"use client";

import { ForcesEtVecteurs } from "./forces-et-vecteurs";
import { Venturi } from "./venturi";

/**
 * Résout un identifiant d'interaction (registre) vers son composant client.
 * La page de cours (serveur) délègue ici le rendu de l'interaction déclarée
 * dans `interactions[]`. Ajouter une interaction = un `case` de plus.
 */
export function InteractionSlot({ id, onInteract }: { id: string; onInteract?: () => void }) {
  switch (id) {
    case "forces-et-vecteurs":
      return <ForcesEtVecteurs onInteract={onInteract} />;
    case "venturi":
      return <Venturi onInteract={onInteract} />;
    default:
      return null;
  }
}
