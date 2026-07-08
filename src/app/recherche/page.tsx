import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { buildSearchEntries } from "@/features/search/entries";
import { getModules } from "@/lib/content/referentials";
import { SearchPageClient } from "./search-page-client";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher dans toute la base documentaire PrépaPilote.",
};

export default function SearchPage() {
  const entries = buildSearchEntries();
  const modules = getModules().map((mod) => ({ slug: mod.slug, name: mod.name }));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Recherche</h1>
      <Suspense fallback={<Skeleton className="h-10 w-full max-w-xl" />}>
        <SearchPageClient entries={entries} modules={modules} />
      </Suspense>
    </main>
  );
}
