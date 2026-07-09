import Link from "next/link";
import { PlayIcon, RotateCcwIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResumeBlockProps {
  /** Libellé du dernier module travaillé, ou undefined si aucune activité. */
  moduleLabel?: string;
  /** Cible du bouton « Reprendre » (dernier module). */
  resumeHref?: string;
  /** Précision discrète (ex. « dernière activité il y a 3 jours »). */
  lastActivityLabel?: string;
  /** Révisions interrompues à reprendre. */
  dueReviewCount: number;
  /** Cible du bouton « Réviser mes erreurs ». */
  reviewHref?: string;
}

/**
 * « Reprendre » : point de reprise immédiat (dernier module, révisions dues).
 * Mémoire du travail, JAMAIS un compteur de jours consécutifs (pas de streak,
 * décision ch. 7).
 */
export function ResumeBlock({
  moduleLabel,
  resumeHref = "#",
  lastActivityLabel,
  dueReviewCount,
  reviewHref = "#",
}: ResumeBlockProps) {
  if (!moduleLabel && dueReviewCount === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Lancez un premier entraînement : vous pourrez le reprendre ici à tout moment.
      </p>
    );
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          {moduleLabel ? (
            <p className="font-medium">Reprendre : {moduleLabel}</p>
          ) : (
            <p className="font-medium">Reprendre votre travail</p>
          )}
          {lastActivityLabel ? (
            <p className="text-muted-foreground text-sm">{lastActivityLabel}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {dueReviewCount > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={reviewHref}>
                <RotateCcwIcon aria-hidden className="size-4" />
                Réviser mes erreurs ({dueReviewCount})
              </Link>
            </Button>
          ) : null}
          {moduleLabel ? (
            <Button asChild size="sm">
              <Link href={resumeHref}>
                <PlayIcon aria-hidden className="size-4" />
                Reprendre
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
