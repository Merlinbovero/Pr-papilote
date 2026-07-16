/**
 * Règle de progression d'un COURS (docs/editorial/cours.md §progression).
 * Fonction PURE, indépendante du stockage : un cours n'a pas de bouton
 * arbitraire « terminé », son statut est DÉRIVÉ de signaux concrets. La
 * progression ne connaît qu'un seul identifiant canonique (le courseId),
 * quel que soit le parcours d'où le cours est ouvert (Fondamentaux, BIA…).
 *
 * Règle V1 (stable, documentée) :
 *   - non-commence : cours jamais ouvert ;
 *   - decouverte   : page ouverte ;
 *   - en-cours     : au moins une étape (hors ouverture) consultée ;
 *   - etudie       : toutes les étapes OBLIGATOIRES consultées ;
 *   - maitrise     : quiz terminé au-dessus du seuil ET aucune erreur active critique.
 */

export type CourseStatus = "non-commence" | "decouverte" | "en-cours" | "etudie" | "maitrise";

export interface CourseProgressConfig {
  /** Score minimal (0–1) du quiz pour « maîtrisé ». */
  quizSeuil: number;
}

export const DEFAULT_COURSE_PROGRESS_CONFIG: CourseProgressConfig = {
  quizSeuil: 0.8,
};

export interface CourseProgressSignals {
  opened: boolean;
  /** Indices (dans la séquence) des étapes consultées. */
  consultedStepIndexes: number[];
  /** Indices des étapes obligatoires de la séquence. */
  obligatoryStepIndexes: number[];
  quizDone: boolean;
  /** Score du quiz (0–1). */
  quizScore: number;
  /** Erreurs actives critiques restant à corriger. */
  activeCriticalErrors: number;
}

export function deriveCourseStatus(
  signals: CourseProgressSignals,
  config: CourseProgressConfig = DEFAULT_COURSE_PROGRESS_CONFIG
): CourseStatus {
  if (!signals.opened) {
    return "non-commence";
  }

  const consulted = new Set(signals.consultedStepIndexes);
  const allObligatoryDone =
    signals.obligatoryStepIndexes.length > 0 &&
    signals.obligatoryStepIndexes.every((i) => consulted.has(i));

  if (
    signals.quizDone &&
    signals.quizScore >= config.quizSeuil &&
    signals.activeCriticalErrors === 0 &&
    allObligatoryDone
  ) {
    return "maitrise";
  }
  if (allObligatoryDone) {
    return "etudie";
  }
  if (consulted.size > 0) {
    return "en-cours";
  }
  return "decouverte";
}

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  "non-commence": "Non commencé",
  decouverte: "Découverte",
  "en-cours": "En cours",
  etudie: "Étudié",
  maitrise: "Maîtrisé",
};
