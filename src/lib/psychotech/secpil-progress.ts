import {
  modeTasks,
  SECPIL_MODES,
  sessionOverall,
  type SecpilMode,
  type SecpilScore,
} from "./secpil";

/**
 * Progression du SECPIL — logique pure, sans rendu ni stockage.
 *
 * L'attention partagée est une compétence psychomotrice : elle se construit par
 * répétition, et un score isolé ne dit rien. Ce module compare une session à
 * celles jouées **dans la même configuration** — car un « palonnier seul » à
 * 90 % et un « tout ensemble » à 90 % n'ont rien à voir.
 */

/** Une session terminée, telle qu'on la conserve. */
export interface SecpilSessionEntry {
  /** Date ISO de fin de session. */
  date: string;
  mode: SecpilMode;
  /** Niveau de calcul joué (1–5) — sans objet si le calcul était inactif. */
  level: number;
  manche: number | null;
  palonnier: number | null;
  calcul: number | null;
  /** Note globale 0–100 (moyenne des tâches actives). */
  overall: number;
}

/** Nombre de sessions conservées, toutes configurations confondues. */
export const SECPIL_HISTORY_LIMIT = 40;

/** Nombre de points affichés sur la courbe de progression. */
export const SECPIL_CURVE_POINTS = 12;

/**
 * Repère du site — **pas un barème officiel** : au-delà de ce score, tenu sur
 * plusieurs sessions, la configuration est considérée comme acquise.
 */
export const SECPIL_MASTERY_SCORE = 80;
/** Nombre de sessions au-dessus du repère avant de conseiller la suite. */
export const SECPIL_MASTERY_SESSIONS = 3;

/** Le niveau de calcul n'a de sens que si la tâche de calcul est active. */
export function levelMatters(mode: SecpilMode): boolean {
  return modeTasks(mode).includes("calcul");
}

/**
 * Identifiant de configuration : deux sessions comparables partagent la même
 * clé. Le niveau n'entre en compte que là où il change quelque chose.
 */
export function configKey(mode: SecpilMode, level: number): string {
  return levelMatters(mode) ? `${mode}:n${level}` : mode;
}

/** Libellé lisible d'une configuration. */
export function configLabel(mode: SecpilMode, level: number): string {
  const info = SECPIL_MODES.find((m) => m.mode === mode);
  const label = info?.label ?? mode;
  return levelMatters(mode) ? `${label} · niveau ${level}` : label;
}

/** Construit l'entrée d'historique d'une session qui vient de se terminer. */
export function buildEntry(
  mode: SecpilMode,
  level: number,
  score: SecpilScore,
  date: Date
): SecpilSessionEntry {
  return {
    date: date.toISOString(),
    mode,
    level,
    manche: score.manche,
    palonnier: score.palonnier,
    calcul: score.calcul,
    overall: sessionOverall(score),
  };
}

/**
 * Ajoute une session en tête (la plus récente d'abord) et borne l'historique.
 * L'entrée d'origine n'est jamais modifiée.
 */
export function addSession(
  history: readonly SecpilSessionEntry[],
  entry: SecpilSessionEntry,
  limit: number = SECPIL_HISTORY_LIMIT
): SecpilSessionEntry[] {
  return [entry, ...history].slice(0, limit);
}

/** Les sessions d'une configuration donnée, de la plus récente à la plus ancienne. */
export function sessionsFor(
  history: readonly SecpilSessionEntry[],
  mode: SecpilMode,
  level: number
): SecpilSessionEntry[] {
  const key = configKey(mode, level);
  return history.filter((e) => configKey(e.mode, e.level) === key);
}

/** Meilleure note obtenue dans cette configuration (null si jamais jouée). */
export function bestFor(
  history: readonly SecpilSessionEntry[],
  mode: SecpilMode,
  level: number
): number | null {
  const scores = sessionsFor(history, mode, level).map((e) => e.overall);
  return scores.length ? Math.max(...scores) : null;
}

