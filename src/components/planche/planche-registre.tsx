"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Bascule de registre (clair / sombre / système) en grammaire PLANCHE.
 *
 * Elle pilote le **même** `next-themes` que la bascule historique : le thème
 * choisi sur une route `(site)` est celui qui s'applique en arrivant sur une
 * route `(planche)`, et réciproquement. Deux commandes, un seul état.
 *
 * Le rendu serveur ne connaît pas le thème actif : tant que le composant
 * n'est pas monté, aucun bouton n'est marqué courant. Cela évite une
 * différence d'hydratation sans masquer la commande.
 */
const REGISTRES = [
  { valeur: "light", label: "Clair" },
  { valeur: "dark", label: "Sombre" },
  { valeur: "system", label: "Système" },
] as const;

/** Vrai une fois l'hydratation faite, sans `setState` dans un effet. */
const SANS_ABONNEMENT = () => () => {};

export function PlancheRegistre() {
  const { theme, setTheme } = useTheme();
  const monte = React.useSyncExternalStore(
    SANS_ABONNEMENT,
    () => true,
    () => false
  );

  return (
    <div className="pl-registre" role="group" aria-label="Registre d'affichage">
      {REGISTRES.map((registre) => (
        <button
          key={registre.valeur}
          type="button"
          onClick={() => setTheme(registre.valeur)}
          aria-pressed={monte ? theme === registre.valeur : undefined}
        >
          {registre.label}
        </button>
      ))}
    </div>
  );
}
