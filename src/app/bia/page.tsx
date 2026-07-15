import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenIcon, GraduationCapIcon, ListChecksIcon } from "lucide-react";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBiaMatiereSummaries } from "@/lib/bia/data";

export const metadata: Metadata = {
  title: "Parcours BIA — brevet d'initiation aéronautique",
  description:
    "Préparez le BIA avec les fiches PrépaPilote : les cinq matières du programme officiel, des quiz thématiques et des examens blancs de 100 questions.",
};

/**
 * Accueil du parcours BIA — une projection des Fondamentaux sur le
 * programme officiel (docs/editorial/module-bia.md). Composition pure :
 * les comptes viennent de l'assemblage serveur, aucune logique locale.
 */
export default function BiaHubPage() {
  const matieres = getBiaMatiereSummaries();
  const obligatoires = matieres.filter((m) => !m.facultative);
  const facultative = matieres.find((m) => m.facultative);

  return (
    <main className="space-y-8">
      <SiteBreadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Parcours BIA" }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Parcours BIA</h1>
        <p className="text-muted-foreground text-lg">
          Le brevet d&apos;initiation aéronautique, préparé avec les fiches des Fondamentaux.
        </p>
        <p className="max-w-prose">
          Cinq matières, une épreuve écrite de 2 h 30, l&apos;admission à 10/20 — le programme
          officiel du BIA recoupe presque exactement le socle de connaissances des sélections
          pilote. Étudiez matière par matière, puis mesurez-vous à l&apos;examen blanc.
        </p>
      </header>

      <section aria-label="Les matières du BIA" className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Les cinq matières</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {obligatoires.map((matiere, index) => (
            <li key={matiere.slug}>
              <Link
                href={`/bia/${matiere.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2 text-base">
                      <span className="text-primary font-semibold">{index + 1}.</span>
                      {matiere.name}
                    </CardTitle>
                    <CardDescription>{matiere.description}</CardDescription>
                    <p className="text-muted-foreground pt-1 text-sm">
                      {matiere.ficheCount} fiches · {matiere.questionCount} questions
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
          {facultative ? (
            <li key={facultative.slug}>
              <Link
                href={`/bia/${facultative.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/40 h-full border-dashed transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {facultative.name.replace(" (épreuve facultative)", "")}
                      <Badge variant="outline" className="font-normal">
                        Facultative
                      </Badge>
                    </CardTitle>
                    <CardDescription>{facultative.description}</CardDescription>
                    <p className="text-muted-foreground pt-1 text-sm">
                      {facultative.ficheCount} fiches · {facultative.questionCount} questions
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ) : null}
        </ul>
      </section>

      <section aria-label="S'entraîner" className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">S&apos;entraîner</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/bia/examen-blanc"
              className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
            >
              <Card className="border-primary/30 hover:border-primary h-full transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCapIcon aria-hidden className="text-primary size-4" />
                    Examen blanc
                  </CardTitle>
                  <CardDescription>
                    100 questions, 20 par matière, dans les conditions de l&apos;épreuve —
                    correction détaillée et note par matière.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
          <li>
            <Link
              href="/fondamentaux/culture-aeronautique/le-bia"
              className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
            >
              <Card className="hover:border-primary/40 h-full transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpenIcon aria-hidden className="text-primary size-4" />
                    Qu&apos;est-ce que le BIA ?
                  </CardTitle>
                  <CardDescription>
                    Le diplôme, les conditions, le format de l&apos;épreuve — la fiche de
                    présentation complète.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        </ul>
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <ListChecksIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          Chaque question corrigée renvoie vers la fiche à réviser — vos erreurs d&apos;examen
          deviennent votre programme de travail.
        </p>
      </section>
    </main>
  );
}
