"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Conteneur commun des interactions pédagogiques (docs/editorial/cours.md).
 * Base LÉGÈRE et réutilisable — pas une abstraction surdimensionnée :
 * titre, consigne, zone interactive, légende, bouton de réinitialisation,
 * alternative textuelle accessible, indication clavier. Chaque interaction
 * fournit sa propre zone (`children`) et ses commandes (`controls`).
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
    <section className="bg-card space-y-4 rounded-lg border p-4 sm:p-6" aria-label={title}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{consigne}</p>
      </div>

      <div className="bg-background rounded-md border p-3">{children}</div>

      {/* Alternative textuelle : annoncée dynamiquement + consultable. */}
      <p className="sr-only" aria-live="polite">
        {textAlternative}
      </p>
      <details className="text-sm">
        <summary className="text-muted-foreground cursor-pointer">Description accessible</summary>
        <p className="text-foreground mt-2">{textAlternative}</p>
      </details>

      {legend ? <div className="text-muted-foreground text-sm">{legend}</div> : null}

      {controls ? <div className="flex flex-wrap items-center gap-3">{controls}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{keyboardHint}</p>
        {onReset ? (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Réinitialiser
          </Button>
        ) : null}
      </div>
    </section>
  );
}
