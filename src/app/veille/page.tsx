import type { Metadata } from "next";
import Link from "next/link";
import { PlaySquareIcon } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getVideos } from "@/lib/content/videos";

export const metadata: Metadata = {
  title: "Veille vidéo",
  description:
    "Des vidéos utiles à la préparation, résumées et reliées aux fiches du site : chaque vidéo devient un petit article avec ce qu'il faut en retenir et où approfondir.",
};

/** Rubrique « Veille vidéo » : chaque vidéo suivie devient un article relié aux fiches. */
export default function VeilleHubPage() {
  const videos = getVideos();

  return (
    <StandalonePageShell breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Veille vidéo" }]}>
      <header className="border-primary space-y-2 border-l-4 pl-4">
        <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
          <span aria-hidden className="bg-primary h-px w-8" />
          Culture & veille
        </p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
          Veille vidéo
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Les vidéos utiles à la préparation, résumées et reliées aux fiches du site. Chaque vidéo
          devient un petit article : ce qu&apos;il faut en retenir, les fiches associées et quoi
          regarder ensuite. Les faits restent vérifiés sur des sources fiables.
        </p>
      </header>

      {videos.length === 0 ? (
        <Empty className="bg-background border">
          <EmptyHeader>
            <EmptyTitle>Aucune vidéo pour l&apos;instant</EmptyTitle>
            <EmptyDescription>Les premières veilles vidéo apparaîtront ici.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <Link
                href={`/veille/${video.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2 text-base">
                      <PlaySquareIcon aria-hidden className="text-primary mt-0.5 size-4 shrink-0" />
                      {video.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground line-clamp-3 text-sm">{video.summary}</p>
                    {video.topics.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {video.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary" className="font-normal">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-muted-foreground text-xs">Chaîne : {video.channel}</p>
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
