/**
 * Couleur d'identité par concours (retour V1 : code couleur par armée).
 * Renvoie la variable CSS du token à utiliser comme accent (filet, libellé).
 * Les modules transverses (fondamentaux, psychotechnique) retombent sur le
 * bleu drapeau `primary`. Les tokens vivent dans globals.css.
 */
export function getModuleAccentVar(moduleSlug: string): string {
  switch (moduleSlug) {
    case "eopan":
      return "var(--concours-eopan)";
    case "eopn":
      return "var(--concours-eopn)";
    case "alat":
      return "var(--concours-alat)";
    default:
      return "var(--primary)";
  }
}
