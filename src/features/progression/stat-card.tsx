import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  /** Précision discrète sous la valeur (ex. « depuis mars 2026 »). */
  hint?: string;
  icon?: LucideIcon;
}

/** Carte de statistique du tableau de bord de progression. */
export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          {Icon ? <Icon aria-hidden className="size-4" /> : null}
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
