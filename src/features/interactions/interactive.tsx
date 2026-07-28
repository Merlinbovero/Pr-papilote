"use client";

import * as React from "react";
import { PlancheBouton } from "@/components/planche/planche-commandes";

/**
 * Conteneur commun des interactions pédagogiques (docs/editorial/cours.md).
 * Base LÉGÈRE et réutilisable — pas une abstraction surdimensionnée :
 * titre, consigne, zone interactive, légende, bouton de réinitialisation,
 * alternative textuelle accessible, indication clavier. Chaque interaction
 * fournit sa propre zone (`children`) et ses commandes (`controls`).
 *
 * Lot M4 — habillage PLANCHE. La carte générique (`bg-card`, coins arrondis,
 * bordure) laisse place à des filets : le bloc s'ouvre sur un filet, la
 * figure vit dans un cadre `.pl-fig`, le pied se referme sur un second filet.
 * **Seule la présentation change** : le contrat de props, l'alternative
 * textuelle, l'annonce `aria-live` et le comportement clavier sont ceux
 * d'avant, à la ligne près.
 *
 * Accessibilité : la zone interactive est décrite par une alternative
 * textuelle (`textAlternative`) exposée à la fois en `aria-live` (mise à jour
 * dynamique annoncée aux lecteurs d'écran) et dans un `<details>` visible.
 * Les commandes sont des éléments natifs (boutons, cases, radios) donc
 * utilisables au clavier ; le focus reste visible via le style global.
 */
export interface InteractiveProps {
  title: string;
  consigne: string;
  /** Alternative textuelle décrivant l'état courant (obligatoire). */
  textAlternative: string;
  /** Zone visuelle (SVG…). */
  children: React.ReactNode;
  /** Commandes (toggles, sélecteurs). */
  controls?: React.ReactNode;
  /** Légende de lecture. */
  legend?: React.ReactNode;
  onReset?: () => void;
  /** Indication clavier affichée sous les commandes. */
  keyboardHint?: string;
}

export function Interactive({
  title,
  consigne,
  textAlternative,
  children,
  controls,
  legend,
  onReset,
  keyboardHint = "Toutes les commandes sont accessibles au clavier (Tab, Entrée/Espace).",
}: InteractiveProps) {
  return (
    <section className="pl-manip" aria-label={title}>
      <h3 className="pl-manip-t">{title}</h3>
      <p className="pl-manip-c">{consigne}</p>

      <div className="pl-fig">{children}</div>

      {/* Alternative textuelle : annoncée dynamiquement + consultable. */}
      <p className="sr-only" aria-live="polite">
        {textAlternative}
      </p>

      {legend ? <div className="pl-manip-l">{legend}</div> : null}

      {controls ? <div className="pl-manip-cmd">{controls}</div> : null}

      <details className="pl-manip-d">
        <summary>Description accessible</summary>
        <p>{textAlternative}</p>
      </details>

      <div className="pl-manip-p">
        <p className="pl-manip-k">{keyboardHint}</p>
        {onReset ? (
          <PlancheBouton variante="fantome" onClick={onReset}>
            Réinitialiser
          </PlancheBouton>
        ) : null}
      </div>
    </section>
  );
}
