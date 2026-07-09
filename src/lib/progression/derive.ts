import { DEFAULT_MASTERY_CONFIG, type MasteryConfig, type MasteryLevel } from "./config";

/**
 * Dérivation de la progression (docs/editorial/progression.md).
 * Fonctions PURES : à partir des tentatives et des sessions (source de
 * vérité), elles calculent statistiques, maîtrise par thème, parcours et
 * recommandations. Aucun compteur stocké ne peut donc diverger.
 */

/** Tentative enrichie des métadonnées de contenu (assemblées par l'appelant). */
export interface AttemptRecord {
  questionId: string;
  theme: string;
  moduleSlug: string;
  /** Compétences transversales sollicitées par la question (référentiel fermé). */
  competencies?: string[];
  isCorrect: boolean;
  durationMs?: number;
  /** ISO. */
  answeredAt: string;
}

export interface StudySessionRecord {
  moduleSlug: string;
  /** ISO. */
  startedAt: string;
  /** ISO ; absent si session en cours. */
  endedAt?: string;
}

export interface OverallStats {
  answered: number;
  correct: number;
  correctRate: number;
  avgTimeMs: number | undefined;
}

/** Statistiques globales (optionnellement filtrées sur un module). */
export function overallStats(attempts: AttemptRecord[], moduleSlug?: string): OverallStats {
  const scoped = moduleSlug ? attempts.filter((a) => a.moduleSlug === moduleSlug) : attempts;
  const answered = scoped.length;
  const correct = scoped.filter((a) => a.isCorrect).length;
  const timed = scoped.filter((a) => typeof a.durationMs === "number");
  const avgTimeMs =
    timed.length > 0
      ? Math.round(timed.reduce((sum, a) => sum + (a.durationMs ?? 0), 0) / timed.length)
      : undefined;
  return {
    answered,
    correct,
    correctRate: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    avgTimeMs,
  };
}

export interface Mastery {
  answered: number;
  correctRate: number;
  level: MasteryLevel;
}

export interface ThemeMastery extends Mastery {
  theme: string;
}

export interface CompetencyMastery extends Mastery {
  competency: string;
}

/**
 * Niveau de maîtrise d'un groupe de tentatives, sur les questions récentes
 * (fenêtre configurable). Sous le minimum de questions, on reste « en
 * cours » : on ne juge jamais sur trop peu de données. Cœur partagé par la
 * maîtrise par thème et par compétence — une seule logique configurable.
 */
function masteryOf(list: AttemptRecord[], config: MasteryConfig): Mastery {
  const recent = [...list]
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
    .slice(0, config.recentWindow);
  const answered = recent.length;
  const correct = recent.filter((a) => a.isCorrect).length;
  const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  let level: MasteryLevel;
  if (answered < config.minQuestions) {
    level = "en-cours";
  } else if (rate < config.aRevoirMax) {
    level = "a-revoir";
  } else if (rate >= config.maitriseMin) {
    level = "maitrise";
  } else {
    level = "en-cours";
  }
  return { answered, correctRate: rate, level };
}

/** Maîtrise par thème sur les questions récentes (fenêtre configurable). */
export function themeMastery(
  attempts: AttemptRecord[],
  config: MasteryConfig = DEFAULT_MASTERY_CONFIG
): ThemeMastery[] {
  const byTheme = new Map<string, AttemptRecord[]>();
  for (const attempt of attempts) {
    const list = byTheme.get(attempt.theme) ?? [];
    list.push(attempt);
    byTheme.set(attempt.theme, list);
  }
  return [...byTheme.entries()]
    .map(([theme, list]) => ({ theme, ...masteryOf(list, config) }))
    .sort((a, b) => a.theme.localeCompare(b.theme, "fr"));
}

/**
 * Maîtrise par compétence transversale : même logique configurable que par
 * thème, mais une tentative alimente TOUTES les compétences qu'elle sollicite
 * (progression indépendante par compétence — delta chapitre 7).
 */
export function competencyMastery(
  attempts: AttemptRecord[],
  config: MasteryConfig = DEFAULT_MASTERY_CONFIG
): CompetencyMastery[] {
  const byCompetency = new Map<string, AttemptRecord[]>();
  for (const attempt of attempts) {
    for (const competency of attempt.competencies ?? []) {
      const list = byCompetency.get(competency) ?? [];
      list.push(attempt);
      byCompetency.set(competency, list);
    }
  }
  return [...byCompetency.entries()]
    .map(([competency, list]) => ({ competency, ...masteryOf(list, config) }))
    .sort((a, b) => a.competency.localeCompare(b.competency, "fr"));
}

