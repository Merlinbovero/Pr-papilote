import { nextReview, type ReviewState } from "@/lib/revision/scheduler";

/**
 * Persistance locale de l'état de révision espacée (une boîte + une échéance
 * par question). Local uniquement (localStorage) : rien n'est envoyé, rien
 * n'est présumé sans compte. Les fonctions sont sûres côté serveur (no-op si
 * `window` est absent) mais destinées au client.
 */

const STORAGE_KEY = "prepapilote:revision";

export function readRevisionState(): ReviewState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReviewState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRevisionState(state: ReviewState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible : la session reste jouable, sans mémorisation
  }
}

/**
 * Enregistre le résultat d'une revue et renvoie l'état mis à jour (immuable).
 * L'appelant peut réutiliser la valeur renvoyée pour rafraîchir son rendu.
 */
export function recordReview(
  questionId: string,
  correct: boolean,
  now: Date = new Date()
): ReviewState {
  const state = readRevisionState();
  const updated: ReviewState = {
    ...state,
    [questionId]: nextReview(state[questionId], correct, now),
  };
  writeRevisionState(updated);
  return updated;
}
