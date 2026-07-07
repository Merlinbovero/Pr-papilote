import { getCategories, getModules } from "@/lib/content/referentials";
import type { SearchEntry } from "./types";

/**
 * Construit l'index de recherche à partir des référentiels (côté serveur,
 * au build). S'enrichira des fiches, termes, documents et quiz au fur et
 * à mesure de la production de contenu.
 */
export function buildSearchEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const mod of getModules()) {
    entries.push({
      id: mod.id,
      type: "module",
      title: mod.fullName ? `${mod.name} — ${mod.fullName}` : mod.name,
      moduleName: mod.name,
      moduleSlug: mod.slug,
      url: `/${mod.slug}`,
      keywords: [mod.name, mod.fullName ?? "", mod.organization ?? ""].filter(Boolean),
    });

    for (const category of getCategories(mod.slug)) {
      entries.push({
        id: `${mod.id}.${category.slug}`,
        type: "categorie",
        title: `${category.name} — ${mod.name}`,
        moduleName: mod.name,
        moduleSlug: mod.slug,
        url: `/${mod.slug}/${category.slug}`,
        keywords: [category.name],
      });
    }
  }

  return entries;
}
