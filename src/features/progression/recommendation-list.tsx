import { CompassIcon, DumbbellIcon, RotateCcwIcon, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Recommendation } from "@/lib/progression/derive";

const KIND_ICON: Record<Recommendation["kind"], LucideIcon> = {
  reviser: RotateCcwIcon,
  renforcer: DumbbellIcon,
  decouvrir: CompassIcon,
};

/** Recommandations avec leur motif — la confiance vient de la transparence. */
export function RecommendationList({ items }: { items: Recommendation[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Vos recommandations personnalisées apparaîtront ici au fil de vos entraînements.
      </p>
    );
  }
  return (
    <ul className="space-y-3" aria-label="Recommandations">
      {items.map((item, index) => {
        const Icon = KIND_ICON[item.kind];
        return (
          <li key={`${item.kind}-${item.theme ?? index}`}>
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <Icon aria-hidden className="text-primary mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.reason}</p>
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
