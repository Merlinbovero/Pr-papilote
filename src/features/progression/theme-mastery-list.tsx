import { cn } from "@/lib/utils";
import type { MasteryLevel } from "@/lib/progression/config";
import type { ThemeMastery } from "@/lib/progression/derive";

/** Code couleur sémantique : vert maîtrisé, orange à revoir, gris non commencé. */
const LEVEL_STYLE: Record<MasteryLevel, { label: string; bar: string; text: string }> = {
  maitrise: { label: "Maîtrisé", bar: "bg-success", text: "text-success" },
  "en-cours": { label: "En cours", bar: "bg-warning", text: "text-warning" },
  "a-revoir": { label: "À revoir", bar: "bg-destructive", text: "text-destructive" },
  "non-commence": { label: "Non commencé", bar: "bg-muted", text: "text-muted-foreground" },
};

/** Maîtrise par thème, avec jauge et libellé de niveau. */
export function ThemeMasteryList({
  items,
  labelOf,
}: {
  items: ThemeMastery[];
  /** Slug de thème → libellé lisible. */
  labelOf?: (theme: string) => string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Vos thèmes travaillés apparaîtront ici après vos premiers entraînements.
      </p>
    );
  }
  return (
    <ul className="space-y-3" aria-label="Maîtrise par thème">
      {items.map((item) => {
        const style = LEVEL_STYLE[item.level];
        return (
          <li key={item.theme} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{labelOf ? labelOf(item.theme) : item.theme}</span>
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
