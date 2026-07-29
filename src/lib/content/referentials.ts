import fs from "node:fs";
import path from "node:path";
import {
  competencesFileSchema,
  predicatesFileSchema,
  type Competence,
  type Predicate,
} from "./content-schemas";
import {
  categoriesFileSchema,
  cotesFileSchema,
  modulesFileSchema,
  type Category,
  type Module,
} from "./schemas";

/**
 * Chargeurs des référentiels de contenu (content/_referentiels/).
 *
 * Lecture au build uniquement (Server Components, generateStaticParams).
 * Toute donnée invalide fait échouer le build : les référentiels sont un
 * contrat, pas une configuration approximative.
 */

const REFERENTIALS_DIR = path.join(process.cwd(), "content", "_referentiels");

function readJson(fileName: string): unknown {
  const raw = fs.readFileSync(path.join(REFERENTIALS_DIR, fileName), "utf-8");
  return JSON.parse(raw);
}

let modulesCache: Module[] | undefined;
let categoriesCache: Map<string, Category[]> | undefined;

/** Les cinq modules, triés par ordre d'affichage. */
export function getModules(): Module[] {
  if (!modulesCache) {
    const modules = modulesFileSchema.parse(readJson("modules.json"));
    const slugs = new Set(modules.map((m) => m.slug));
    if (slugs.size !== modules.length) {
      throw new Error("Référentiel modules : slugs en double");
    }
    modulesCache = [...modules].sort((a, b) => a.order - b.order);
  }
  return modulesCache;
}

/** Un module par slug, ou undefined si inconnu. */
export function getModule(slug: string): Module | undefined {
  return getModules().find((m) => m.slug === slug);
}

function buildCategoriesIndex(): Map<string, Category[]> {
  const file = categoriesFileSchema.parse(readJson("categories.json"));
  const index = new Map<string, Category[]>();
  for (const mod of getModules()) {
    const list =
      mod.kind === "concours"
        ? file.concours
        : file[mod.slug as "fondamentaux" | "psychotechnique" | "culture"];
    if (!list) {
      throw new Error(`Référentiel catégories : aucune liste pour le module « ${mod.slug} »`);
    }
    const slugs = new Set(list.map((c) => c.slug));
    if (slugs.size !== list.length) {
      throw new Error(`Référentiel catégories : slugs en double pour « ${mod.slug} »`);
    }
    index.set(
      mod.slug,
      [...list].sort((a, b) => a.order - b.order)
    );
  }
  return index;
}

/** Les catégories d'un module, triées. Les trois concours partagent la même liste. */
export function getCategories(moduleSlug: string): Category[] {
  if (!categoriesCache) {
    categoriesCache = buildCategoriesIndex();
  }
  return categoriesCache.get(moduleSlug) ?? [];
}

/** Une catégorie d'un module par slug, ou undefined. */
export function getCategory(moduleSlug: string, categorySlug: string): Category | undefined {
  return getCategories(moduleSlug).find((c) => c.slug === categorySlug);
}

let predicatesCache: Predicate[] | undefined;

/** Le référentiel fermé des prédicats du registre factuel du graphe. */
export function getPredicates(): Predicate[] {
  if (!predicatesCache) {
    const predicates = predicatesFileSchema.parse(readJson("predicats.json"));
    const ids = new Set(predicates.map((p) => p.id));
    if (ids.size !== predicates.length) {
      throw new Error("Référentiel prédicats : identifiants en double");
    }
    predicatesCache = predicates;
  }
  return predicatesCache;
}

let competencesCache: Competence[] | undefined;

/** Le référentiel fermé des compétences transversales évaluées. */
export function getCompetences(): Competence[] {
  if (!competencesCache) {
    const competences = competencesFileSchema.parse(readJson("competences.json"));
    const ids = new Set(competences.map((c) => c.id));
    if (ids.size !== competences.length) {
      throw new Error("Référentiel compétences : identifiants en double");
    }
    competencesCache = competences;
  }
  return competencesCache;
}

/** Une compétence par identifiant, ou undefined si inconnue. */
export function getCompetence(id: string): Competence | undefined {
  return getCompetences().find((c) => c.id === id);
}

let cotesCoursCache: Map<string, string> | undefined;

/**
 * Les cotes documentaires des leçons — **gelées** (lot M5).
 *
 * Lues dans `content/_referentiels/cotes.json`, jamais dérivées au rendu.
 * Deux leçons ne peuvent pas porter la même cote : le build échoue plutôt
 * que de servir deux pages sous une référence identique.
 */
function buildCotesCours(): Map<string, string> {
  const fichier = cotesFileSchema.parse(readJson("cotes.json"));
  const index = new Map(Object.entries(fichier.cours));
  const cotes = new Set(index.values());
  if (cotes.size !== index.size) {
    throw new Error("Référentiel cotes : deux leçons portent la même cote");
  }
  return index;
}

/**
 * La cote d'une leçon, ou `undefined` si elle n'en a pas encore.
 *
 * Une leçon sans cote est une erreur d'intégrité, pas un cas nominal : la
 * page de cours fait échouer le build plutôt que d'afficher un vide.
 */
export function getCoteCours(slug: string): string | undefined {
  if (!cotesCoursCache) {
    cotesCoursCache = buildCotesCours();
  }
  return cotesCoursCache.get(slug);
}

/** Toutes les cotes de leçon, pour les contrôles d'intégrité. */
export function getCotesCours(): ReadonlyMap<string, string> {
  if (!cotesCoursCache) {
    cotesCoursCache = buildCotesCours();
  }
  return cotesCoursCache;
}

let cotesFichesCache: Map<string, string> | undefined;

/**
 * Les cotes documentaires des notices techniques — **gelées** (lot M6b).
 *
 * Clées par identifiant de contenu, pas par slug : l'identifiant est gelé à
 * vie, donc une notice renommée garde sa cote sans qu'aucune clé n'ait à
 * migrer. Deux notices ne peuvent pas porter la même cote.
 */
function buildCotesFiches(): Map<string, string> {
  const fichier = cotesFileSchema.parse(readJson("cotes.json"));
  const index = new Map(Object.entries(fichier.fiches));
  const cotes = new Set(index.values());
  if (cotes.size !== index.size) {
    throw new Error("Référentiel cotes : deux notices portent la même cote");
  }
  return index;
}

/**
 * La cote d'une notice, ou `undefined` si elle n'en a pas.
 *
 * `undefined` est un cas **nominal** hors de La Planche d'identification :
 * seules les 66 notices en portent une. Une fiche de La Leçon n'en a pas, et
 * ne doit pas en recevoir avant que sa famille soit migrée.
 */
export function getCoteFiche(id: string): string | undefined {
  if (!cotesFichesCache) {
    cotesFichesCache = buildCotesFiches();
  }
  return cotesFichesCache.get(id);
}

/** Toutes les cotes de notice, pour les contrôles d'intégrité. */
export function getCotesFiches(): ReadonlyMap<string, string> {
  if (!cotesFichesCache) {
    cotesFichesCache = buildCotesFiches();
  }
  return cotesFichesCache;
}
