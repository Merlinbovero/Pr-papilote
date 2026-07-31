/**
 * Déplacement du focus après une transition d'état — lot F1a.
 *
 * L'audit F0b a mesuré la même perte sur **tous** les parcours : au démarrage
 * d'une séance, à la validation d'une réponse, au changement de question et à
 * l'arrivée sur les résultats, le bouton déclencheur est démonté et le focus
 * retombe sur `body`. Au clavier, on repart alors du haut du document ; sur une
 * épreuve chronométrée, le temps court pendant ce trajet.
 *
 * Déplacer le focus est toutefois une intrusion : si la personne l'a posé
 * ailleurs entre-temps, le lui reprendre est pire que de ne rien faire. D'où
 * une règle explicite, et non un `focus()` inconditionnel.
 */

/** Ce que le focus doit être devenu pour qu'on s'autorise à le déplacer. */
export interface ConditionsFocus {
  /**
   * L'élément qui a **déclenché** la transition — le bouton actionné, pas le
   * dernier élément focalisé. La nuance décide de tout : si l'on mémorisait
   * simplement le focus courant, il vaudrait toujours `activeElement` et la
   * règle ci-dessous n'écarterait jamais rien.
   */
  declencheur: Element | null;
  /** L'élément qui le porte maintenant — typiquement `document.activeElement`. */
  actuel: Element | null;
  /** La racine du sous-arbre qui vient d'être remplacé, si elle est connue. */
  racine?: Element | null;
}

/**
 * Le focus est-il « libre » ?
 *
 * Oui dans trois cas seulement : il est retombé sur `body` (ou nulle part),
 * il porte sur un nœud détaché du document (le sous-arbre a été démonté), ou
 * il est resté sur le déclencheur lui-même. Dans tout autre cas, la personne
 * l'a délibérément placé sur un élément encore valide : on n'y touche pas.
 */
export function focusDeplacable({ declencheur, actuel, racine }: ConditionsFocus): boolean {
  if (!actuel || actuel === document.body || actuel === document.documentElement) {
    return true;
  }
  if (!actuel.isConnected) {
    return true;
  }
  if (declencheur && actuel === declencheur) {
    return true;
  }
  // Le focus est dans la zone qui vient d'être remplacée : elle disparaît,
  // le laisser là n'aurait pas de sens.
  if (racine && racine.contains(actuel) && declencheur && racine.contains(declencheur)) {
    return true;
  }
  return false;
}

/** L'utilisateur demande-t-il la réduction des animations ? */
function animationsReduites(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface OptionsDeplacement extends Omit<ConditionsFocus, "actuel"> {
  /** Amener la cible dans le champ de vision si elle n'y est pas déjà. */
  amenerDansLeCadre?: boolean;
}

/**
 * Donne le focus à `cible`, si et seulement si la règle ci-dessus l'autorise.
 *
 * La cible doit être focalisable : un conteneur ou un titre porte
 * `tabIndex={-1}`, ce qui le rend atteignable par script sans l'insérer dans
 * l'ordre de tabulation.
 *
 * Renvoie `true` si le focus a effectivement été déplacé — ce que les tests
 * vérifient, plutôt que de sonder le DOM après coup.
 */
export function deplacerFocus(
  cible: HTMLElement | null,
  { declencheur, racine, amenerDansLeCadre = true }: OptionsDeplacement = { declencheur: null }
): boolean {
  if (!cible || typeof document === "undefined") {
    return false;
  }
  if (!focusDeplacable({ declencheur, actuel: document.activeElement, racine })) {
    return false;
  }

  // `preventScroll` : on maîtrise nous-mêmes le défilement juste après, pour
  // pouvoir l'annuler quand les animations sont réduites.
  cible.focus({ preventScroll: true });

  if (amenerDansLeCadre && typeof cible.scrollIntoView === "function") {
    cible.scrollIntoView({
      behavior: animationsReduites() ? "auto" : "smooth",
      block: "nearest",
    });
  }
  return document.activeElement === cible;
}
