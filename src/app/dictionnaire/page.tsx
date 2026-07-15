import type { Metadata } from "next";
import Link from "next/link";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getTermes } from "@/lib/content/fiches";

export const metadata: Metadata = {
  title: "Dictionnaire aéronautique",
  description:
    "Le vocabulaire canonique de PrépaPilote : termes, sigles et définitions de l'aéronautique militaire française.",
};

/** Le dictionnaire est une vue sur les objets « terme » du graphe. */
export default function DictionnairePage() {
  const termes = getTermes();

  return (
    <StandalonePageShell breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Dictionnaire" }]}>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dictionnaire aéronautique</h1>
        <p className="text-muted-foreground max-w-prose">
          Termes et sigles de l&apos;aéronautique militaire française — le vocabulaire canonique du
          site.
        </p>
      </header>
      {termes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Le dictionnaire se remplit progressivement</EmptyTitle>
            <EmptyDescription>Chaque terme renvoie vers sa fiche complète.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="max-w-2xl space-y-3" aria-label="Termes du dictionnaire">
          {termes.map((terme) => (
            <li key={terme.id}>
              <Link
                href={`/dictionnaire/${terme.id.replace(/^terme\./, "")}`}
                className="hover:border-primary/40 focus-visible:ring-ring block rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <p className="font-medium">{terme.title}</p>
                <p className="text-muted-foreground line-clamp-2 text-sm">{terme.definition}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StandalonePageShell>
  );
}
