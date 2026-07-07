import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFicheById, getFicheHref, getTermeBySlug, getTermes } from "@/lib/content/fiches";

interface TermePageProps {
  params: Promise<{ terme: string }>;
}

export function generateStaticParams() {
  return getTermes().map((terme) => ({ terme: terme.id.replace(/^terme\./, "") }));
}

export async function generateMetadata({ params }: TermePageProps): Promise<Metadata> {
  const { terme: slug } = await params;
  const terme = getTermeBySlug(slug);
  if (!terme) {
    return {};
  }
  return { title: `${terme.title} — Dictionnaire`, description: terme.definition };
}

/** Entrée du dictionnaire : un objet « terme » du graphe documentaire. */
export default async function TermePage({ params }: TermePageProps) {
  const { terme: slug } = await params;
  const terme = getTermeBySlug(slug);
  if (!terme) {
    notFound();
  }
  const fiche = terme.ficheId ? getFicheById(terme.ficheId) : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Dictionnaire", href: "/dictionnaire" },
          { label: terme.title },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{terme.title}</h1>
        {terme.sigleExpansion ? (
          <p className="text-muted-foreground text-lg">{terme.sigleExpansion}</p>
        ) : null}
      </header>
      <p className="max-w-prose leading-7">{terme.definition}</p>
      <dl className="text-sm">
        {terme.english ? (
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Anglais :</dt>
            <dd className="font-medium">{terme.english}</dd>
          </div>
        ) : null}
        {terme.synonyms.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <dt className="text-muted-foreground">Synonymes :</dt>
            {terme.synonyms.map((synonym) => (
              <dd key={synonym}>
                <Badge variant="secondary">{synonym}</Badge>
              </dd>
            ))}
          </div>
        ) : null}
      </dl>
      {fiche ? (
        <Button asChild variant="outline">
          <Link href={getFicheHref(fiche)}>Lire la fiche complète : {fiche.title}</Link>
        </Button>
      ) : null}
    </main>
  );
}
