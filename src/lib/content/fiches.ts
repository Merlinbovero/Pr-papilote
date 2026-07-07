import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { ficheFileSchema, termeSchema, type FicheFile, type Terme } from "./content-schemas";
import { resolveFactualGraph, type GraphNode, type ResolvedLink } from "./graph";
import { getCategory, getModule, getModules, getPredicates } from "./referentials";

/**
 * Chargement des objets documentaires depuis content/ (format YAML,
 * décision consignée dans ARCHITECTURE.md). Lecture au build uniquement.
 *
 * Toute violation du contrat (schéma, module/catégorie inconnus, ID en
 * double, arête de graphe invalide, relation pédagogique morte) fait
 * échouer le build : rien d'invalide ne peut être publié.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Les brouillons/relectures sont visibles hors production (et sur les
 * prévisualisations via NEXT_PUBLIC_SHOW_DRAFTS=1) ; seul « publie »
 * sort en production. */
function includeDrafts(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DRAFTS === "1";
}

function readYamlFiles(dir: string): { file: string; data: unknown }[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const out: { file: string; data: unknown }[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".yaml")) {
      const file = path.join(entry.parentPath, entry.name);
      out.push({ file, data: parseYaml(fs.readFileSync(file, "utf-8")) });
    }
  }
  return out;
}

interface ContentIndex {
  fiches: FicheFile[];
  termes: Terme[];
  linksByObject: Map<string, ResolvedLink[]>;
}

let indexCache: ContentIndex | undefined;

function buildIndex(): ContentIndex {
  const fiches: FicheFile[] = [];
  for (const mod of getModules()) {
    for (const { file, data } of readYamlFiles(path.join(CONTENT_DIR, mod.slug))) {
      const fiche = ficheFileSchema.parse(data);
      if (fiche.module !== mod.slug) {
        throw new Error(`${file} : module « ${fiche.module} » ≠ dossier « ${mod.slug} »`);
      }
      if (!getCategory(fiche.module, fiche.category)) {
        throw new Error(`${file} : catégorie inconnue « ${fiche.category} »`);
      }
      fiches.push(fiche);
    }
  }

  const ids = new Set(fiches.map((f) => f.id));
  if (ids.size !== fiches.length) {
    throw new Error("Contenu : identifiants de fiches en double");
  }

  const termes = readYamlFiles(path.join(CONTENT_DIR, "glossaire")).map(({ data }) =>
    termeSchema.parse(data)
  );

  // Intégrité des relations pédagogiques et des renvois de termes
  for (const fiche of fiches) {
    const declared = [
      ...(fiche.relations.prerequisites ?? []),
      ...(fiche.relations.related ?? []),
      ...(fiche.relations.specializes ?? []),
      ...(fiche.relations.variantOf ?? []),
    ];
    for (const target of declared) {
      if (!ids.has(target)) {
        throw new Error(`${fiche.id} : relation pédagogique vers un ID inexistant « ${target} »`);
      }
    }
  }
  for (const terme of termes) {
    if (terme.ficheId && !ids.has(terme.ficheId)) {
      throw new Error(`${terme.id} : renvoi vers une fiche inexistante « ${terme.ficheId} »`);
    }
  }

  // Registre factuel : résolution bloquante
  const nodes: GraphNode[] = fiches.map((fiche) => ({
    id: fiche.id,
    family: fiche.type,
    title: fiche.title,
    edges: fiche.relations.factual ?? [],
  }));
  const { linksByObject, errors } = resolveFactualGraph(nodes, getPredicates());
  if (errors.length > 0) {
    throw new Error(`Graphe documentaire invalide :\n${errors.join("\n")}`);
  }

  return { fiches, termes, linksByObject };
}

function getIndex(): ContentIndex {
  if (!indexCache) {
    indexCache = buildIndex();
  }
  return indexCache;
}

function isVisible(status: string): boolean {
  return status === "publie" || (includeDrafts() && status !== "brouillon");
}

/** Toutes les fiches visibles dans l'environnement courant. */
export function getFiches(): FicheFile[] {
  return getIndex().fiches.filter((fiche) => isVisible(fiche.status));
}

export function getFichesByCategory(moduleSlug: string, categorySlug: string): FicheFile[] {
  return getFiches()
    .filter((fiche) => fiche.module === moduleSlug && fiche.category === categorySlug)
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

export function getFiche(
  moduleSlug: string,
  categorySlug: string,
  slug: string
): FicheFile | undefined {
  return getFiches().find(
    (fiche) => fiche.module === moduleSlug && fiche.category === categorySlug && fiche.slug === slug
  );
}

export function getFicheById(id: string): FicheFile | undefined {
  return getFiches().find((fiche) => fiche.id === id);
}

/** URL canonique d'une fiche. */
export function getFicheHref(fiche: Pick<FicheFile, "module" | "category" | "slug">): string {
  return `/${fiche.module}/${fiche.category}/${fiche.slug}`;
}

/** Liens du graphe (deux sens confondus), triés par poids. */
export function getFicheLinks(id: string): ResolvedLink[] {
  const visibleIds = new Set(getFiches().map((fiche) => fiche.id));
  return (getIndex().linksByObject.get(id) ?? []).filter((link) => visibleIds.has(link.targetId));
}

/** Termes visibles du dictionnaire, triés. */
export function getTermes(): Terme[] {
  return getIndex()
    .termes.filter((terme) => isVisible(terme.status))
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

export function getTermeBySlug(slug: string): Terme | undefined {
  return getTermes().find((terme) => terme.id === `terme.${slug}`);
}

/** Termes du dictionnaire renvoyant vers une fiche donnée. */
export function getTermesForFiche(ficheId: string): Terme[] {
  return getTermes().filter((terme) => terme.ficheId === ficheId);
}

/** Temps de lecture calculé (mots / 200, minimum 1) — jamais déclaré. */
export function getReadingMinutes(fiche: FicheFile): number {
  const words = [
    fiche.content.essentiel.body,
    ...fiche.content.sections.map((section) => section.body),
    ...fiche.content.pieges,
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
