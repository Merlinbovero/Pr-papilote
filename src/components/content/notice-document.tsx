import Link from "next/link";
import { DownloadIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelationBlock } from "./relation-block";
import type { RelationItem } from "./types";

export interface NoticeDocumentProps {
  title: string;
  issuer: string;
  /** ISO. */
  publishedAt: string;
  kindLabel: string;
  summary: string;
  officialUrl: string;
  /** Statut de diffusion, en clair (ex. « Lien seul », « Rediffusion autorisée »). */
  rightsLabel: string;
  /** Lien de téléchargement du binaire, seulement si le droit est établi. */
  downloadHref?: string;
  /** Fiches associées à ce document (via le graphe). */
  relatedFiches: RelationItem[];
}

/**
 * Notice d'un document public (ch. 8 §3, §10). Le document se CONSULTE sur
 * le site (titre, émetteur, date, résumé, fiches liées) : le téléchargement
 * s'ajoute quand le droit est établi, il ne remplace jamais la consultation.
 */
export function NoticeDocument({
  title,
  issuer,
  publishedAt,
  kindLabel,
  summary,
  officialUrl,
  rightsLabel,
  downloadHref,
  relatedFiches,
}: NoticeDocumentProps) {
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(publishedAt)
  );

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">
            <FileTextIcon aria-hidden className="size-3" />
            {kindLabel}
          </Badge>
          <span>{issuer}</span>
          <span aria-hidden>·</span>
          <span>{date}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">Statut de diffusion : {rightsLabel}</p>
      </header>

      <section aria-labelledby="doc-summary" className="space-y-2">
        <h2 id="doc-summary" className="text-lg font-semibold tracking-tight">
          Résumé
        </h2>
        <p className="leading-relaxed">{summary}</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <a href={officialUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon aria-hidden className="size-4" />
            Consulter la source officielle
          </a>
        </Button>
        {downloadHref ? (
          <Button asChild variant="outline">
            <Link href={downloadHref}>
              <DownloadIcon aria-hidden className="size-4" />
              Télécharger
            </Link>
          </Button>
        ) : null}
      </div>

      {relatedFiches.length > 0 ? (
        <RelationBlock title="Fiches associées" items={relatedFiches} />
      ) : null}
    </article>
  );
}
