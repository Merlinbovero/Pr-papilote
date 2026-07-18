import { Badge } from "@/components/ui/badge";
import { PrintButton } from "./print-button";
import { VerifiedBadge } from "./verified-badge";

interface FicheHeaderProps {
  title: string;
  summary: string;
  moduleName: string;
  typeLabel: string;
  levelLabel: string;
  readingMinutes: number;
  verifiedAt: string;
  overdue?: boolean;
}

/**
 * En-tête normalisé de fiche : identité, métadonnées utiles au lecteur
 * et badge de confiance. Les métadonnées d'audit vont au pied de fiche.
 */
export function FicheHeader({
  title,
  summary,
  moduleName,
  typeLabel,
  levelLabel,
  readingMinutes,
  verifiedAt,
  overdue,
}: FicheHeaderProps) {
  return (
    <header className="space-y-3">
      {/* Surtitre de section à filet d'accent — même langage que les heros du site. */}
      <p className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
        <span aria-hidden className="bg-primary h-px w-8" />
        {moduleName} · {typeLabel}
      </p>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground border-primary border-l-2 pl-3 text-lg">{summary}</p>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Badge variant="outline">{levelLabel}</Badge>
        <span className="text-muted-foreground text-sm">{readingMinutes} min de lecture</span>
        <VerifiedBadge verifiedAt={verifiedAt} overdue={overdue} />
        <span className="ml-auto">
          <PrintButton />
        </span>
      </div>
    </header>
  );
}
