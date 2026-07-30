import { createHash } from "node:crypto";

import { buildSearchEntries } from "@/features/search/entries";

/**
 * L'index de recherche, servi comme artefact statique — lot M10.
 *
 * POURQUOI UNE ROUTE ET NON UN ACCESSOIRE DE PAGE. `SearchCommand` recevait
 * l'index en propriété : sur une fiche, cela sérialisait **431 kB** dans le
 * HTML, et la page passait de 85 à 516 kB. Le lien vers `/recherche` était la
 * parade. Ici l'index quitte la page : il devient une ressource, chargée à la
 * première ouverture de la palette et jamais avant.
 *
 * SOURCE UNIQUE. `buildSearchEntries()` est la même fonction que consomment
 * `/recherche` et l'accueil : même corpus, mêmes règles de classement. Il n'y a
 * pas deux index à tenir synchronisés, il y en a un.
 *
 * `force-static` fait prérendre la route au build : aucune exécution par
 * requête. La version est l'empreinte du contenu — elle change quand, et
 * seulement quand, le corpus change.
 */
export const dynamic = "force-static";

/** Version du schéma servi. À incrémenter si la forme des entrées change. */
const SCHEMA = 1;

export function GET() {
  const entries = buildSearchEntries();
  const corps = JSON.stringify({ schema: SCHEMA, entries });
  const empreinte = createHash("sha256").update(corps).digest("hex").slice(0, 16);

  return new Response(corps, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // L'empreinte permet la requête conditionnelle : un client qui revient
      // avec `If-None-Match` reçoit 304 et ne retélécharge rien.
      etag: `"${empreinte}"`,
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
