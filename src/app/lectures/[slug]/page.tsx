import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Badge } from "@/components/ui/badge";
import {
  getReadingBySlug,
  getReadings,
  resolveReadingFiches,
  READING_KIND_LABELS,
} from "@/lib/content/readings";

export const dynamicParams = false;

interface ReadingPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getReadings().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: ReadingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const reading = getReadingBySlug(slug);
  if (!reading) {
    return {};
  }
  return { title: reading.title, description: reading.summary };
}

export default async function ReadingPage({ params }: ReadingPageProps) {
  const { slug } = await params;
  const reading = getReadingBySlug(slug);
  if (!reading) {
    notFound();
  }

  const fiches = resolveReadingFiches(reading);
  const reference = [
    reading.publisher,
    typeof reading.year === "number" ? String(reading.year) : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StandalonePageShell
      breadcrumb={[
        { label: "Accueil", href: "/" },
        { label: "Lectures", href: "/lectures" },
        { label: reading.title },
      ]}
    >
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <span aria-hidden className="bg-primary h-px w-8" />
            Lecture · {READING_KIND_LABELS[reading.kind]}
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
            {reading.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {reading.author}
            {reference ? ` — ${reference}` : ""}
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          {reading.url ? (
            <a
              href={reading.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <ExternalLinkIcon aria-hidden className="size-4" />
              {reading.kind === "article" ? "Lire l'article" : "Voir la référence"}
            </a>
          ) : null}
          {reading.topics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {reading.topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="font-normal">
                  {topic}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <section aria-labelledby="resume-titre" className="space-y-3">
          <h2 id="resume-titre" className="text-xl font-semibold tracking-tight">
            En résumé
          </h2>
          <p className="max-w-prose leading-7 whitespace-pre-line">{reading.summary}</p>
        </section>

        {reading.takeaways.length > 0 ? (
          <section aria-labelledby="retenir-titre">
            <div className="bg-card border-primary rounded-xl border border-l-4 p-6">
              <h2 id="retenir-titre" className="mb-3 text-xl font-semibold tracking-tight">
                Ce qu&apos;il faut en retenir
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6">
                {reading.takeaways.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {fiches.length > 0 ? (
          <section aria-labelledby="fiches-titre" className="space-y-3">
            <h2 id="fiches-titre" className="text-xl font-semibold tracking-tight">
              Les fiches associées
            </h2>
            <ul className="space-y-2">
              {fiches.map((fiche) => (
                <li key={fiche.href}>
                  <Link
                    href={fiche.href}
                    className="bg-card hover:border-primary/50 focus-visible:ring-ring flex items-center gap-3 rounded-lg border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <FileTextIcon aria-hidden className="text-primary size-4 shrink-0" />
                    <span className="font-medium">{fiche.title}</span>
                    <ArrowRightIcon aria-hidden className="text-muted-foreground ml-auto size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {reading.sources.length > 0 ? (
          <section aria-labelledby="sources-titre" className="space-y-2">
            <h2 id="sources-titre" className="text-lg font-semibold">
              Sources
            </h2>
            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
              {reading.sources.map((source) => (
                <li key={source.title}>
                  {source.url ? (
                    <a href={source.url} className="underline" target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="text-muted-foreground border-t pt-6 text-xs">
          Résumé rédigé par PrépaPilote à partir de la lecture ; les faits des fiches associées sont
          vérifiés sur des sources indépendantes. Aucun texte de l&apos;ouvrage n&apos;est
          reproduit.
        </p>
      </div>
    </StandalonePageShell>
  );
}
