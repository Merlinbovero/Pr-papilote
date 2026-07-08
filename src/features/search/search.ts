import Fuse from "fuse.js";
import { boundedLevenshtein, normalizeText } from "./normalize";
import type { SearchEntry, SearchOptions, SearchOutcome } from "./types";

/**
 * Moteur de classement (docs/editorial/moteur-de-recherche.md).
 * Score composite : correspondance (exact > préfixe > contenu > flou ;
 * titre > alias > mots-clés > résumé) + type d'objet + contexte de
 * module (boost, jamais filtre) + priorité éditoriale. Fonctions pures.
 */

const TYPE_BOOST: Record<SearchEntry["type"], number> = {
  fiche: 15,
  terme: 15,
  document: 8,
  quiz: 8,
  categorie: 4,
  module: 4,
};

const CONTEXT_BOOST = 10;

function matchScore(query: string, entry: SearchEntry): number {
  const { norm } = entry;
  let best = 0;
  const consider = (score: number) => {
    best = Math.max(best, score);
  };

  if (norm.title === query) {
    consider(100);
  } else if (norm.title.startsWith(query)) {
    consider(85);
  } else if (norm.title.includes(query)) {
    consider(60);
  }

  for (const alias of norm.aliases) {
    if (alias === query) {
      consider(95);
    } else if (alias.startsWith(query)) {
      consider(75);
    } else if (alias.includes(query)) {
      consider(50);
    }
  }

  // Requête multi-mots : tous les tokens présents dans le titre
  const tokens = query.split(" ");
  if (tokens.length > 1 && tokens.every((token) => norm.title.includes(token))) {
    consider(70);
  }

  if (norm.keywords.some((keyword) => keyword.includes(query))) {
    consider(40);
  }
  if (norm.summary.includes(query)) {
    consider(25);
  }

  return best;
}

function rank(entries: SearchEntry[], query: string, options: SearchOptions): SearchEntry[] {
  const scored = entries
    .map((entry) => {
      const base = matchScore(query, entry);
      if (base === 0) {
        return undefined;
      }
      const context = options.moduleSlug === entry.moduleSlug ? CONTEXT_BOOST : 0;
      return { entry, score: base + TYPE_BOOST[entry.type] + context + entry.priority };
    })
    .filter((item): item is { entry: SearchEntry; score: number } => item !== undefined);

  scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "fr"));
  return scored.map((item) => item.entry);
}

/** Couche floue (fautes de frappe) : Fuse.js sur titres et alias normalisés. */
function fuzzy(
  entries: SearchEntry[],
  query: string,
  threshold: number,
  limit: number
): SearchEntry[] {
  const fuse = new Fuse(entries, {
    keys: [
      { name: "norm.title", weight: 3 },
      { name: "norm.aliases", weight: 2 },
      { name: "norm.keywords", weight: 1 },
    ],
    threshold,
    ignoreLocation: true,
  });
  return fuse.search(query, { limit }).map((result) => result.item);
}

/** Recherche classée. Retourne [] pour une requête vide. */
export function searchEntries(
  entries: SearchEntry[],
  query: string,
  options: SearchOptions = {}
): SearchEntry[] {
  const normalized = normalizeText(query);
  if (normalized.length === 0) {
    return [];
  }
  const limit = options.limit ?? 20;
  const ranked = rank(entries, normalized, options);

  if (ranked.length >= limit) {
    return ranked.slice(0, limit);
  }
  // Complète par le flou (fautes de frappe), sans doublon.
  const seen = new Set(ranked.map((entry) => entry.id));
  const extras = fuzzy(entries, normalized, 0.3, limit).filter((entry) => !seen.has(entry.id));
  return [...ranked, ...extras].slice(0, limit);
}

/** Titre ou alias le plus proche de la requête (distance ≤ 2). */
export function suggestCorrection(entries: SearchEntry[], query: string): string | undefined {
  const normalized = normalizeText(query);
  if (normalized.length < 3) {
    return undefined;
  }
  let best: { distance: number; display: string } | undefined;
  for (const entry of entries) {
    const candidates = [entry.norm.title, ...entry.norm.aliases];
    for (const candidate of candidates) {
      if (candidate === normalized) {
        continue;
      }
      const distance = boundedLevenshtein(normalized, candidate, 2);
      if (distance <= 2 && (!best || distance < best.distance)) {
        best = { distance, display: entry.title };
      }
    }
  }
  return best?.display;
}

/**
 * Recherche « zéro impasse » : résultats classés, sinon correction +
 * recherche élargie annoncée. La page « Aucun résultat » est interdite.
 */
export function searchWithFallback(
  entries: SearchEntry[],
  query: string,
  options: SearchOptions = {}
): SearchOutcome {
  const results = searchEntries(entries, query, options);
  if (results.length > 0) {
    return { results, broadened: false };
  }
  const normalized = normalizeText(query);
  if (normalized.length === 0) {
    return { results: [], broadened: false };
  }
  const correction = suggestCorrection(entries, query);
  const broadened = fuzzy(entries, normalized, 0.55, options.limit ?? 10);
  return { results: broadened, correction, broadened: broadened.length > 0 };
}
