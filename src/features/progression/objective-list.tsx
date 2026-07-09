import { CheckCircle2Icon, TargetIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Objective, ObjectiveProgress } from "@/lib/progression/derive";

export interface ObjectiveView {
  objective: Objective;
  progress: ObjectiveProgress;
}

/**
 * Objectifs personnels et leur avancement dérivé. Volontairement simples,
 * strictement personnels : aucune comparaison, aucun classement.
 */
export function ObjectiveList({ items }: { items: ObjectiveView[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Fixez-vous un objectif simple — terminer un domaine, réviser un concours, réaliser un examen
        blanc.
      </p>
    );
  }
  return (
    <ul className="space-y-3" aria-label="Objectifs">
      {items.map(({ objective, progress }) => {
        const Icon = progress.done ? CheckCircle2Icon : TargetIcon;
        return (
          <li key={objective.id}>
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-2 font-medium">
                    <Icon
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0",
                        progress.done ? "text-success" : "text-primary"
                      )}
                    />
                    {objective.label}
                  </p>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {progress.current} / {progress.target}
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      progress.done ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${progress.ratio}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
