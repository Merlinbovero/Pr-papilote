"use client";

import { ForcesEtVecteurs } from "./forces-et-vecteurs";
import { Venturi } from "./venturi";
import { IncidenceDecrochage } from "./incidence-decrochage";
import { Polaire } from "./polaire";
import { AxesGouvernes } from "./axes-gouvernes";
import { Centrage } from "./centrage";
import { SoufflerieZones } from "./soufflerie-zones";

/**
 * Résout un identifiant d'interaction (registre) vers son composant client.
 * La page de cours (serveur) délègue ici le rendu de l'interaction déclarée
 * dans `interactions[]`. Ajouter une interaction = un `case` de plus.
 *
 * L'ancre `#pl-manip-<id>` sert à désigner une interaction précise — un test
 * de bout en bout, un scan d'accessibilité restreint, un lien profond. Elle
 * est posée ici, au seul endroit qui connaît l'identifiant, plutôt que
 * répétée dans les sept composants.
 */
function rendu(id: string, onInteract?: () => void) {
  switch (id) {
    case "forces-et-vecteurs":
      return <ForcesEtVecteurs onInteract={onInteract} />;
    case "venturi":
      return <Venturi onInteract={onInteract} />;
    case "incidence-decrochage":
      return <IncidenceDecrochage onInteract={onInteract} />;
    case "polaire":
      return <Polaire onInteract={onInteract} />;
    case "axes-gouvernes":
      return <AxesGouvernes onInteract={onInteract} />;
    case "centrage":
      return <Centrage onInteract={onInteract} />;
    case "soufflerie-zones":
      return <SoufflerieZones onInteract={onInteract} />;
    default:
      return null;
  }
}

export function InteractionSlot({ id, onInteract }: { id: string; onInteract?: () => void }) {
  const contenu = rendu(id, onInteract);
  return contenu ? <div id={`pl-manip-${id}`}>{contenu}</div> : null;
}
