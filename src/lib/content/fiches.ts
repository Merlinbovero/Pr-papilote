import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  documentNoticeSchema,
  ficheFileSchema,
  questionSchema,
  termeSchema,
  type DocumentNotice,
  type FicheFile,
  type Question,
  type Terme,
} from "./content-schemas";
import { resolveFactualGraph, type GraphNode, type ResolvedLink } from "./graph";
import { getCategory, getModules, getPredicates } from "./referentials";

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
  documents: DocumentNotice[];
  questions: Question[];
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

  const documents = readYamlFiles(path.join(CONTENT_DIR, "documents")).map(({ data }) =>
    documentNoticeSchema.parse(data)
  );
  const documentIds = new Set(documents.map((doc) => doc.id));
  if (documentIds.size !== documents.length) {
    throw new Error("Contenu : identifiants de documents en double");
  }

  // Intégrité des relations pédagogiques, des renvois de termes et des documents
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
    for (const docId of fiche.relations.documents ?? []) {
      if (!documentIds.has(docId)) {
        throw new Error(`${fiche.id} : document associé inexistant « ${docId} »`);
      }
    }
  }

  const questions = readYamlFiles(path.join(CONTENT_DIR, "questions")).map(({ data }) =>
    questionSchema.parse(data)
  );
  const questionIds = new Set(questions.map((q) => q.id));
  if (questionIds.size !== questions.length) {
    throw new Error("Contenu : identifiants de questions en double");
  }
  for (const question of questions) {
    for (const target of question.evaluates) {
      if (!ids.has(target)) {
        throw new Error(`${question.id} : évalue une fiche inexistante « ${target} »`);
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

  return { fiches, termes, documents, questions, linksByObject };
}

function getIndex(): ContentIndex {
  if (!indexCache) {
    indexCache = buildIndex();
  }
  return indexCache;
}

const PRODUCTION_STATUSES = new Set(["publie", "a-mettre-a-jour"]);
const PREVIEW_STATUSES = new Set(["relecture", "validee", "publie", "a-mettre-a-jour"]);

function isVisible(status: string): boolean {
  return PRODUCTION_STATUSES.has(status) || (includeDrafts() && PREVIEW_STATUSES.has(status));
}

/** Toutes les fiches visibles dans l'environnement courant. */
export function getFiches(): FicheFile[] {
  return getIndex().fiches.filter((fiche) => isVisible(fiche.status));
}

/**
 * Contenu BRUT, tous statuts confondus — réservé au contrôle qualité
 * éditorial (`content-check`), qui juge y compris les brouillons.
 */
export function getAllContent(): {
  fiches: FicheFile[];
  documents: DocumentNotice[];
  questions: Question[];
} {
  const index = getIndex();
  return { fiches: index.fiches, documents: index.documents, questions: index.questions };
}

/** Questions visibles de la banque (vide tant qu'aucune n'est produite). */
export function getQuestions(): Question[] {
  return getIndex().questions.filter((question) => isVisible(question.status));
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

/** Notices de documents visibles dans l'environnement courant, triées. */
export function getDocuments(): DocumentNotice[] {
  return getIndex()
    .documents.filter((doc) => isVisible(doc.status))
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

export function getDocument(id: string): DocumentNotice | undefined {
  return getDocuments().find((doc) => doc.id === id);
}

/** Documents associés à une fiche (via `relations.documents`), dans l'ordre déclaré. */
export function getDocumentsForFiche(fiche: FicheFile): DocumentNotice[] {
  return (fiche.relations.documents ?? []).flatMap((id) => {
    const doc = getDocument(id);
    return doc ? [doc] : [];
  });
}

/** Fiches visibles renvoyant vers un document donné. */
export function getFichesForDocument(docId: string): FicheFile[] {
  return getFiches().filter((fiche) => (fiche.relations.documents ?? []).includes(docId));
}

/** URL canonique d'une notice de document. */
export function getDocumentHref(doc: Pick<DocumentNotice, "id">): string {
  return `/documents/${doc.id.replace(/^doc\./, "")}`;
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
