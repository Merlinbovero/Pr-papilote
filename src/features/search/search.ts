import Fuse from "fuse.js";
import type { SearchEntry, SearchOptions } from "./types";

/**
 * Recherche floue sur un jeu d'entrées. Fonction pure : mêmes entrées,
 * même requête → mêmes résultats. L'index Fuse est reconstruit à la
 * demande par appelant (les appelants long-vécus le mémoïsent).
 */
export function searchEntries(
  entries: SearchEntry[],
  query: string,
  options: SearchOptions = {}
): SearchEntry[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const scope = options.moduleSlug
    ? entries.filter((e) => e.moduleSlug === options.moduleSlug)
    : entries;

  const fuse = new Fuse(scope, {
    keys: [
      { name: "title", weight: 3 },
      { name: "keywords", weight: 2 },
      { name: "moduleName", weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  });

  return fuse.search(trimmed, { limit: options.limit ?? 20 }).map((r) => r.item);
}
