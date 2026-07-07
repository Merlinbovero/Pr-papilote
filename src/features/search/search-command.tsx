"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { searchEntries } from "./search";
import { SEARCH_TYPE_LABELS, type SearchEntry, type SearchEntryType } from "./types";

interface SearchCommandProps {
  /** Index de recherche, construit côté serveur depuis les référentiels. */
  entries: SearchEntry[];
}

/**
 * Palette de recherche globale (Ctrl/Cmd+K). Présente partout via le
 * header ; la recherche approfondie vit sur /recherche.
 */
export function SearchCommand({ entries }: SearchCommandProps) {
  const router = useRouter();
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

  const results = React.useMemo(
    () => searchEntries(entries, query, { limit: 12 }),
    [entries, query]
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
        size="sm"
        className="text-muted-foreground w-full justify-start gap-2 sm:w-56"
        onClick={() => setOpen(true)}
      >
        <SearchIcon aria-hidden className="size-4" />
        <span className="flex-1 text-left">Rechercher…</span>
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
        {/* Le filtrage est fait par notre moteur (Fuse), pas par cmdk. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Module, catégorie, notion…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim().length === 0 ? "Commencez à taper pour chercher." : "Aucun résultat."}
            </CommandEmpty>
            {[...grouped.entries()].map(([type, items]) => (
              <CommandGroup key={type} heading={SEARCH_TYPE_LABELS[type]}>
                {items.map((item) => (
                  <CommandItem key={item.id} value={item.id} onSelect={() => onSelect(item.url)}>
                    <span>{item.title}</span>
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
