import { createHash } from "node:crypto";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildSearchEntries } from "@/features/search/entries";
import { artefactRechercheSchema, SCHEMA_RECHERCHE } from "@/features/search/artefact";

/**
 * Génère l'artefact statique de l'index de recherche — lot M10.
 *
 * POURQUOI UN SCRIPT ET NON UN GESTIONNAIRE DE ROUTE. La route `force-static`
 * était bien prérendue, mais servie par le chemin des gestionnaires de route :
 * mesuré, `If-None-Match` y rendait 200 au lieu de 304 et rien n'était
 * compressé, là où un actif statique ordinaire — pris comme témoin — rendait
 * 304 et se compressait. Un fichier sous `public/` repasse par le serveur de
 * fichiers statiques et retrouve ce comportement.
 *
 * SOURCE UNIQUE. `buildSearchEntries()` est appelée telle quelle. Aucune règle
 * de construction ni de classement n'est réécrite ici : ce script sérialise, il
 * ne décide pas. La même fonction alimente `/recherche`, l'accueil et la
 * palette.
 *
 * ORDRE DÉTERMINISTE. Les entrées sont triées par identifiant avant écriture,
 * pour qu'un même corpus produise le même octet — donc la même empreinte, donc
 * un cache qui ne s'invalide que lorsque le contenu change vraiment.
 *
 * ÉCRITURE ATOMIQUE. Le fichier est écrit sous un nom temporaire puis renommé.
 * Un échec ne laisse ni fichier partiel ni artefact périmé : le temporaire est
 * supprimé et le processus sort en code non nul, ce qui fait échouer le build.
 */

const SORTIE = path.join(process.cwd(), "public", "generated", "recherche-index.json");

function main(): void {
  const entries = [...buildSearchEntries()].sort((a, b) => a.id.localeCompare(b.id));
  const artefact = { schema: SCHEMA_RECHERCHE, entries };

  // La validation est celle du consommateur, pas une seconde écrite pour
  // l'occasion : un artefact qui passerait ici mais pas dans le navigateur
  // n'aurait aucun intérêt.
  artefactRechercheSchema.parse(artefact);

  const corps = JSON.stringify(artefact);
  const empreinte = createHash("sha256").update(corps).digest("hex").slice(0, 16);

  mkdirSync(path.dirname(SORTIE), { recursive: true });
  const temporaire = `${SORTIE}.tmp`;
  try {
    writeFileSync(temporaire, corps, "utf-8");
    renameSync(temporaire, SORTIE);
  } catch (erreur) {
    rmSync(temporaire, { force: true });
    throw erreur;
  }

  console.log(
    `index de recherche : ${entries.length} entrées, ${(corps.length / 1024).toFixed(0)} Ko, empreinte ${empreinte}`
  );
}

try {
  main();
} catch (erreur) {
  rmSync(`${SORTIE}.tmp`, { force: true });
  console.error("Génération de l'index de recherche impossible :", erreur);
  process.exit(1);
}
