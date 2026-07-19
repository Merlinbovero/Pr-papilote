import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Badge } from "@/components/ui/badge";
import { YoutubeEmbed } from "@/features/veille/youtube-embed";
import { getVideoBySlug, getVideos, resolveRelatedFiches } from "@/lib/content/videos";

export const dynamicParams = false;

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getVideos().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) {
    return {};
  }
  return { title: video.title, description: video.summary };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);
  if (!video) {
    notFound();
  }

  const fiches = resolveRelatedFiches(video);
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <StandalonePageShell
      breadcrumb={[
        { label: "Accueil", href: "/" },
        { label: "Veille vidéo", href: "/veille" },
        { label: video.title },
      ]}
    >
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <span aria-hidden className="bg-primary h-px w-8" />
            Veille vidéo
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
            {video.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Chaîne :{" "}
            {video.channelUrl ? (
              <a
                href={video.channelUrl}
                className="hover:text-foreground underline"
                target="_blank"
                rel="noreferrer"
              >
                {video.channel}
              </a>
            ) : (
              video.channel
            )}
          </p>
        </header>

        <YoutubeEmbed youtubeId={video.youtubeId} title={video.title} />

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={watchUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            <ExternalLinkIcon aria-hidden className="size-4" />
            Voir sur YouTube
          </a>
          {video.topics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {video.topics.map((topic) => (
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
          <p className="max-w-prose leading-7 whitespace-pre-line">{video.summary}</p>
        </section>

        {video.takeaways.length > 0 ? (
          <section aria-labelledby="retenir-titre">
            <div className="bg-card border-primary rounded-xl border border-l-4 p-6">
              <h2 id="retenir-titre" className="mb-3 text-xl font-semibold tracking-tight">
                Ce qu&apos;il faut en retenir
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6">
                {video.takeaways.map((point) => (
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

        {video.watchNext.length > 0 ? (
          <section aria-labelledby="ensuite-titre" className="space-y-3">
            <h2 id="ensuite-titre" className="text-xl font-semibold tracking-tight">
              À regarder ensuite
            </h2>
            <ul className="space-y-2">
              {video.watchNext.map((next) => (
                <li key={next.url}>
                  <a
                    href={next.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-card hover:border-primary/50 focus-visible:ring-ring block rounded-lg border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <ExternalLinkIcon aria-hidden className="text-primary size-4 shrink-0" />
                      {next.title}
                    </span>
                    {next.note ? (
                      <span className="text-muted-foreground mt-1 block pl-6 text-sm">
                        {next.note}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {video.sources.length > 0 ? (
          <section aria-labelledby="sources-titre" className="space-y-2">
            <h2 id="sources-titre" className="text-lg font-semibold">
              Sources
            </h2>
            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
              {video.sources.map((source) => (
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
          La vidéo et sa miniature appartiennent à son auteur ({video.channel}) ; elle est intégrée
          via le lecteur officiel YouTube. Ce résumé est rédigé par PrépaPilote ; les faits des
          fiches associées sont vérifiés sur des sources indépendantes.
        </p>
      </div>
    </StandalonePageShell>
  );
}
