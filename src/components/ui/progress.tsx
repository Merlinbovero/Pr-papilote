"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Barre de progression — lot F1a.
 *
 * Deux défauts sont corrigés ici, tous deux relevés par la mesure et non à
 * l'œil (audit F0b) :
 *
 *  1. `value` servait **uniquement** à la transformation CSS de l'indicateur et
 *     n'était jamais transmis à la racine Radix. Celle-ci restait donc en
 *     `data-state="indeterminate"` et n'émettait pas `aria-valuenow` : les
 *     trois barres du produit étaient visuellement justes et **sémantiquement
 *     muettes**. Le `value` remonte désormais à la racine, qui expose la valeur.
 *
 *  2. Deux consommateurs sur trois n'avaient aucun nom accessible — d'où la
 *     violation `aria-progressbar-name` mesurée sur le BIA et la
 *     psychotechnique. Le nom est maintenant exigé **par le type** : une barre
 *     sans `aria-label` ni `aria-labelledby` ne compile pas. Le contrôle passe
 *     ainsi du rapport d'audit au typecheck, où il ne peut plus être oublié.
 *
 * `aria-valuetext` est accepté mais **jamais fabriqué ici** : seule la barre
 * appelante sait ce qu'elle mesure. Une même valeur de 20 % peut vouloir dire
 * « 2 questions terminées sur 10 » ou « 18 réponses complétées sur 100 », et un
 * libellé générique confondrait position courante et avancement complété.
 */

type ProgressBaseProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * Le nom accessible n'est pas optionnel : l'une des deux formes est requise.
 * L'union est ce qui rend l'oubli impossible à la compilation.
 */
type ProgressProps = ProgressBaseProps & ({ "aria-label": string } | { "aria-labelledby": string });

function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      // La valeur remonte à la racine : c'est elle qui porte le rôle
      // `progressbar` et qui expose `aria-valuenow` aux techniques d'assistance.
      value={value}
      className={cn(
        "bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary size-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
