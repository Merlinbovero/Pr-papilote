import type { FicheType } from "./content-schemas";

/**
 * Cycles de vérification différenciés (arbitrage éditorial du 2026-07-07) :
 * les contenus n'ont pas tous le même cycle de vie. Une fiche dont
 * `verifiedAt` dépasse son intervalle est signalée « à re-vérifier » au
 * rapport éditorial. Une mise à jour exceptionnelle reste toujours
 * possible : passer manuellement `status` à `a-reverifier` déclenche la
 * revue hors délai.
 */

const DEFAULT_INTERVAL_MONTHS = 24;

/** Intervalles par type de fiche (prioritaires sur la catégorie). */
const INTERVAL_BY_TYPE: Partial<Record<FicheType, number>> = {
  geopolitique: 6,
  retex: 6,
  // Organisation vivante des forces : revue annuelle
  appareil: 12,
  helicoptere: 12,
  navire: 12,
  "base-aerienne": 12,
  ban: 12,
  regiment: 12,
  escadron: 12,
  flottille: 12,
  armement: 12,
};

/** Intervalles par catégorie (conditions et sélection évoluent vite). */
const INTERVAL_BY_CATEGORY: Record<string, number> = {
  conditions: 6,
  selection: 6,
  geopolitique: 6,
  retex: 6,
  organisation: 12,
};

/**
 * Intervalle de re-vérification en mois pour une fiche.
 * Le plus court des deux règles (type, catégorie) l'emporte ;
 * défaut : 24 mois (notions techniques, dictionnaire).
 */
export function getReviewIntervalMonths(fiche: { type: FicheType; category: string }): number {
  const byType = INTERVAL_BY_TYPE[fiche.type];
  const byCategory = INTERVAL_BY_CATEGORY[fiche.category];
  return Math.min(byType ?? DEFAULT_INTERVAL_MONTHS, byCategory ?? DEFAULT_INTERVAL_MONTHS);
}

/** Une fiche est-elle en retard de vérification à la date donnée ? */
export function isReviewOverdue(
  fiche: { type: FicheType; category: string; verifiedAt: string },
  today: Date
): boolean {
  const deadline = new Date(fiche.verifiedAt);
  deadline.setMonth(deadline.getMonth() + getReviewIntervalMonths(fiche));
  return today > deadline;
}
