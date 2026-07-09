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

export interface ThemeMastery {
  theme: string;
  answered: number;
  correctRate: number;
  level: MasteryLevel;
}

/**
 * Maîtrise par thème sur les questions récentes (fenêtre configurable).
 * Un thème sous le minimum de questions reste « en cours » : on ne juge
 * jamais sur trop peu de données.
 */
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

  const result: ThemeMastery[] = [];
  for (const [theme, list] of byTheme) {
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
    result.push({ theme, answered, correctRate: rate, level });
  }
  return result.sort((a, b) => a.theme.localeCompare(b.theme, "fr"));
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
