import { z } from "zod";
import { nextReview, type ReviewState } from "@/lib/revision/scheduler";
import { ecrireStocke, lireStocke, VERSION_HERITEE } from "@/lib/stockage/stockage";

/**
 * Persistance locale de l'état de révision espacée (une boîte + une échéance
 * par question). Local uniquement (localStorage) : rien n'est envoyé, rien
 * n'est présumé sans compte. Les fonctions sont sûres côté serveur (no-op si
 * `window` est absent) mais destinées au client.
 */

const STORAGE_KEY = "prepapilote:revision";

/**
 * La version courante du contenu — lot F11.
 *
 * **La clé ne change pas.** Renommer reviendrait à abandonner les échéances de
 * ceux qui révisent déjà, ce qui est précisément le défaut que ce lot corrige
 * ailleurs. C'est le CONTENU qui porte désormais sa version.
 */
const VERSION = 1;

/**
 * Le schéma de l'état de révision, appliqué à la LECTURE.
 *
 * Avant ce lot, la relecture faisait `JSON.parse(raw) as ReviewState` : un
 * `as` affirme, il ne vérifie pas. Une entrée dont `dueAt` ne serait pas une
 * date, ou `box` pas un nombre, entrait sans contrôle et faisait dérailler le
 * planificateur beaucoup plus loin, loin de sa cause.
 *
 * `catchall` sur l'objet racine : les identifiants de question en sont les
 * clés, elles ne peuvent donc pas être énumérées.
 */
const etatSchema = z.record(
  z.string(),
  z.object({
    box: z.number().int().nonnegative(),
    // Une date ISO valide, et pas seulement une chaîne : c'est cette valeur
    // qui décide si une question est due.
    dueAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "échéance illisible",
    }),
  })
);

export function readRevisionState(): ReviewState {
  return lireStocke<ReviewState>(
    STORAGE_KEY,
    etatSchema,
    {},
    {
      version: VERSION,
      /*
        Les données écrites avant ce lot sont des objets nus, sans enveloppe.
        Elles sont VALIDES au sens du schéma : leur forme n'a pas changé, seul
        l'emballage est nouveau. On les accepte telles quelles, et la première
        écriture les enveloppera — sans que personne ne perde une échéance.
      */
      migrer: (depuis, charge) => (depuis === VERSION_HERITEE ? charge : undefined),
    }
  );
}

function writeRevisionState(state: ReviewState): void {
  ecrireStocke(STORAGE_KEY, state, VERSION);
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
