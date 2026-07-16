/**
 * Informations légales de l'éditeur — **À COMPLÉTER par l'éditeur** avant une
 * diffusion publique large. On n'invente jamais une identité ou un contact :
 * tant qu'une valeur vaut `LEGAL_PLACEHOLDER`, les pages légales affichent un
 * avertissement « à compléter » au lieu d'une donnée fabriquée.
 *
 * Un seul fichier à éditer pour renseigner les mentions légales.
 */
export const LEGAL_PLACEHOLDER = "à compléter";

export const LEGAL = {
  /** Nom ou raison sociale de l'éditeur du site. */
  editorName: LEGAL_PLACEHOLDER,
  /** Directeur / directrice de la publication. */
  publicationDirector: LEGAL_PLACEHOLDER,
  /** Adresse de contact (courriel). */
  contactEmail: LEGAL_PLACEHOLDER,
  /** Statut de l'éditeur (ex. « particulier », « association loi 1901 »). */
  editorStatus: LEGAL_PLACEHOLDER,
  /** Hébergeur (donnée factuelle publique — Vercel). */
  host: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
    url: "https://vercel.com",
  },
} as const;

/** Vrai tant qu'une mention obligatoire n'a pas été renseignée. */
export function hasLegalPlaceholders(): boolean {
  return [LEGAL.editorName, LEGAL.publicationDirector, LEGAL.contactEmail].some(
    (value) => value === LEGAL_PLACEHOLDER
  );
}
