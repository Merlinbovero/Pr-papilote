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
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      <p className="text-muted-foreground border-primary border-l-2 pl-3 text-lg">{summary}</p>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Badge variant="secondary">{moduleName}</Badge>
        <Badge variant="outline">{typeLabel}</Badge>
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
