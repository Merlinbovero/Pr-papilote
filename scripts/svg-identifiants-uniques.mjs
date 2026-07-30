/**
 * Rend uniques les identifiants dupliqués des SVG de schémas — lot M10.
 *
 * LE DÉFAUT. Seize fiches montent deux figures qui déclarent le même `id`
 * (`a` ou `ac`) : des `<marker>` de pointe de flèche. Le document sert alors
 * deux fois le même identifiant, et `url(#…)` résout sur la PREMIÈRE occurrence
 * — donc, pour la seconde figure, sur une définition qui n'est pas la sienne.
 *
 * LA TRANSFORMATION. Chaque identifiant est préfixé du nom de son fichier :
 * `ac` devient `venturi__ac`. Le préfixe est le `schemaId`, déjà unique et
 * stable par construction — pas un compteur, pas un hachage : renommer un
 * fichier de schéma est un geste éditorial conscient, et la cote documentaire
 * suit la même doctrine.
 *
 * CE QU'ELLE NE TOUCHE PAS. Aucune géométrie, dimension, couleur,
 * transformation, légende ni texte : seuls l'attribut `id` et les références
 * qui le résolvent — `url(#…)`, `href="#…"`, `xlink:href="#…"` — sont réécrits.
 * Le script le vérifie lui-même en comparant le fichier privé de ses
 * identifiants avant et après.
 *
 * EXCLUSION. `chaine-anemobarometrique` et `pitot-statique-sources` sont
 * laissés intacts. Leurs deux `id="ac"` DIFFÈRENT (markerWidth 6 contre 7) :
 * les rendre uniques changerait le rendu de la seconde figure — un retour à
 * l'intention de son auteur, mais un changement visuel tout de même, que la
 * consigne du lot exclut. Ils restent dans la dette du chantier illustration.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SCHEMAS = path.join(process.cwd(), "content", "schemas");

/** Les deux fichiers de la paire divergente — hors périmètre, voir en-tête. */
export const EXCLUS = new Set(["chaine-anemobarometrique", "pitot-statique-sources"]);

/** Retire tout identifiant et toute référence : ce qui reste doit être identique. */
function squelette(svg) {
  return svg
    .replace(/\sid="[^"]*"/g, "")
    .replace(/url\(#[^)]*\)/g, "url(#)")
    .replace(/(xlink:)?href="#[^"]*"/g, 'href="#"');
}

/**
 * Préfixe les identifiants d'un fichier et les références qui les résolvent.
 * Rend `null` si rien ne change.
 */
export function prefixer(svg, schemaId, identifiants) {
  let sortie = svg;
  for (const id of identifiants) {
    const neuf = `${schemaId}__${id}`;
    sortie = sortie
      .replace(new RegExp(`(\\s)id="${id}"`, "g"), `$1id="${neuf}"`)
      .replace(new RegExp(`url\\(#${id}\\)`, "g"), `url(#${neuf})`)
      .replace(new RegExp(`((?:xlink:)?href)="#${id}"`, "g"), `$1="#${neuf}"`);
  }
  if (sortie === svg) return null;

  // Garde-fou : hors identifiants, le fichier doit être identique à l'octet.
  if (squelette(sortie) !== squelette(svg)) {
    throw new Error(`${schemaId} : la transformation a modifié autre chose que les identifiants`);
  }
  return sortie;
}

/** Les identifiants déclarés par un fichier. */
export function identifiantsDe(svg) {
  return [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
}

export function traiter(schemaId, ids, { ecrire = false } = {}) {
  const fichier = path.join(SCHEMAS, `${schemaId}.svg`);
  const svg = readFileSync(fichier, "utf-8");
  const sortie = prefixer(svg, schemaId, ids);
  if (sortie && ecrire) writeFileSync(fichier, sortie);
  return sortie !== null;
}