/**
 * Écart entre une session et le meilleur score **antérieur** de la même
 * configuration. `null` si c'est la première session : il n'y a alors rien à
 * comparer, et afficher « +78 » serait trompeur.
 */
export function deltaVsBest(
  historyBefore: readonly SecpilSessionEntry[],
  entry: SecpilSessionEntry
): number | null {
  const best = bestFor(historyBefore, entry.mode, entry.level);
  return best === null ? null : entry.overall - best;
}

/**
 * Points de la courbe, du plus ancien au plus récent (l'historique est stocké
 * dans l'autre sens). Limité aux dernières sessions pour rester lisible.
 */
export function progressionSeries(
  history: readonly SecpilSessionEntry[],
  mode: SecpilMode,
  level: number,
  points: number = SECPIL_CURVE_POINTS
): number[] {
  return sessionsFor(history, mode, level)
    .slice(0, points)
    .map((e) => e.overall)
    .reverse();
}

/** Tendance : écart entre la moyenne de la seconde moitié et de la première. */
export function trend(series: readonly number[]): number | null {
  if (series.length < 4) return null;
  const half = Math.floor(series.length / 2);
  const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.round(mean(series.slice(series.length - half)) - mean(series.slice(0, half)));
}

/** Synthèse d'un mode, pour le tableau de progression. */
export interface SecpilModeSummary {
  mode: SecpilMode;
  label: string;
  sessions: number;
  best: number | null;
  lastDate: string | null;
  /** Vrai si le repère de maîtrise est tenu sur assez de sessions. */
  mastered: boolean;
}

/**
 * Une ligne par mode, dans l'ordre de la progression. Les modes jamais joués
 * apparaissent aussi : c'est le chemin restant qui compte.
 */
export function modeSummaries(history: readonly SecpilSessionEntry[]): SecpilModeSummary[] {
  return SECPIL_MODES.map((info) => {
    const played = history.filter((e) => e.mode === info.mode);
    const scores = played.map((e) => e.overall);
    const dates = played.map((e) => e.date).sort();
    return {
      mode: info.mode,
      label: info.label,
      sessions: played.length,
      best: scores.length ? Math.max(...scores) : null,
      lastDate: dates.length ? dates[dates.length - 1] : null,
      mastered: scores.filter((s) => s >= SECPIL_MASTERY_SCORE).length >= SECPIL_MASTERY_SESSIONS,
    };
  });
}

/** Le mode suivant dans la progression (null si on est déjà au dernier). */
export function nextMode(mode: SecpilMode): SecpilMode | null {
  const i = SECPIL_MODES.findIndex((m) => m.mode === mode);
  return i >= 0 && i < SECPIL_MODES.length - 1 ? SECPIL_MODES[i + 1].mode : null;
}

/**
 * Conseil affiché après une session : monter d'un cran, consolider, ou rien
 * dire tant qu'on manque de recul. Repère du site, jamais présenté comme un
 * seuil officiel.
 */
export type SecpilAdviceKind = "keep-going" | "consolidate" | "step-up" | "max-level";

export interface SecpilAdvice {
  kind: SecpilAdviceKind;
  /** Mode conseillé quand `kind === "step-up"`. */
  suggested: SecpilMode | null;
}

export function adviseAfter(
  history: readonly SecpilSessionEntry[],
  mode: SecpilMode,
  level: number
): SecpilAdvice {
  const scores = sessionsFor(history, mode, level).map((e) => e.overall);
  const strong = scores.filter((s) => s >= SECPIL_MASTERY_SCORE).length;
  if (scores.length < SECPIL_MASTERY_SESSIONS) return { kind: "keep-going", suggested: null };
  if (strong < SECPIL_MASTERY_SESSIONS) return { kind: "consolidate", suggested: null };
  const next = nextMode(mode);
  if (next) return { kind: "step-up", suggested: next };
  return { kind: "max-level", suggested: null };
}
