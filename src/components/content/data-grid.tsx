import { cn } from "@/lib/utils";

export interface DataGridItem {
  label: string;
  value: string;
}

interface DataGridProps {
  items: DataGridItem[];
  className?: string;
}

/**
 * Grille de données techniques (clé / valeur), pour les caractéristiques
 * chiffrées d'un objet (appareil, base, unité). Rendue en liste de
 * définitions pour l'accessibilité ; responsive en une puis deux colonnes.
 */
export function DataGrid({ items, className }: DataGridProps) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
        >
          <dt className="text-muted-foreground text-sm">{item.label}</dt>
          <dd className="text-foreground text-right text-sm font-medium tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
