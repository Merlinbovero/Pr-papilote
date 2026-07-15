import type { FicheType } from "@/lib/content/content-schemas";

/**
 * Libellé court et lisible d'un type de fiche, pour les cartes et en-têtes.
 * Purement présentiel : n'altère jamais les données.
 */
const LABELS: Record<FicheType, string> = {
  concept: "Concept",
  appareil: "Appareil",
  helicoptere: "Hélicoptère",
  navire: "Navire",
  armement: "Armement",
  "base-aerienne": "Base aérienne",
  ban: "BAN",
  infrastructure: "Infrastructure",
  organisation: "Organisation",
  unite: "Unité",
  regiment: "Régiment",
  escadron: "Escadron",
  flottille: "Flottille",
  grade: "Grade",
  "personnage-historique": "Personnage",
  "notion-aerodynamique": "Aérodynamique",
  "notion-meteo": "Météorologie",
  "notion-navigation": "Navigation",
  "notion-bia": "BIA",
  procedure: "Procédure",
  mission: "Mission",
  retex: "RETEX",
  geopolitique: "Géopolitique",
  "evenement-historique": "Événement",
};

export function getFicheTypeLabel(type: FicheType): string {
  return LABELS[type] ?? type;
}
