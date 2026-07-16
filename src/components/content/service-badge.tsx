import type { Service } from "@/lib/content/content-schemas";
import { SERVICE_STATUS } from "@/lib/service-status";
import { cn } from "@/lib/utils";

/** Couleur du point de statut (porteuse de sens ; le libellé reste lisible). */
const DOT_CLASS: Record<string, string> = {
  success: "bg-success",
  info: "bg-info",
  muted: "bg-muted-foreground",
};

/**
 * Statut de service d'un aéronef (gabarit Appareils) : pastille neutre et
 * lisible (texte sur fond de carte, contraste AA garanti) dont un point
 * coloré porte le sens (vert = en service, bleu = à venir, gris = passé).
 * Exploitant et repères de dates affichés quand ils sont renseignés.
 */
export function ServiceStatusBadge({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const meta = SERVICE_STATUS[service.status];
  const dates: string[] = [];
  if (service.firstFlight) dates.push(`premier vol ${service.firstFlight}`);
  if (service.introducedAt) dates.push(`service ${service.introducedAt}`);
  if (service.plannedEntryAt) dates.push(`prévu ${service.plannedEntryAt}`);
  if (service.retiredAt) dates.push(`retrait ${service.retiredAt}`);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
      <span className="bg-card text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
        <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT_CLASS[meta.tone])} />
        {meta.label}
      </span>
      {service.operator ? <span className="text-muted-foreground">{service.operator}</span> : null}
      {dates.length > 0 ? (
        <span className="text-muted-foreground">· {dates.join(" · ")}</span>
      ) : null}
    </div>
  );
}
