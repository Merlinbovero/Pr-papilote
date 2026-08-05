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
 * EXCLUSION. À l'origine, `chaine-anemobarometrique` et
 * `pitot-statique-sources` étaient tous deux laissés intacts : leurs `id="ac"`
 * DIFFÉRAIENT (markerWidth 6 contre 7), et les rendre uniques aurait changé le
 * rendu de la seconde figure — ce que la consigne de M10 excluait.
 *
 * Le lot C2 a reconstruit `chaine-anemobarometrique` de fond en comble : il
 * sort de l'exclusion parce qu'il n'a plus rien à préfixer, ses identifiants
 * naissant préfixés. `pitot-statique-sources` y reste, seul, et sans risque :
 * son `id="ac"` n'a plus de jumeau sur la page.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SCHEMAS = path.join(process.cwd(), "content", "schemas");

/** Le dernier fichier hors périmètre — voir en-tête. */
export const EXCLUS = new Set(["pitot-statique-sources"]);

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
