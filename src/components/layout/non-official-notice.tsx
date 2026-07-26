import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Avertissement systématique : PrépaPilote est un projet indépendant, non
 * officiel et non affilié aux armées. Affiché sur les pages de confiance pour
 * écarter toute confusion avec un site institutionnel.
 */
export function NonOfficialNotice({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Avertissement — projet indépendant"
      className={cn("border-info/40 bg-info/5 rounded-xl border border-l-4 p-4 text-sm", className)}
    >
      <p className="flex items-start gap-2">
        <InfoIcon aria-hidden className="text-info mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Projet indépendant et non officiel.</strong> PrépaPilote n’est ni affilié ni
          soutenu par le ministère des Armées, la Marine nationale, l’Armée de l’Air et de l’Espace
          ou l’Armée de Terre. Les informations sont fournies à titre pédagogique ; seuls les sites
          et centres de recrutement officiels font foi.
        </span>
      </p>
    </aside>
  );
}
