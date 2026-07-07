/**
 * Contrat du moteur de recherche.
 *
 * L'UI ne connaît que ces types : l'implémentation (Fuse.js aujourd'hui,
 * index plein texte fragmenté demain) peut changer sans toucher aux écrans.
 */

export type SearchEntryType = "module" | "categorie" | "fiche" | "terme" | "document" | "quiz";

export interface SearchEntry {
  /** Identifiant stable du contenu (ex. "eopn.appareils"). */
  id: string;
  type: SearchEntryType;
  /** Titre affiché dans les résultats. */
  title: string;
  /** Nom du module d'appartenance (affiché en contexte). */
  moduleName: string;
  /** Slug du module, pour la recherche contextuelle. */
  moduleSlug: string;
  /** URL canonique de la page. */
  url: string;
  /** Mots-clés additionnels (synonymes, acronymes). */
  keywords?: string[];
}

export interface SearchOptions {
  /** Restreint au module courant (recherche contextuelle). */
  moduleSlug?: string;
  /** Nombre maximal de résultats. */
  limit?: number;
}

export const SEARCH_TYPE_LABELS: Record<SearchEntryType, string> = {
  module: "Modules",
  categorie: "Catégories",
  fiche: "Fiches",
  terme: "Dictionnaire",
  document: "Documents",
  quiz: "Quiz",
};
