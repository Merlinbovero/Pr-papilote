"use client";

import { ForcesEtVecteurs } from "./forces-et-vecteurs";
import { Venturi } from "./venturi";
import { IncidenceDecrochage } from "./incidence-decrochage";
import { Polaire } from "./polaire";

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
    case "incidence-decrochage":
      return <IncidenceDecrochage onInteract={onInteract} />;
    case "polaire":
      return <Polaire onInteract={onInteract} />;
    default:
      return null;
  }
}
