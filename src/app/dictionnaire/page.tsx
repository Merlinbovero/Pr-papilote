import type { Metadata } from "next";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getTermes } from "@/lib/content/fiches";
import {
  DictionaryBrowser,
  type DictionaryEntry,
} from "@/features/dictionnaire/dictionary-browser";

export const metadata: Metadata = {
  title: "Dictionnaire aéronautique",
  description:
    "Le vocabulaire canonique de PrépaPilote : termes, sigles et définitions de l'aéronautique militaire française — recherche instantanée, index alphabétique et filtres.",
};

/** Le dictionnaire est une vue sur les objets « terme » du graphe. */
export default function DictionnairePage() {
  const termes = getTermes();
  const entries: DictionaryEntry[] = termes.map((terme) => ({
    slug: terme.id.replace(/^terme\./, ""),
    title: terme.title,
    definition: terme.definition,
    sigleExpansion: terme.sigleExpansion,
    english: terme.english,
    synonyms: terme.synonyms,
    hasFiche: Boolean(terme.ficheId),
  }));

  return (
    <StandalonePageShell breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Dictionnaire" }]}>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dictionnaire aéronautique</h1>
        <p className="text-muted-foreground max-w-prose">
          Termes, sigles et traductions de l&apos;aéronautique militaire française — le vocabulaire
          canonique du site. Chaque entrée renvoie, quand elle existe, vers sa fiche complète.
        </p>
      </header>
      {entries.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Le dictionnaire se remplit progressivement</EmptyTitle>
            <EmptyDescription>Chaque terme renvoie vers sa fiche complète.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DictionaryBrowser entries={entries} />
      )}
    </StandalonePageShell>
  );
}
