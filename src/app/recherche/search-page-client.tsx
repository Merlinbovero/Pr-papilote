"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchEntries } from "@/features/search/search";
import { SEARCH_TYPE_LABELS, type SearchEntry } from "@/features/search/types";

/**
 * Page de recherche globale. La requête vit dans l'URL (?q=…) : les
 * recherches sont partageables et l'historique navigateur fonctionne.
 */
export function SearchPageClient({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [value, setValue] = React.useState(query);

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

  const results = React.useMemo(
    () => searchEntries(entries, query, { limit: 50 }),
    [entries, query]
  );

  return (
    <div className="space-y-8">
      <div className="max-w-xl space-y-2">
        <Label htmlFor="search-input">Rechercher dans PrépaPilote</Label>
        <div className="relative">
          <SearchIcon
            aria-hidden
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            id="search-input"
            type="search"
            placeholder="Module, catégorie, notion, appareil…"
            className="pl-9"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus
          />
        </div>
      </div>

      {query.trim().length === 0 ? (
        <p className="text-muted-foreground max-w-prose">
          Recherchez un module, une catégorie ou — bientôt — une fiche, un terme du dictionnaire, un
          document ou un quiz.
        </p>
      ) : results.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Aucun résultat pour « {query} »</EmptyTitle>
            <EmptyDescription>
              Essayez un autre terme, un sigle ou une orthographe approchée — la recherche tolère
              les fautes.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="max-w-2xl space-y-2" aria-label="Résultats de recherche">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={result.url}
                className="hover:border-primary/40 focus-visible:ring-ring block rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <p className="font-medium">{result.title}</p>
                <p className="text-muted-foreground text-sm">
                  {SEARCH_TYPE_LABELS[result.type]} · {result.moduleName}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
