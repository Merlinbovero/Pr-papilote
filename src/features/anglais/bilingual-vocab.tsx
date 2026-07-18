"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftRightIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { foldText } from "@/features/search/normalize";

/** Terme bilingue projeté pour le composant (données sérialisables). */
export interface BilingualEntry {
  slug: string;
  fr: string;
  en: string;
  detail?: string;
}

type Direction = "fr-en" | "en-fr";

/**
 * Vocabulaire bilingue en cartes-éclair : chaque carte montre un côté (français
 * ou anglais selon le sens choisi) et révèle la traduction au clic. Recherche
 * instantanée sur les deux langues. Tout vient du dictionnaire validé — aucune
 * traduction inventée ici.
 */
export function BilingualVocab({ entries }: { entries: BilingualEntry[] }) {
  const [direction, setDirection] = React.useState<Direction>("fr-en");
  const [query, setQuery] = React.useState("");
  const [revealed, setRevealed] = React.useState<Set<string>>(new Set());

  const folded = foldText(query);
  const filtered = React.useMemo(() => {
    if (!folded) return entries;
    return entries.filter((e) => foldText(`${e.fr} ${e.en} ${e.detail ?? ""}`).includes(folded));
  }, [entries, folded]);

  const toggle = (slug: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un mot (FR ou EN)…"
            aria-label="Rechercher dans le vocabulaire bilingue"
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setDirection((d) => (d === "fr-en" ? "en-fr" : "fr-en"));
            setRevealed(new Set());
          }}
          className="border-input hover:bg-accent focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeftRightIcon aria-hidden className="size-4" />
          {direction === "fr-en" ? "Français → Anglais" : "Anglais → Français"}
        </button>
      </div>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {filtered.length} terme{filtered.length > 1 ? "s" : ""} · cliquez une carte pour la
        traduction
      </p>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          Aucun terme ne correspond.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => {
            const isRevealed = revealed.has(entry.slug);
            const front = direction === "fr-en" ? entry.fr : entry.en;
            const back = direction === "fr-en" ? entry.en : entry.fr;
            const backLang = direction === "fr-en" ? "en" : "fr";
            return (
              <li key={entry.slug}>
                <button
                  type="button"
                  onClick={() => toggle(entry.slug)}
                  aria-expanded={isRevealed}
                  className="bg-card hover:border-primary/40 focus-visible:ring-ring block h-full w-full rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="block font-semibold" lang={direction === "fr-en" ? "fr" : "en"}>
                    {front}
                  </span>
                  {isRevealed ? (
                    <span className="text-primary mt-2 block text-sm font-medium" lang={backLang}>
                      {back}
                    </span>
                  ) : (
                    <span className="text-muted-foreground mt-2 block text-sm italic">
                      Afficher la traduction
                    </span>
                  )}
                  {isRevealed && entry.detail ? (
                    <span className="text-muted-foreground mt-1 block text-xs">{entry.detail}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-muted-foreground text-xs">
        Vocabulaire issu du{" "}
        <Link href="/dictionnaire" className="underline underline-offset-4">
          dictionnaire
        </Link>{" "}
        — chaque terme y renvoie vers sa fiche complète quand elle existe.
      </p>
    </div>
  );
}