/** Points forts (mieux réussis) et points faibles (à revoir en priorité). */
export function strengthsAndWeaknesses(
  mastery: ThemeMastery[],
  limit = 3
): { strengths: ThemeMastery[]; weaknesses: ThemeMastery[] } {
  const judged = mastery.filter((m) => m.answered > 0);
  const byRate = [...judged].sort((a, b) => a.correctRate - b.correctRate);
  return {
    weaknesses: byRate.slice(0, limit),
    strengths: [...byRate].reverse().slice(0, limit),
  };
}

/** Début de semaine ISO (lundi) au format AAAA-MM-JJ. */
function weekStart(iso: string): string {
  const date = new Date(iso);
  const day = (date.getUTCDay() + 6) % 7; // lundi = 0
  date.setUTCDate(date.getUTCDate() - day);
  return date.toISOString().slice(0, 10);
}

export interface WeeklyPoint {
  week: string;
  answered: number;
  correctRate: number;
}

/** Évolution hebdomadaire du taux de réussite (parcours dans le temps). */
export function weeklyTrend(attempts: AttemptRecord[]): WeeklyPoint[] {
  const byWeek = new Map<string, { answered: number; correct: number }>();
  for (const attempt of attempts) {
    const week = weekStart(attempt.answeredAt);
    const entry = byWeek.get(week) ?? { answered: 0, correct: 0 };
    entry.answered += 1;
    if (attempt.isCorrect) {
      entry.correct += 1;
    }
    byWeek.set(week, entry);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, e]) => ({
      week,
      answered: e.answered,
      correctRate: Math.round((e.correct / e.answered) * 100),
    }));
}

export interface Journey {
  /** ISO de la première activité, ou undefined si aucune. */
  since: string | undefined;
  totalHours: number;
  /** Fin de la dernière session (ISO), ou undefined. */
  lastSessionAt: string | undefined;
  weeklyAverageHours: number;
}

/** Le chemin parcouru : depuis quand, heures investies, rythme moyen. */
export function journey(attempts: AttemptRecord[], sessions: StudySessionRecord[]): Journey {
  const firstAttempt = attempts.reduce<string | undefined>(
    (min, a) => (!min || a.answeredAt < min ? a.answeredAt : min),
    undefined
  );
  const firstSession = sessions.reduce<string | undefined>(
    (min, s) => (!min || s.startedAt < min ? s.startedAt : min),
    undefined
  );
  const since = [firstAttempt, firstSession].filter(Boolean).sort()[0];

  let totalMs = 0;
  let lastSessionAt: string | undefined;
  for (const session of sessions) {
    if (session.endedAt) {
      totalMs += new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
      if (!lastSessionAt || session.endedAt > lastSessionAt) {
        lastSessionAt = session.endedAt;
      }
    }
  }
  const totalHours = Math.round((totalMs / 3_600_000) * 10) / 10;

  let weeklyAverageHours = 0;
  if (since) {
    const weeks = Math.max(1, (Date.now() - new Date(since).getTime()) / (7 * 24 * 3_600_000));
    weeklyAverageHours = Math.round((totalHours / weeks) * 10) / 10;
  }

  return { since, totalHours, lastSessionAt, weeklyAverageHours };
}

export interface Recommendation {
  kind: "reviser" | "renforcer" | "decouvrir";
  label: string;
  /** Motif affiché — la confiance vient de la transparence. */
  reason: string;
  theme?: string;
}

