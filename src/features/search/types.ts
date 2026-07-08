/**
 * Contrat du moteur de recherche.
 *
 * L'UI ne connaît que ces types : l'implémentation (scorer maison +
 * Fuse.js aujourd'hui, index fragmenté demain) peut changer sans
 * toucher aux écrans.
 */

export type SearchEntryType = "module" | "categorie" | "fiche" | "terme" | "document" | "quiz";

export interface SearchEntry {
  /** Identifiant stable de l'objet documentaire. */
  id: string;
  type: SearchEntryType;
  /** Famille d'objet (type de fiche) — pilote l'icône du résultat. */
  family?: string;
  /** Titre affiché dans les résultats. */
  title: string;
  /** Résumé d'une ligne affiché sous le titre. */
  summary?: string;
  /** Nom du module d'appartenance (affiché en contexte). */
  moduleName: string;
  /** Slug du module, pour le boost contextuel. */
  moduleSlug: string;
  /** Nom de la catégorie (affiché en contexte). */
  categoryName?: string;
  /** URL canonique de la page. */
  url: string;
  /** Alias (sigles, appellations) — clés d'entrée, jamais des doublons. */
  aliases: string[];
  /** Mots-clés additionnels (tags, synonymes). */
  keywords: string[];
  /** Priorité éditoriale 0–5 (départage des homonymes). */
  priority: number;
  /** Champs pré-normalisés au build (accents, casse, pluriels). */
  norm: {
    title: string;
    aliases: string[];
    keywords: string[];
    summary: string;
  };
}

export interface SearchOptions {
  /** Module courant : boost contextuel — jamais un filtre. */
  moduleSlug?: string;
  /** Nombre maximal de résultats. */
  limit?: number;
}

export interface SearchOutcome {
  results: SearchEntry[];
  /** Titre le plus proche quand la requête ne donne rien (« Vouliez-vous dire… »). */
  correction?: string;
  /** Les résultats proviennent d'une recherche élargie (annoncée à l'utilisateur). */
  broadened: boolean;
}

export const SEARCH_TYPE_LABELS: Record<SearchEntryType, string> = {
  module: "Modules",
  categorie: "Catégories",
  fiche: "Fiches",
  terme: "Dictionnaire",
  document: "Documents",
  quiz: "Quiz",
};

export const SEARCH_TYPE_LABEL_SINGULAR: Record<SearchEntryType, string> = {
  module: "Module",
  categorie: "Catégorie",
  fiche: "Fiche",
  terme: "Terme",
  document: "Document",
  quiz: "Quiz",
};
