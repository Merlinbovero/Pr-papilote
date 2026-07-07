import fs from "node:fs";
import path from "node:path";
import { categoriesFileSchema, modulesFileSchema, type Category, type Module } from "./schemas";

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
        : file[mod.slug as "fondamentaux" | "psychotechnique"];
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
