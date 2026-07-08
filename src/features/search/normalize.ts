/**
 * Normalisation française du moteur de recherche — appliquée à l'index
 * ET aux requêtes (doctrine : docs/editorial/moteur-de-recherche.md).
 * « Porte avion », « Porte-avions » et « PORTE-AVIONS » → « porte avion ».
 */

/** Plie accents, casse et ponctuation ; conserve lettres et chiffres. */
export function foldText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[''']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Singulier naïf : suffixe s/x retiré sur les tokens de 4 lettres et plus. */
export function singularizeToken(token: string): string {
  if (token.length >= 4 && (token.endsWith("s") || token.endsWith("x"))) {
    return token.slice(0, -1);
  }
  return token;
}

/** Normalisation complète : pliage + tokenisation + singulier. */
export function normalizeText(input: string): string {
  return foldText(input).split(" ").filter(Boolean).map(singularizeToken).join(" ");
}

/**
 * Distance d'édition bornée (Levenshtein) pour les corrections
 * « Vouliez-vous dire… ». Retourne max + 1 dès que la borne est dépassée.
 */
export function boundedLevenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) {
    return max + 1;
  }
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > max) {
      return max + 1;
    }
    previous = current;
  }
  return previous[b.length];
}
