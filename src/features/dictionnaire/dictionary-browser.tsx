"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpenIcon, LanguagesIcon, SearchIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { foldText } from "@/features/search/normalize";

/** Terme projeté pour le navigateur (données sérialisables). */
export interface DictionaryEntry {
  slug: string;
  title: string;
  definition: string;
  sigleExpansion?: string;
  english?: string;
  synonyms: string[];
  hasFiche: boolean;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Filter = "sigle" | "traduit" | "fiche";

/** Première lettre foldée d'un titre (chiffres et symboles rangés sous « # »). */
function initial(title: string): string {
  const folded = foldText(title);
  const first = folded.charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

/**
 * Navigateur du dictionnaire (Phase 12) : recherche instantanée (pliage
 * accents/casse), filtres (sigle, traduit, avec fiche), index alphabétique
 * cliquable et résultats groupés par initiale. Tout est local et accessible :
 * l'index est une navigation par ancres, la recherche met à jour une région
 * annoncée (aria-live).
 */
export function DictionaryBrowser({ entries }: { entries: DictionaryEntry[] }) {
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<Set<Filter>>(new Set());

  const folded = foldText(query);

  const filtered = React.useMemo(() => {
    return entries.filter((entry) => {
      if (filters.has("sigle") && !entry.sigleExpansion) return false;
      if (filters.has("traduit") && !entry.english) return false;
      if (filters.has("fiche") && !entry.hasFiche) return false;
      if (!folded) return true;
      const haystack = foldText(
        [entry.title, entry.sigleExpansion, entry.english, entry.definition, ...entry.synonyms]
          .filter(Boolean)
          .join(" ")
      );
      return haystack.includes(folded);
    });
  }, [entries, filters, folded]);

  const groups = React.useMemo(() => {
    const map = new Map<string, DictionaryEntry[]>();
    for (const entry of filtered) {
      const letter = initial(entry.title);
      const list = map.get(letter);
      if (list) list.push(entry);
      else map.set(letter, [entry]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "fr"));
  }, [filtered]);

  const presentLetters = new Set(groups.map(([letter]) => letter));

  function toggle(filter: Filter) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }

  const FILTERS: { key: Filter; label: string; icon: typeof TagIcon }[] = [
    { key: "sigle", label: "Sigles", icon: TagIcon },
    { key: "traduit", label: "Traduits (EN)", icon: LanguagesIcon },
    { key: "fiche", label: "Avec fiche", icon: BookOpenIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative max-w-xl">
          <SearchIcon
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un terme, un sigle, une traduction…"
            aria-label="Rechercher dans le dictionnaire"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label, icon: Icon }) => {
            const active = filters.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Index alphabétique */}
      <nav aria-label="Index alphabétique" className="flex flex-wrap gap-1">
        {ALPHABET.map((letter) => {
          const present = presentLetters.has(letter);
          return present ? (
            <a
              key={letter}
              href={`#lettre-${letter}`}
              className="hover:bg-accent hover:text-foreground text-muted-foreground flex size-7 items-center justify-center rounded-md text-sm font-medium transition-colors"
            >
              {letter}
            </a>
          ) : (
            <span
              key={letter}
              aria-hidden
              className="text-muted-foreground/30 flex size-7 items-center justify-center text-sm"
            >
              {letter}
            </span>
          );
        })}
      </nav>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {filtered.length} terme{filtered.length > 1 ? "s" : ""}
        {folded || filters.size > 0 ? " correspondant" : ""}
        {filtered.length > 1 && (folded || filters.size > 0) ? "s" : ""}
      </p>

      {groups.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          Aucun terme ne correspond. Essayez un autre mot ou retirez un filtre.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(([letter, list]) => (
            <section key={letter} aria-labelledby={`lettre-${letter}-titre`}>
              <h2
                id={`lettre-${letter}-titre`}
                className="border-primary/30 text-primary mb-3 scroll-mt-24 border-b pb-1 text-lg font-bold"
              >
                <span id={`lettre-${letter}`} className="scroll-mt-24">
                  {letter}
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {list.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/dictionnaire/${entry.slug}`}
                      className="hover:border-primary/40 focus-visible:ring-ring block h-full rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{entry.title}</p>
                        <div className="flex shrink-0 gap-1">
                          {entry.english ? (
                            <Badge variant="outline" className="font-normal">
                              EN
                            </Badge>
                          ) : null}
                          {entry.hasFiche ? (
                            <Badge variant="outline" className="font-normal">
                              Fiche
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {entry.sigleExpansion ? (
                        <p className="text-muted-foreground text-xs">{entry.sigleExpansion}</p>
                      ) : null}
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {entry.definition}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
