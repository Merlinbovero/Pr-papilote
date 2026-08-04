import { z } from "zod";

/**
 * Stockage local versionné et validé — lot F11.
 *
 * ── Ce que l'inventaire a trouvé, et qui motive ce module ───────────────
 * Le produit écrivait **douze clés** dans `localStorage`, selon **trois
 * conventions incompatibles** :
 *
 *  - `prepapilote:revision` — deux-points ;
 *  - `prepapilote.bia.examHistory`, `…seenQuestions`, `…psychotech.history`
 *    — pointé, sans version ;
 *  - `pp.<famille>.history.v1` × huit — préfixe abrégé, **avec** un suffixe de
 *    version ;
 *  - `module-sidebar-collapsed` — sans espace de noms du tout.
 *
 * Deux défauts en découlaient, et ce sont eux que ce module traite.
 *
 * **1. Le marqueur de version était décoratif.** `grep` sur tout le dépôt : le
 * `.v1` de ces huit clés n'apparaît QUE dans leur déclaration. Aucun code ne
 * le lit, ne le compare, n'en dépend. Passer à `.v2` n'aurait pas migré les
 * données : cela aurait simplement écrit ailleurs, en abandonnant les
 * anciennes sans les effacer ni les lire — une perte silencieuse.
 *
 * **2. Rien n'était validé.** Chaque lecteur faisait `JSON.parse(raw) as T`.
 * Un `as` n'est pas une vérification : c'est une affirmation. Ce que rend
 * `localStorage` vient de l'extérieur du programme — d'une version antérieure,
 * d'un autre onglet, d'une extension, d'une écriture interrompue — et le typer
 * de force le fait entrer sans contrôle. La panne survient alors plus tard,
 * loin de sa cause : une échéance `undefined`, une date invalide, un score qui
 * n'est pas un nombre.
 *
 * ── La règle que ce module applique ─────────────────────────────────────
 *
 * > Une donnée relue depuis le stockage est une donnée EXTERNE. Elle est
 * > validée à l'entrée, jamais castée ; et si elle est refusée, elle est mise
 * > de côté, jamais détruite.
 *
 * ── Ce qu'il ne fait pas ────────────────────────────────────────────────
 * Il ne renomme aucune clé. Renommer, c'est abandonner les données de ceux qui
 * ont déjà travaillé — exactement le défaut relevé plus haut. Les clés gardent
 * leur nom historique ; c'est leur CONTENU qui devient versionné.
 */

/**
 * L'enveloppe écrite à partir de ce lot : une version explicite, dans la
 * donnée et non dans le nom de la clé.
 *
 * Le nom de la clé est un identifiant d'emplacement ; la version est une
 * propriété du contenu. Les confondre oblige à changer d'emplacement pour
 * changer de forme, ce qui rend toute migration impossible sans perte.
 */
interface Enveloppe {
  v: number;
  d: unknown;
}

function estEnveloppe(valeur: unknown): valeur is Enveloppe {
  return (
    typeof valeur === "object" &&
    valeur !== null &&
    "v" in valeur &&
    "d" in valeur &&
    typeof (valeur as Enveloppe).v === "number"
  );
}

/**
 * La version des données écrites AVANT ce lot : celles qui n'ont pas
 * d'enveloppe. Elles existent chez tous les utilisateurs actuels.
 */
export const VERSION_HERITEE = 0;

export interface OptionsLecture {
  /** La version attendue par le code appelant. */
  version: number;
  /**
   * Fait passer une donnée d'une version antérieure à la version attendue.
   *
   * Reçoit la charge brute **non validée** : c'est tout l'intérêt, une donnée
   * d'ancienne forme ne passerait pas le schéma courant. À elle de rendre
   * quelque chose que le schéma acceptera, ou `undefined` pour déclarer la
   * migration impossible — auquel cas la donnée part en quarantaine plutôt
   * qu'à la poubelle.
   */
  migrer?: (depuis: number, charge: unknown) => unknown;
}

/** Le suffixe sous lequel une donnée refusée est conservée. */
export function cleQuarantaine(cle: string): string {
  return `${cle}.rejete`;
}

/**
 * Met de côté une valeur refusée, **sans écraser une quarantaine existante**.
 *
 * La première anomalie est la plus instructive ; les suivantes en découlent
 * souvent. Et l'écrasement transformerait une mise de côté en perte, ce que ce
 * module existe précisément pour éviter.
 */
function mettreEnQuarantaine(cle: string, brut: string): void {
  try {
    const quarantaine = cleQuarantaine(cle);
    if (window.localStorage.getItem(quarantaine) === null) {
      window.localStorage.setItem(quarantaine, brut);
    }
  } catch {
    // Quota atteint : on renonce à la copie plutôt qu'à la lecture.
  }
}

/**
 * Lit une valeur, la valide, et renvoie le défaut si elle est inutilisable.
 *
 * Sûr côté serveur : renvoie le défaut si `window` est absent.
 */
export function lireStocke<T>(
  cle: string,
  schema: z.ZodType<T>,
  defaut: T,
  options: OptionsLecture
): T {
  if (typeof window === "undefined") return defaut;

  let brut: string | null = null;
  try {
    brut = window.localStorage.getItem(cle);
  } catch {
    // Stockage inaccessible (mode privé strict) : le produit reste jouable.
    return defaut;
  }
  if (brut === null) return defaut;

  let analyse: unknown;
  try {
    analyse = JSON.parse(brut);
  } catch {
    mettreEnQuarantaine(cle, brut);
    return defaut;
  }

  // Une donnée écrite avant ce lot n'a pas d'enveloppe : elle est de la
  // version héritée, et sa charge est la valeur elle-même.
  const version = estEnveloppe(analyse) ? analyse.v : VERSION_HERITEE;
  let charge: unknown = estEnveloppe(analyse) ? analyse.d : analyse;

  if (version !== options.version) {
    if (!options.migrer) {
      mettreEnQuarantaine(cle, brut);
      return defaut;
    }
    const migre = options.migrer(version, charge);
    if (migre === undefined) {
      mettreEnQuarantaine(cle, brut);
      return defaut;
    }
    charge = migre;
  }

  const verdict = schema.safeParse(charge);
  if (!verdict.success) {
    mettreEnQuarantaine(cle, brut);
    return defaut;
  }
  return verdict.data;
}

/**
 * Écrit une valeur sous enveloppe versionnée.
 *
 * N'échoue jamais : quota dépassé ou stockage indisponible, la séance reste
 * jouable — simplement sans mémorisation, ce qui était déjà le contrat.
 */
export function ecrireStocke(cle: string, valeur: unknown, version: number): void {
  if (typeof window === "undefined") return;
  try {
    const enveloppe: Enveloppe = { v: version, d: valeur };
    window.localStorage.setItem(cle, JSON.stringify(enveloppe));
  } catch {
    // Quota / navigation privée : ignoré, comme avant ce lot.
  }
}
