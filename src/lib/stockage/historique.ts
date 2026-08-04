import { z } from "zod";
import { ecrireStocke, lireStocke, VERSION_HERITEE } from "./stockage";

/**
 * Les historiques de séance — lot F11.
 *
 * Huit épreuves conservent le même genre de trace : une liste d'entrées
 * horodatées, bornée, purement locale et purement informative. Elles
 * partageaient aussi le même défaut — `JSON.parse(raw) as HistoryEntry[]`,
 * répété huit fois — et le même faux marqueur de version, un `.v1` dans le nom
 * de la clé que personne ne lisait.
 *
 * ── Ce que ce schéma valide, et ce qu'il laisse passer ──────────────────
 * Il valide **ce qui casse réellement** : que la valeur soit un tableau, que
 * chaque entrée soit un objet, et que sa `date` soit analysable — c'est elle
 * qui est formatée à l'affichage, et une date illisible y produit
 * « Invalid Date ».
 *
 * Il laisse passer les champs propres à chaque épreuve. C'est délibéré :
 * recopier ici huit unions d'énumérations (formats, niveaux, thèmes) les
 * dupliquerait, et la copie divergerait au premier ajout de format. Ces
 * champs ne servent qu'à l'affichage d'un tableau récapitulatif ; une valeur
 * inattendue s'y affiche telle quelle, elle ne fait rien tomber.
 *
 * **Ce que ce module ne prétend donc pas être** : une validation exhaustive.
 * C'est une barrière contre les formes impossibles, pas un contrat de
 * contenu — et la distinction est écrite ici pour ne pas être découverte plus
 * tard par surprise.
 */

/** Une entrée d'historique : horodatée, et libre pour le reste. */
export const entreeHistoriqueSchema = z.looseObject({
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "date illisible" }),
});

export const historiqueSchema = z.array(entreeHistoriqueSchema);

/** La version du contenu des historiques depuis ce lot. */
export const VERSION_HISTORIQUE = 1;

/**
 * Lit un historique de séance.
 *
 * Les données déjà présentes chez les utilisateurs sont des tableaux nus :
 * leur forme est la bonne, seul l'emballage est nouveau. Elles sont donc
 * acceptées telles quelles, et la première écriture les enveloppe.
 */
export function lireHistorique<T>(cle: string): T[] {
  return lireStocke<T[]>(cle, historiqueSchema as unknown as z.ZodType<T[]>, [], {
    version: VERSION_HISTORIQUE,
    migrer: (depuis, charge) => (depuis === VERSION_HERITEE ? charge : undefined),
  });
}

/**
 * Écrit un historique.
 *
 * `limite` est **facultative**, et ce n'est pas un détail : trois de ces huit
 * épreuves bornaient déjà leur liste au site d'appel et écrivaient ensuite
 * tout ce qu'elles recevaient. Imposer ici une borne par défaut aurait tronqué
 * leur historique — une perte de données introduite par le lot même qui existe
 * pour l'empêcher. La première version de ce module le faisait ; c'est la
 * relecture du diff, et non un test, qui l'a rattrapé.
 */
export function ecrireHistorique(cle: string, entrees: readonly unknown[], limite?: number): void {
  ecrireStocke(cle, limite === undefined ? entrees : entrees.slice(0, limite), VERSION_HISTORIQUE);
}
