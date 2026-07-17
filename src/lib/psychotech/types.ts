/**
 * Contrat du moteur psychotechnique (docs/editorial/module-psychotechnique.md).
 * Tout est QCM à 4 choix — un format unique pour un player unique.
 */

export const PSY_FAMILIES = [
  "calcul-mental",
  "suites-numeriques",
  "series-logiques",
  "memoire",
  "empan-chiffres",
  "attention",
  "orientation",
  "rapidite",
  "dominos",
  "rotation-mentale",
  "double-tache",
] as const;

export type PsyFamily = (typeof PSY_FAMILIES)[number];

export interface PsyFamilyInfo {
  slug: PsyFamily;
  name: string;
  /** Consigne standardisée, affichée avant la première question. */
  consigne: string;
  /** Fiche méthodologique associée (href). */
  ficheHref: string;
  /** Temps limite par question, par niveau de difficulté (secondes). */
  timeLimits: [number, number, number];
}

export interface PsyQuestion {
  id: string;
  family: PsyFamily;
  difficulty: 1 | 2 | 3;
  /** Phase d'exposition chronométrée (mémoire) — affichée PUIS masquée. */
  exposure?: { lines: string[]; seconds: number };
  prompt: string;
  /** Grille monospace (attention) — rendue telle quelle. */
  gridLines?: string[];
  choices: string[];
  correctIndex: number;
  /** Explication de méthode (pas seulement la réponse). */
  method: string;
  timeLimitSeconds: number;
}

export interface PsySessionConfig {
  families: PsyFamily[];
  size: number;
  seed: number;
}

export interface PsyAnswerEvent {
  questionId: string;
  family: PsyFamily;
  correct: boolean | undefined; // undefined = temps écoulé sans réponse
  elapsedMs: number;
}

export interface PsyFamilyScore {
  family: PsyFamily;
  asked: number;
  answered: number;
  correct: number;
  /** Justes / répondues (0 si rien répondu). */
  precision: number;
  avgMs: number;
}

export interface PsySessionScore {
  asked: number;
  answered: number;
  correct: number;
  precision: number;
  avgMs: number;
  parFamille: PsyFamilyScore[];
  /** Familles fragiles (précision < 60 % sur au moins 3 questions). */
  aRetravailler: PsyFamily[];
}
