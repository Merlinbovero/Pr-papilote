/**
 * URL canonique de la plateforme (SEO — ch. 9 §7).
 *
 * Configurable par variable d'environnement (jamais de domaine codé en dur) :
 * `NEXT_PUBLIC_SITE_URL` en production. Défaut local propre en son absence,
 * conforme à la règle « le build ne dépend jamais des secrets ».
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

/** URL absolue à partir d'un chemin racine (`/eopan/...`). */
export function absoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
