"use client";

import * as React from "react";
import { ClockIcon, TimerOffIcon, TriangleAlertIcon } from "lucide-react";

import { chronoEnMots, formatChrono, type EtatChrono } from "@/lib/design/banc-tokens";
import { cn } from "@/lib/utils";

/**
 * Chronomètre du Banc — lot F1b.
 *
 * L'audit F0b a relevé **cinq écritures** pour la même grandeur — `15s`,
 * `8 min 00`, `6 min 00`, `7m 00s`, et un entier nu dans un `<text>` SVG — et
 * un traitement systématiquement périphérique : un texte gris de la taille
 * d'une métadonnée, alors que le temps est la contrainte principale de
 * l'épreuve. Sur SECPIL, la valeur était même enfermée dans un `role="img"` à
 * libellé statique, donc jamais exposée.
 *
 * Ce composant fixe la **représentation**, pas la règle métier.
 *
 * **Aucun seuil n'est codé ici.** Cinq secondes sont critiques sur une
 * question de quinze, anodines sur un examen de deux heures et demie : le
 * seuil appartient au moteur, qui fournit l'état. Le composant sait afficher
 * `normal`, `warning`, `critical`, `expired` et `absent` — il ne décide jamais
 * lequel s'applique.
 */

export interface ChronometreProps {
  /** Temps restant, en secondes. Ignoré lorsque `etat` vaut `absent`. */
  secondes?: number;
  /**
   * L'état visuel, **fourni par le moteur**. Voir la note ci-dessus : le
   * composant ne déduit aucun seuil d'une durée.
   */
  etat?: EtatChrono;
  /** Nom accessible — obligatoire, comme pour la barre de progression. */
  label: string;
  /** Texte affiché quand aucun temps ne court. */
  libelleAbsent?: string;
  className?: string;
}

export function Chronometre({
  secondes = 0,
  etat = "normal",
  label,
  libelleAbsent = "Sans chronomètre",
  className,
}: ChronometreProps) {
  if (etat === "absent") {
    // L'absence de chronomètre est un état à part entière, pas un vide : sur
    // un entraînement libre, c'est une information, et elle se lit.
    return (
      <span
        className={cn("banc-chrono inline-flex items-center gap-1.5 text-sm", className)}
        data-etat="absent"
      >
        <TimerOffIcon aria-hidden className="size-4" />
        {libelleAbsent}
      </span>
    );
  }

  const affiche = formatChrono(secondes);
  const parle = etat === "expired" ? "Temps écoulé" : chronoEnMots(secondes);

  return (
    <span
      // `role="timer"` est la sémantique du compte à rebours ; `aria-live` y
      // est explicitement muet — une valeur qui change chaque seconde
      // couvrirait toutes les autres annonces de la séance.
      role="timer"
      aria-live="off"
      aria-label={label}
      data-etat={etat}
      className={cn("banc-chrono inline-flex items-center gap-1.5 text-sm font-medium", className)}
    >
      {/* Repère non chromatique : l'état ne passe jamais par la seule teinte. */}
      {etat === "critical" || etat === "expired" ? (
        <TriangleAlertIcon aria-hidden className="size-4" />
      ) : (
        <ClockIcon aria-hidden className="size-4" />
      )}
      {/*
        Deux écritures de la même valeur : la compacte pour l'œil, la
        naturelle pour l'oreille. « 7:05 » s'énonce « sept-cent-cinq » ou
        « sept cinq » selon le lecteur d'écran.
        La phrase passe par le CONTENU et non par `aria-valuetext` : cet
        attribut appartient aux rôles à valeur et n'est pas supporté par
        `timer`, où il aurait pu être ignoré sans que rien ne le signale.
      */}
      <span aria-hidden>{etat === "expired" ? "0:00" : affiche}</span>
      <span className="sr-only">{parle}</span>
      {etat === "warning" || etat === "critical" ? (
        <span className="sr-only">{etat === "warning" ? "Temps faible" : "Temps critique"}</span>
      ) : null}
    </span>
  );
}
