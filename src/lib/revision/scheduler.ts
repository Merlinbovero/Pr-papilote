/**
 * Révision espacée — planificateur de Leitner (pur, testé).
 *
 * Chaque question suit un système de « boîtes » : une bonne réponse la fait
 * monter d'une boîte (intervalle plus long avant la prochaine revue), une
 * mauvaise la renvoie en boîte 1 (revue rapprochée). L'état est la source de
 * vérité ; ces fonctions ne font que le dériver — aucun compteur ne peut donc
 * diverger, dans l'esprit de la progression dérivée du projet.
 *
 * Aucune donnée de contenu ici : on ne manipule que des identifiants de
 * questions et des dates. Le vivier réel vient de la banque déjà validée.
 */

/** Boîtes 1 → 5 et leur délai (en jours) avant la prochaine revue. */
export const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 15,
};

export const MAX_BOX = 5;

/** Nombre de nouvelles questions introduites par défaut dans une session. */
export const DEFAULT_NEW_PER_SESSION = 15;

export interface ReviewItem {
  /** Boîte courante (1 à MAX_BOX). */
  box: number;
  /** Prochaine échéance de revue, ISO (AAAA-MM-JJ ou datetime ISO). */
  dueAt: string;
}

export type ReviewState = Record<string, ReviewItem>;

const DAY_MS = 86_400_000;

/** Calcule le prochain état d'une question après une revue. */
export function nextReview(
  previous: ReviewItem | undefined,
  correct: boolean,
  now: Date = new Date()
): ReviewItem {
  const currentBox = previous?.box ?? 0;
  const box = correct ? Math.min(MAX_BOX, currentBox + 1) : 1;
  const dueAt = new Date(now.getTime() + BOX_INTERVAL_DAYS[box] * DAY_MS).toISOString();
  return { box, dueAt };
}

/** Une question déjà vue est « à revoir » si son échéance est atteinte. */
export function isDueReview(item: ReviewItem | undefined, now: Date = new Date()): boolean {
  if (!item) return false;
  return new Date(item.dueAt).getTime() <= now.getTime();
}

export interface ReviewQueue {
  /** Questions déjà vues dont l'échéance est atteinte (priorité). */
  due: string[];
  /** Nouvelles questions introduites aujourd'hui (plafonnées). */
  fresh: string[];
}

/**
 * File de révision du jour : d'abord les revues échues, puis un nombre borné
 * de questions jamais vues. Les identifiants candidats gardent leur ordre
 * d'entrée (le mélange éventuel est laissé à l'appelant).
 */
export function buildReviewQueue(
  candidateIds: readonly string[],
  state: ReviewState,
  options: { now?: Date; newLimit?: number } = {}
): ReviewQueue {
  const now = options.now ?? new Date();
  const newLimit = options.newLimit ?? DEFAULT_NEW_PER_SESSION;
  const due: string[] = [];
  const fresh: string[] = [];
  for (const id of candidateIds) {
    const item = state[id];
    if (!item) {
      if (fresh.length < newLimit) fresh.push(id);
    } else if (isDueReview(item, now)) {
      due.push(id);
    }
  }
  return { due, fresh };
}

export interface ReviewStats {
  /** Questions candidates jamais vues. */
  neverSeen: number;
  /** Questions déjà vues mais échues. */
  dueNow: number;
  /** Questions vues et à jour (pas encore échues). */
  upcoming: number;
  /** Questions considérées « acquises » (boîte maximale). */
  mastered: number;
}

/** Répartition d'un vivier candidat pour l'affichage (pastilles, tableau de bord). */
export function reviewStats(
  candidateIds: readonly string[],
  state: ReviewState,
  now: Date = new Date()
): ReviewStats {
  let neverSeen = 0;
  let dueNow = 0;
  let upcoming = 0;
  let mastered = 0;
  for (const id of candidateIds) {
    const item = state[id];
    if (!item) {
      neverSeen += 1;
      continue;
    }
    if (item.box >= MAX_BOX && !isDueReview(item, now)) mastered += 1;
    if (isDueReview(item, now)) dueNow += 1;
    else upcoming += 1;
  }
  return { neverSeen, dueNow, upcoming, mastered };
}
