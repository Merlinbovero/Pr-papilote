import { cn } from "@/lib/utils";
import type { MasteryLevel } from "@/lib/progression/config";
import type { Mastery } from "@/lib/progression/derive";

/** Code couleur sémantique : vert maîtrisé, orange à revoir, gris non commencé. */
const LEVEL_STYLE: Record<MasteryLevel, { label: string; bar: string; text: string }> = {
  maitrise: { label: "Maîtrisé", bar: "bg-success", text: "text-success" },
  "en-cours": { label: "En cours", bar: "bg-warning", text: "text-warning" },
  "a-revoir": { label: "À revoir", bar: "bg-destructive", text: "text-destructive" },
  "non-commence": { label: "Non commencé", bar: "bg-muted", text: "text-muted-foreground" },
};

export interface MasteryItem extends Mastery {
  /** Clé stable (thème ou compétence). */
  key: string;
  label: string;
}

/**
 * Liste de maîtrise avec jauge et libellé de niveau. Générique : sert la
 * maîtrise par thème comme par compétence (même logique dérivée).
 */
export function MasteryList({
  items,
  ariaLabel,
  emptyLabel = "Vos résultats apparaîtront ici après vos premiers entraînements.",
}: {
  items: MasteryItem[];
  ariaLabel: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {items.map((item) => {
        const style = LEVEL_STYLE[item.level];
        return (
          <li key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className={cn("font-medium", style.text)}>
                {style.label}
                {item.answered > 0 ? ` · ${item.correctRate} %` : ""}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className={cn("h-full rounded-full", style.bar)}
                style={{ width: `${item.answered > 0 ? item.correctRate : 0}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