/** Recommandations par règles explicables (jamais une boîte noire). */
export function recommendations(
  mastery: ThemeMastery[],
  dueReviewCount: number,
  untouchedThemes: string[] = []
): Recommendation[] {
  const out: Recommendation[] = [];

  if (dueReviewCount > 0) {
    out.push({
      kind: "reviser",
      label: "Réviser vos erreurs",
      reason: `${dueReviewCount} question${dueReviewCount > 1 ? "s" : ""} à revoir aujourd'hui.`,
    });
  }

  const weak = mastery
    .filter((m) => m.level === "a-revoir")
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 3);
  for (const theme of weak) {
    out.push({
      kind: "renforcer",
      label: `Renforcer : ${theme.theme}`,
      reason: `${theme.correctRate} % de réussite sur ce thème.`,
      theme: theme.theme,
    });
  }

  for (const theme of untouchedThemes.slice(0, 2)) {
    out.push({
      kind: "decouvrir",
      label: `Découvrir : ${theme}`,
      reason: "Thème pas encore travaillé.",
      theme,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Objectifs personnels (delta chapitre 7) — volontairement simples
// ---------------------------------------------------------------------------

/** Les cinq types d'objectifs validés. Aucun autre : liste fermée. */
export type ObjectiveType =
  "terminer-domaine" | "reviser-concours" | "examen-blanc" | "consulter-fiches" | "effectuer-quiz";

export interface Objective {
  id: string;
  type: ObjectiveType;
  label: string;
  /** Cible à atteindre : nombre pour les objectifs de comptage, 100 (%) pour les objectifs de couverture. */
  target: number;
  /** Portée facultative (module pour « terminer un domaine », concours pour « réviser un concours »). */
  moduleSlug?: string;
  concours?: string;
  /** ISO. */
  createdAt: string;
  /** ISO ; présent une fois l'objectif marqué atteint par l'utilisateur. */
  completedAt?: string;
}

/**
 * Mesures dérivées alimentant les objectifs (assemblées par l'appelant à
 * partir des tentatives, sessions et lectures). Tout reste dérivé : aucun
 * compteur d'objectif n'est stocké.
 */
export interface ObjectiveMetrics {
  fichesConsulted: number;
  quizzesCompleted: number;
  examsCompleted: number;
  /** Couverture 0..1 du domaine/concours visé (fraction de thèmes maîtrisés). */
  coverageRatio?: number;
}

export interface ObjectiveProgress {
  current: number;
  target: number;
  ratio: number;
  done: boolean;
}

/** Avancement dérivé d'un objectif. Personnel, sans comparaison ni classement. */
export function objectiveProgress(
  objective: Objective,
  metrics: ObjectiveMetrics
): ObjectiveProgress {
  const target = Math.max(1, objective.target);
  let current: number;
  switch (objective.type) {
    case "consulter-fiches":
      current = metrics.fichesConsulted;
      break;
    case "effectuer-quiz":
      current = metrics.quizzesCompleted;
      break;
    case "examen-blanc":
      current = metrics.examsCompleted;
      break;
    case "terminer-domaine":
    case "reviser-concours":
      current = Math.round((metrics.coverageRatio ?? 0) * target);
      break;
  }
  const capped = Math.min(current, target);
  return {
    current: capped,
    target,
    ratio: Math.round((capped / target) * 100),
    done: Boolean(objective.completedAt) || capped >= target,
  };
}

// ---------------------------------------------------------------------------
// Reprendre (delta chapitre 7) — mémoire du travail, JAMAIS un streak
// ---------------------------------------------------------------------------

export interface ResumePoint {
  /** Dernier module travaillé, ou undefined si aucune activité. */
  moduleSlug: string | undefined;
  /** Dernière activité (ISO) : fin de session ou dernière tentative. */
  lastActivityAt: string | undefined;
  /** Révisions interrompues à reprendre (questions du carnet dues). */
  dueReviewCount: number;
}

/**
 * Où reprendre immédiatement : dernier module travaillé, dernière activité,
 * révisions en attente. On mémorise le point de reprise, jamais un compteur
 * de jours consécutifs (décision ch. 7 : pas de streak).
 */
export function resumePoint(
  attempts: AttemptRecord[],
  sessions: StudySessionRecord[],
  dueReviewCount = 0
): ResumePoint {
  const lastSession = sessions.reduce<StudySessionRecord | undefined>((latest, s) => {
    const at = s.endedAt ?? s.startedAt;
    const best = latest ? (latest.endedAt ?? latest.startedAt) : undefined;
    return !best || at > best ? s : latest;
  }, undefined);
  const lastAttempt = attempts.reduce<AttemptRecord | undefined>(
    (latest, a) => (!latest || a.answeredAt > latest.answeredAt ? a : latest),
    undefined
  );

  const sessionAt = lastSession?.endedAt ?? lastSession?.startedAt;
  const attemptAt = lastAttempt?.answeredAt;
  const lastActivityAt = [sessionAt, attemptAt].filter(Boolean).sort().at(-1);
  const moduleSlug =
    sessionAt && (!attemptAt || sessionAt >= attemptAt)
      ? lastSession?.moduleSlug
      : lastAttempt?.moduleSlug;

  return { moduleSlug, lastActivityAt, dueReviewCount };
}
