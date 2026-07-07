/**
 * Contrats de props du gabarit de fiche (docs/editorial/gabarit-fiche.md).
 * Les composants du gabarit sont prop-pilotés : ils ne dépendent ni d'une
 * page, ni du futur format de fichier du contenu.
 */

export interface InfoboxEntry {
  label: string;
  value: string | string[];
}

export interface RelationItem {
  label: string;
  href: string;
  /** Contexte affiché en second (ex. nom du module d'appartenance). */
  context?: string;
}

export interface SourceItem {
  title: string;
  url?: string;
  kind: "officiel" | "institutionnel" | "presse" | "ouvrage";
  consultedAt: string;
}

export interface DocumentItem {
  title: string;
  kindLabel: string;
  href: string;
  sizeLabel?: string;
}

export interface TocItem {
  id: string;
  label: string;
}
