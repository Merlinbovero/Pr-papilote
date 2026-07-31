import fs from "node:fs";
import path from "node:path";

import { archetypesFileSchema, type Archetype } from "./schemas";
import { getFiches } from "./fiches";
import type { FicheFile } from "./content-schemas";

/**
 * Classification documentaire des fiches — lot M6a.
 *
 * À quelle **famille** une fiche appartient-elle ? Le schéma des fiches ne le
 * dit pas, et n'a pas à le dire : c'est une décision éditoriale, pas une
 * propriété du contenu. Elle vit dans `content/_referentiels/archetypes.json`,
 * versionnée et gelée, résolue ici.
 *
 * Deux garanties, tenues au premier appel :
 *  1. **toute fiche est classée** — sinon le build échoue, plutôt que de
 *     servir une page sous une charte tirée au hasard ;
 *  2. **toute valeur est connue** — le schéma Zod est une énumération fermée,
 *     une faute de frappe ne passe pas.
 */

const FICHIER = path.join(process.cwd(), "content", "_referentiels", "archetypes.json");

interface IndexArchetypes {
  defauts: Map<string, Archetype>;
  exceptions: Map<string, Archetype>;
  naturesDossier: Map<string, string>;
}

let cache: IndexArchetypes | undefined;

function cleCategorie(fiche: Pick<FicheFile, "module" | "category">): string {
  return `${fiche.module}/${fiche.category}`;
}

function construire(): IndexArchetypes {
  const brut = archetypesFileSchema.parse(JSON.parse(fs.readFileSync(FICHIER, "utf-8")));
  const index: IndexArchetypes = {
    defauts: new Map(Object.entries(brut.defauts)),
    exceptions: new Map(Object.entries(brut.exceptions)),
    naturesDossier: new Map(Object.entries(brut.naturesDossier)),
  };

  // Contrôle d'intégrité du corpus entier, au premier accès : une fiche non
  // classée doit faire tomber le build, pas seulement sa propre page.
  const orphelines = getFiches()
    .filter((fiche) => !index.exceptions.has(fiche.id) && !index.defauts.has(cleCategorie(fiche)))
    .map((fiche) => `${fiche.id} (${cleCategorie(fiche)})`);
  if (orphelines.length > 0) {
    throw new Error(
      `Archétypes : ${orphelines.length} fiche(s) non classée(s) — ` +
        `ajouter leur catégorie à « defauts » ou la fiche à « exceptions ».\n  ` +
        orphelines.slice(0, 10).join("\n  ")
    );
  }

  // Une exception qui ne vise aucune fiche est une règle morte : elle donne
  // l'illusion d'un classement là où il n'y en a plus.
  const ids = new Set(getFiches().map((fiche) => fiche.id));
  const mortes = [...index.exceptions.keys()].filter((id) => !ids.has(id));
  if (mortes.length > 0) {
    throw new Error(`Archétypes : exception(s) sans fiche — ${mortes.join(", ")}`);
  }

  return index;
}

function index(): IndexArchetypes {
  if (!cache) {
    cache = construire();
  }
  return cache;
}

/**
 * L'archétype d'une fiche. L'exception par identifiant l'emporte sur le
 * défaut par catégorie ; en l'absence des deux, le build a déjà échoué.
 */
export function getArchetypeFiche(fiche: Pick<FicheFile, "id" | "module" | "category">): Archetype {
  const { defauts, exceptions } = index();
  const archetype = exceptions.get(fiche.id) ?? defauts.get(cleCategorie(fiche));
  if (!archetype) {
    throw new Error(`Archétype introuvable pour la fiche « ${fiche.id} »`);
  }
  return archetype;
}

/** Le défaut d'un couple module/catégorie, ou undefined s'il n'est pas déclaré. */
export function getArchetypeCategorie(
  moduleSlug: string,
  categorie: string
): Archetype | undefined {
  return index().defauts.get(`${moduleSlug}/${categorie}`);
}

/** Toutes les fiches d'un archétype donné — pour les contrôles et les campagnes. */
export function getFichesParArchetype(archetype: Archetype): FicheFile[] {
  return getFiches().filter((fiche) => getArchetypeFiche(fiche) === archetype);
}

/**
 * Le libellé de nature d'un Dossier — « Mission », « Sélection »… — lot M9a.
 *
 * Il vient du référentiel, jamais d'une transformation du nom de catégorie.
 * L'absence d'entrée est une erreur et non un cas à rendre discrètement : une
 * catégorie classée `dossier` sans nature déclarée signifie qu'on a classé sans
 * décider comment la nommer, et le gabarit afficherait alors un vide. Mieux
 * vaut tomber ici.
 */
export function getNatureDossier(fiche: Pick<FicheFile, "id" | "module" | "category">): string {
  const nature = index().naturesDossier.get(cleCategorie(fiche));
  if (!nature) {
    throw new Error(
      `Nature de Dossier non déclarée pour « ${cleCategorie(fiche)} » ` +
        `(fiche ${fiche.id}) — compléter naturesDossier dans archetypes.json`
    );
  }
  return nature;
}
