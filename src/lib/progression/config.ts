/**
 * Paramètres du moteur de progression (docs/editorial/progression.md).
 * JAMAIS de seuil codé en dur ailleurs : tout passe par cette config,
 * ajustable sans refonte. Un thème à 5 questions et un thème à 200 ne
 * pèsent pas pareil — d'où le nombre minimal de questions.
 */
export interface MasteryConfig {
  /** En dessous : « à revoir » (%). */
  aRevoirMax: number;
  /** À partir de : « maîtrisé » (%). */
  maitriseMin: number;
  /** Questions récentes minimales pour juger un thème. */
  minQuestions: number;
  /** Fenêtre des questions « récentes » prises en compte, par thème. */
  recentWindow: number;
}

export const DEFAULT_MASTERY_CONFIG: MasteryConfig = {
  aRevoirMax: 60,
  maitriseMin: 80,
  minQuestions: 5,
  recentWindow: 20,
};

export type MasteryLevel = "non-commence" | "a-revoir" | "en-cours" | "maitrise";
