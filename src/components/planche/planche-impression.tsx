"use client";

import { PlancheBouton } from "./planche-commandes";

/**
 * Commande d'impression — lot M6b.
 *
 * Reprend, en grammaire PLANCHE, l'affordance « Version PDF » du gabarit
 * historique (`@/components/content/print-button`). Même comportement, même
 * absence de dépendance : `window.print()`, et la feuille d'impression fait le
 * reste. Elle disparaît à l'impression, comme l'originale.
 *
 * Elle existe parce que la campagne visuelle a montré sa disparition : le
 * bouton était présent sur les 66 notices avant le lot et absent après. Une
 * migration graphique n'a pas le droit de retirer une fonction.
 */
export function PlancheImpression() {
  return (
    <div className="pl-btns print:hidden">
      <PlancheBouton variante="fantome" onClick={() => window.print()}>
        Version PDF
      </PlancheBouton>
    </div>
  );
}
