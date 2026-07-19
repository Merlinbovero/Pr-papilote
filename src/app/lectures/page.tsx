import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenIcon } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getReadings, READING_KIND_LABELS } from "@/lib/content/readings";

export const metadata: Metadata = {
  title: "Lectures",
  description:
    "Des livres et articles utiles à la préparation, résumés et reliés aux fiches du site : chaque lecture devient un petit article avec ce qu'il faut en retenir et où la trouver.",
};

/** Rubrique « Lectures » : chaque livre ou article suivi devient un article relié aux fiches. */
export default function LecturesHubPage() {
  const readings = getReadings();

  return (
    <StandalonePageShell breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Lectures" }]}>
      <header className="border-primary space-y-2 border-l-4 pl-4">
        <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span aria-hidden className="bg-primary h-px w-8" />
          Culture & veille
        </p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
          Lectures
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Les livres et articles utiles à la préparation, résumés et reliés aux fiches du site.
          Chaque lecture devient un petit article : ce qu&apos;il faut en retenir, les fiches
          associées et où la trouver. Les faits restent vérifiés sur des sources fiables.
        </p>
      </header>

      {readings.length === 0 ? (
        <Empty className="bg-background border">
          <EmptyHeader>
            <EmptyTitle>Aucune lecture pour l&apos;instant</EmptyTitle>
            <EmptyDescription>
              Les premières lectures conseillées apparaîtront ici.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readings.map((reading) => (
            <li key={reading.id}>
              <Link
                href={`/lectures/${reading.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/60 h-full border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                      >
                        <BookOpenIcon className="size-4" />
                      </span>
                      <Badge variant="secondary" className="font-normal">
                        {READING_KIND_LABELS[reading.kind]}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{reading.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground line-clamp-3 text-sm">{reading.summary}</p>
                    <p className="text-muted-foreground text-xs">Auteur : {reading.author}</p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StandalonePageShell>
  );
}
