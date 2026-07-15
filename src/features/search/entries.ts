import { getFiches, getFicheHref, getTermes } from "@/lib/content/fiches";
import { getCategories, getCategory, getModule, getModules } from "@/lib/content/referentials";
import { normalizeText } from "./normalize";
import type { SearchEntry } from "./types";

/**
 * Indexeur du moteur de recherche : chaque objet documentaire produit
 * une entrée normalisée au build, sans être modifié. Le résultat est
 * mémoïsé (une seule construction par build).
 */

type SearchEntryInput = Omit<SearchEntry, "norm" | "aliases" | "keywords" | "priority"> &
  Partial<Pick<SearchEntry, "aliases" | "keywords" | "priority">>;

/** Fabrique une entrée d'index avec ses champs pré-normalisés. */
export function createSearchEntry(input: SearchEntryInput): SearchEntry {
  const aliases = input.aliases ?? [];
  const keywords = input.keywords ?? [];
  return {
    ...input,
    aliases,
    keywords,
    priority: input.priority ?? 0,
    norm: {
      title: normalizeText(input.title),
      aliases: aliases.map(normalizeText),
      keywords: keywords.map(normalizeText).filter(Boolean),
      summary: normalizeText(input.summary ?? ""),
    },
  };
}

let entriesCache: SearchEntry[] | undefined;

export function buildSearchEntries(): SearchEntry[] {
  if (entriesCache) {
    return entriesCache;
  }
  const entries: SearchEntry[] = [];

  for (const mod of getModules()) {
    entries.push(
      createSearchEntry({
        id: mod.id,
        type: "module",
        title: mod.fullName ? `${mod.name} — ${mod.fullName}` : mod.name,
        summary: mod.description,
        moduleName: mod.name,
        moduleSlug: mod.slug,
        url: `/${mod.slug}`,
        aliases: [mod.name, mod.fullName ?? "", mod.organization ?? ""].filter(Boolean),
      })
    );

    for (const category of getCategories(mod.slug)) {
      entries.push(
        createSearchEntry({
          id: `${mod.id}.${category.slug}`,
          type: "categorie",
          title: `${category.name} — ${mod.name}`,
          moduleName: mod.name,
          moduleSlug: mod.slug,
          url: `/${mod.slug}/${category.slug}`,
          aliases: [category.name],
        })
      );
    }
  }

  for (const fiche of getFiches()) {
    const mod = getModule(fiche.module);
    entries.push(
      createSearchEntry({
        id: fiche.id,
        type: "fiche",
        family: fiche.type,
        title: fiche.title,
        summary: fiche.summary,
        moduleName: mod?.name ?? fiche.module,
        moduleSlug: fiche.module,
        categoryName: getCategory(fiche.module, fiche.category)?.name,
        url: getFicheHref(fiche),
        aliases: fiche.aliases,
        keywords: fiche.tags,
        priority: fiche.searchPriority,
      })
    );
  }

  for (const terme of getTermes()) {
    entries.push(
      createSearchEntry({
        id: terme.id,
        type: "terme",
        family: "terme",
        title: terme.title,
        summary: terme.definition,
        moduleName: "Dictionnaire",
        moduleSlug: "fondamentaux",
        categoryName: "Dictionnaire",
        url: `/dictionnaire/${terme.id.replace(/^terme\./, "")}`,
        aliases: [terme.sigleExpansion ?? "", ...terme.synonyms].filter(Boolean),
      })
    );
  }

  entriesCache = entries;
  return entries;
}
