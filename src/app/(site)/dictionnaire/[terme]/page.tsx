import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, BookOpenIcon, LanguagesIcon } from "lucide-react";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  getFicheById,
  getFicheHref,
  getTermeBySlug,
  getTermes,
  getTermesForFiche,
} from "@/lib/content/fiches";

interface TermePageProps {
  params: Promise<{ terme: string }>;
}

/** Slug d'URL d'un terme (identifiant sans le préfixe « terme. »). */
function termeSlug(id: string): string {
  return id.replace(/^terme\./, "");
}

export function generateStaticParams() {
  return getTermes().map((terme) => ({ terme: termeSlug(terme.id) }));
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
  const siblings = terme.ficheId
    ? getTermesForFiche(terme.ficheId).filter((other) => other.id !== terme.id)
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-6">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Dictionnaire", href: "/dictionnaire" },
          { label: terme.title },
        ]}
      />

      {/* Carte principale : le terme, sa définition et ses métadonnées. */}
      <article className="bg-card rounded-2xl border p-6 sm:p-8">
        <header className="space-y-1.5">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">Définition</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance">{terme.title}</h1>
          {terme.sigleExpansion ? (
            <p className="text-muted-foreground text-lg">{terme.sigleExpansion}</p>
          ) : null}
        </header>

        <p className="text-foreground mt-5 max-w-prose text-lg leading-8">{terme.definition}</p>

        {terme.english || terme.synonyms.length > 0 ? (
          <dl className="mt-6 space-y-3 border-t pt-5 text-sm">
            {terme.english ? (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <dt className="text-muted-foreground inline-flex items-center gap-1.5">
                  <LanguagesIcon aria-hidden className="size-3.5" />
                  Anglais
                </dt>
                <dd className="font-medium italic">{terme.english}</dd>
              </div>
            ) : null}
            {terme.synonyms.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <dt className="text-muted-foreground">Synonymes</dt>
                {terme.synonyms.map((synonym) => (
                  <dd key={synonym}>
                    <Badge variant="secondary" className="font-normal">
                      {synonym}
                    </Badge>
                  </dd>
                ))}
              </div>
            ) : null}
          </dl>
        ) : null}
      </article>

      {/* Renvoi vers la fiche complète : carte cliquable mise en avant. */}
      {fiche ? (
        <Link
          href={getFicheHref(fiche)}
          className="group border-primary/25 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 focus-visible:ring-ring flex items-center gap-4 rounded-xl border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
          >
            <BookOpenIcon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-muted-foreground block text-xs font-medium tracking-wide uppercase">
              Fiche complète
            </span>
            <span className="text-foreground block truncate font-semibold">{fiche.title}</span>
          </span>
          <ArrowRightIcon
            aria-hidden
            className="text-primary size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}

      {/* Termes voisins (même fiche) : maillage interne du dictionnaire. */}
      {siblings.length > 0 ? (
        <section aria-labelledby="voisins-titre" className="space-y-3">
          <h2 id="voisins-titre" className="text-muted-foreground text-sm font-semibold">
            Voir aussi
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {siblings.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/dictionnaire/${termeSlug(other.id)}`}
                  className="bg-card hover:border-primary/40 hover:bg-elevated focus-visible:ring-ring block rounded-lg border px-4 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="block truncate text-sm font-medium">{other.title}</span>
                  <span className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                    {other.definition}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
