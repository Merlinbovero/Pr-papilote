/**
 * Drapeau de fonctionnalité du laboratoire de design.
 *
 * Le prototype PLANCHE (`/design-lab/planche/…`) n'existe que si la variable
 * d'environnement `NEXT_PUBLIC_DESIGN_LAB` vaut « 1 ». Sans elle, les routes
 * répondent 404 : aucun visiteur ne peut tomber dessus, et le prototype ne
 * fait pas partie de la surface publique du site.
 *
 * Le drapeau est également ouvert en développement, pour ne pas avoir à
 * configurer l'environnement local à chaque session.
 */
export function isDesignLabEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DESIGN_LAB === "1" || process.env.NODE_ENV === "development";
}
