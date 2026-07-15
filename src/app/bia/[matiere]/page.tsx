import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatiereQuiz } from "@/features/bia/matiere-quiz";
import { getBiaConfig, getBiaMatiere } from "@/lib/bia/config";
import { getBiaExamPools, getBiaFichesByMatiere, toBiaPlayerQuestion } from "@/lib/bia/data";
import { getCategory } from "@/lib/content/referentials";
import { getFicheHref } from "@/lib/content/fiches";

interface MatierePageProps {
  params: Promise<{ matiere: string }>;
}

export function generateStaticParams() {
  const config = getBiaConfig();
  return [...config.matieres.map((m) => ({ matiere: m.slug }))].concat([
    { matiere: config.epreuveFacultative.slug },
  ]);
}

export async function generateMetadata({ params }: MatierePageProps): Promise<Metadata> {
  const { matiere: slug } = await params;
  const matiere = getBiaMatiere(slug);
  if (!matiere) {
    return {};
  }
  return {
    title: `${matiere.name} — parcours BIA`,
    description: matiere.description,
  };
}

/** Une matière du BIA : ses fiches groupées par catégorie et son quiz. */
export default async function BiaMatierePage({ params }: MatierePageProps) {
  const { matiere: slug } = await params;
  const matiere = getBiaMatiere(slug);
  if (!matiere) {
    notFound();
  }

  const fiches = getBiaFichesByMatiere().get(slug) ?? [];
  const pools = getBiaExamPools();
  const pool = (pools.byMatiere.get(slug) ?? []).map((q) => toBiaPlayerQuestion(q, slug));

  const byCategory = new Map<string, typeof fiches>();
  for (const fiche of fiches) {
    const list = byCategory.get(fiche.category);
    if (list) {
      list.push(fiche);
    } else {
      byCategory.set(fiche.category, [fiche]);
    }
  }

  return (
    <main className="space-y-8">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Parcours BIA", href: "/bia" },
          { label: matiere.name },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{matiere.name}</h1>
        <p className="max-w-prose">{matiere.description}</p>
        <p className="text-muted-foreground text-sm">
          {fiches.length} fiches · {pool.length} questions d&apos;entraînement
        </p>
      </header>

      <section aria-label="Fiches de la matière" className="space-y-6">
        {[...byCategory.entries()].map(([categorySlug, list]) => {
          const category = getCategory("fondamentaux", categorySlug);
          return (
            <div key={categorySlug} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {category?.name ?? categorySlug}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((fiche) => (
                  <li key={fiche.id}>
                    <Link
                      href={getFicheHref(fiche)}
                      className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Card className="hover:border-primary/40 h-full transition-colors">
                        <CardHeader>
                          <CardTitle className="text-base">{fiche.title}</CardTitle>
                          <CardDescription className="line-clamp-3">
                            {fiche.summary}
                          </CardDescription>
                          <Badge variant="outline" className="w-fit font-normal">
                            Niveau {fiche.level}
                          </Badge>
                        </CardHeader>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section aria-label="Quiz de la matière">
        <MatiereQuiz matiereName={matiere.name} pool={pool} />
      </section>
    </main>
  );
}
