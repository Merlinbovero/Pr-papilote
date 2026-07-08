"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchWithFallback } from "@/features/search/search";
import { SearchResultItem } from "@/features/search/search-result-item";
import {
  SEARCH_TYPE_LABELS,
  type SearchEntry,
  type SearchEntryType,
} from "@/features/search/types";

interface ModuleOption {
  slug: string;
  name: string;
}

/**
 * Page de recherche : requête dans l'URL (?q=), filtres facultatifs
 * (module, type), politique zéro impasse — la page « Aucun résultat »
 * est interdite.
 */
export function SearchPageClient({
  entries,
  modules,
}: {
  entries: SearchEntry[];
  modules: ModuleOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [value, setValue] = React.useState(query);
  const [moduleFilter, setModuleFilter] = React.useState<string>("tous");
  const [typeFilter, setTypeFilter] = React.useState<string>("tous");

  React.useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`/recherche?${params.toString()}`, { scroll: false });
    }, 200);
    return () => clearTimeout(handle);
  }, [value, router, searchParams]);

  const outcome = React.useMemo(
    () => searchWithFallback(entries, query, { limit: 50 }),
    [entries, query]
  );

  const filtered = outcome.results.filter(
    (entry) =>
      (moduleFilter === "tous" || entry.moduleSlug === moduleFilter) &&
      (typeFilter === "tous" || entry.type === typeFilter)
  );

  return (
    <div className="space-y-8">
      <div className="flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search-input">Rechercher dans PrépaPilote</Label>
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              id="search-input"
              type="search"
              placeholder="Appareil, notion, procédure, sigle…"
              className="pl-9"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="space-y-2">
            <Label htmlFor="filtre-module">Module</Label>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger id="filtre-module" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                {modules.map((mod) => (
                  <SelectItem key={mod.slug} value={mod.slug}>
                    {mod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtre-type">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="filtre-type" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                {(Object.keys(SEARCH_TYPE_LABELS) as SearchEntryType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {SEARCH_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {query.trim().length === 0 ? (
        <p className="text-muted-foreground max-w-prose">
          Décrivez ce que vous cherchez — appareil, base, procédure, notion, sigle — sans vous
          soucier de la catégorie : le moteur s&apos;en charge.
        </p>
      ) : (
        <div className="max-w-2xl space-y-4">
          {outcome.correction ? (
            <p className="text-sm">
              Vouliez-vous dire{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-4"
                onClick={() => setValue(outcome.correction!)}
              >
                {outcome.correction}
              </button>
              {" ?"}
            </p>
          ) : null}
          {outcome.broadened && outcome.results.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune correspondance exacte pour « {query} » — résultats d&apos;une recherche élargie
              :
            </p>
          ) : null}

          {filtered.length > 0 ? (
            <ul className="space-y-2" aria-label="Résultats de recherche">
              {filtered.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.url}
                    className="hover:border-primary/40 focus-visible:ring-ring block rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <SearchResultItem entry={entry} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4 rounded-lg border p-6">
              <p className="font-medium">
                Rien ne correspond à « {query} »
                {moduleFilter !== "tous" || typeFilter !== "tous" ? " avec ces filtres" : ""}.
              </p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                <li>Essayez un sigle (« CDG »), un synonyme ou une orthographe approchée.</li>
                {moduleFilter !== "tous" || typeFilter !== "tous" ? (
                  <li>Élargissez en retirant les filtres.</li>
                ) : null}
              </ul>
              <div className="flex flex-wrap gap-2">
                {(moduleFilter !== "tous" || typeFilter !== "tous") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setModuleFilter("tous");
                      setTypeFilter("tous");
                    }}
                  >
                    Retirer les filtres
                  </Button>
                )}
                {modules.map((mod) => (
                  <Button key={mod.slug} asChild variant="ghost" size="sm">
                    <Link href={`/${mod.slug}`}>{mod.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
