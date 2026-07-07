import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  /** Date ISO de dernière vérification humaine. */
  verifiedAt: string;
  /** Cycle de fraîcheur dépassé (lib/content/freshness). */
  overdue?: boolean;
}

/** Badge de confiance « Vérifié le … » — orange si la revue est en retard. */
export function VerifiedBadge({ verifiedAt, overdue = false }: VerifiedBadgeProps) {
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(verifiedAt));

  return (
    <Badge
      variant="outline"
      className={cn(overdue ? "border-warning text-warning" : "border-success text-success")}
    >
      {overdue ? (
        <CircleAlertIcon aria-hidden className="size-3" />
      ) : (
        <CircleCheckIcon aria-hidden className="size-3" />
      )}
      {overdue ? `À re-vérifier — dernière vérification le ${date}` : `Vérifié le ${date}`}
    </Badge>
  );
}
