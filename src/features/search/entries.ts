import { getFiches, getFicheHref, getTermes } from "@/lib/content/fiches";
import { getCategories, getModule, getModules } from "@/lib/content/referentials";
import type { SearchEntry } from "./types";

/**
 * Construit l'index de recherche à partir des référentiels et des objets
 * documentaires (fiches, termes) — côté serveur, au build. S'enrichira
 * des documents et quiz avec leurs moteurs.
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

  for (const fiche of getFiches()) {
    const mod = getModule(fiche.module);
    entries.push({
      id: fiche.id,
      type: "fiche",
      title: fiche.title,
      moduleName: mod?.name ?? fiche.module,
      moduleSlug: fiche.module,
      url: getFicheHref(fiche),
      keywords: [fiche.summary, ...fiche.tags],
    });
  }

  for (const terme of getTermes()) {
    entries.push({
      id: terme.id,
      type: "terme",
      title: terme.title,
      moduleName: "Dictionnaire",
      moduleSlug: "fondamentaux",
      url: `/dictionnaire/${terme.id.replace(/^terme\./, "")}`,
      keywords: [terme.sigleExpansion ?? "", ...terme.synonyms].filter(Boolean),
    });
  }

  return entries;
}
