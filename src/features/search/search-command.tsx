"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { searchEntries, suggestCorrection } from "./search";
import { SearchResultItem } from "./search-result-item";
import { SEARCH_TYPE_LABELS, type SearchEntry, type SearchEntryType } from "./types";

interface SearchCommandProps {
  /** Index de recherche, construit côté serveur (indexeur de build). */
  entries: SearchEntry[];
  /** hero : barre large et centrée (accueil) ; compact : header. */
  variant?: "compact" | "hero";
}

/**
 * Palette de recherche unique (Ctrl/Cmd+K) — même index, même
 * classement partout. Le module courant (URL) sert de boost contextuel.
 */
export function SearchCommand({ entries, variant = "compact" }: SearchCommandProps) {
  const router = useRouter();
  const params = useParams<{ module?: string }>();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const moduleSlug = typeof params?.module === "string" ? params.module : undefined;

  const results = React.useMemo(
    () => searchEntries(entries, query, { limit: 12, moduleSlug }),
    [entries, query, moduleSlug]
  );

  const correction = React.useMemo(
    () =>
      query.trim().length > 2 && results.length === 0
        ? suggestCorrection(entries, query)
        : undefined,
    [entries, query, results.length]
  );

  const grouped = React.useMemo(() => {
    const groups = new Map<SearchEntryType, SearchEntry[]>();
    for (const result of results) {
      const list = groups.get(result.type) ?? [];
      list.push(result);
      groups.set(result.type, list);
    }
    return groups;
  }, [results]);

  const onSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <>
      <Button
        variant="outline"
        size={variant === "hero" ? "lg" : "sm"}
        className={cn(
          "text-muted-foreground justify-start gap-2",
          variant === "hero" ? "w-full max-w-xl" : "w-full sm:w-56"
        )}
        onClick={() => setOpen(true)}
      >
        <SearchIcon aria-hidden className="size-4" />
        <span className="flex-1 text-left">
          {variant === "hero"
            ? "Rechercher un appareil, une notion, une procédure…"
            : "Rechercher…"}
        </span>
        <kbd className="bg-muted pointer-events-none hidden rounded px-1.5 font-mono text-xs sm:inline">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Recherche"
        description="Rechercher dans PrépaPilote"
      >
        {/* Le filtrage et le classement sont faits par notre moteur, pas par cmdk. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Appareil, notion, procédure, sigle…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim().length === 0 ? (
                "Commencez à taper pour chercher."
              ) : correction ? (
                <>
                  Vouliez-vous dire{" "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-4"
                    onClick={() => setQuery(correction)}
                  >
                    {correction}
                  </button>
                  {" ?"}
                </>
              ) : (
                "Essayez un sigle, un synonyme ou une orthographe approchée."
              )}
            </CommandEmpty>
            {[...grouped.entries()].map(([type, items]) => (
              <CommandGroup key={type} heading={SEARCH_TYPE_LABELS[type]}>
                {items.map((item) => (
                  <CommandItem key={item.id} value={item.id} onSelect={() => onSelect(item.url)}>
                    <SearchResultItem entry={item} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
