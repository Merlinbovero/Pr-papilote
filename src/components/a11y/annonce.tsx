"use client";

import * as React from "react";

/**
 * Région d'annonce d'une séance — lot F1a.
 *
 * L'audit F0b a relevé qu'aucun moteur n'annonce rien : le verdict d'une
 * réponse est rendu dans un paragraphe ordinaire, le changement de question et
 * l'arrivée des résultats ne produisent aucun message. À l'écran tout est
 * visible ; à l'oreille, il ne se passe rien.
 *
 * Deux règles de conception issues de l'audit :
 *
 *  1. **Une seule région par séance.** Plusieurs régions vivantes se font
 *     concurrence et produisent des lectures qui se chevauchent.
 *  2. **Pas de doublon avec le focus.** Ce que le focus fait déjà lire — le
 *     titre « Correction », le nom « Question N sur T », le titre
 *     « Résultats » — n'est pas répété ici. La région porte ce que le focus ne
 *     dit pas : le verdict, le score. Le chronomètre en est explicitement
 *     exclu : il changerait chaque seconde.
 */

export type UrgenceAnnonce = "polite" | "assertive";

export interface AnnonceProps {
  /**
   * Le message à annoncer. Le changer déclenche une lecture ; le vider n'en
   * déclenche aucune.
   */
  message: string;
  /**
   * `polite` pour les événements ordinaires — c'est le défaut. `assertive`,
   * accompagné de `role="alert"`, est réservé aux erreurs qui interrompent la
   * séance : elles doivent couper la lecture en cours, pas attendre.
   */
  urgence?: UrgenceAnnonce;
}

export function Annonce({ message, urgence = "polite" }: AnnonceProps) {
  return (
    <p
      className="sr-only"
      aria-live={urgence}
      // `role="alert"` porte déjà une urgence propre : ne le poser que là où
      // l'interruption est justifiée.
      role={urgence === "assertive" ? "alert" : undefined}
      // Le message se lit d'un bloc : sans cela, un changement partiel peut
      // n'être annoncé qu'en partie.
      aria-atomic="true"
    >
      {message}
    </p>
  );
}

/**
 * Formule le verdict d'une réponse.
 *
 * La bonne réponse n'est citée que si elle est **courte et textuelle**. Une
 * correction longue, graphique ou à choix multiples ne se dicte pas : on
 * renvoie alors à la correction affichée, que le focus vient de rendre
 * atteignable. L'explication éditoriale n'est jamais lue automatiquement.
 */
export const LONGUEUR_MAX_REPONSE_DICTEE = 60;

export function verdictAnnonce(correct: boolean, bonneReponse?: string): string {
  if (correct) {
    return "Bonne réponse.";
  }
  const citable =
    typeof bonneReponse === "string" &&
    bonneReponse.trim().length > 0 &&
    bonneReponse.trim().length <= LONGUEUR_MAX_REPONSE_DICTEE;
  return citable
    ? `Réponse incorrecte. Bonne réponse : ${bonneReponse.trim()}.`
    : "Réponse incorrecte. Consultez la correction affichée.";
}

/** Formule la fin de séance. */
export function finAnnonce(score: number, total: number): string {
  return `Séance terminée. Score : ${score} sur ${total}.`;
}
