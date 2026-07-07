import { cn } from "@/lib/utils";
import type { InfoboxEntry } from "./types";

interface InfoboxProps {
  title: string;
  entries: InfoboxEntry[];
  /**
   * card : panneau latéral (desktop) ou bloc mobile.
   * table : version tabulaire pour l'impression.
   */
  variant?: "card" | "table";
  className?: string;
}

function formatValue(value: string | string[]): string {
  return Array.isArray(value) ? value.join(", ") : value;
}

/**
 * Données structurées d'une fiche-objet. Les valeurs viennent de
 * l'infobox validée par schéma — jamais de donnée inventée.
 */
export function Infobox({ title, entries, variant = "card", className }: InfoboxProps) {
  if (variant === "table") {
    return (
      <table className={cn("w-full border text-sm", className)}>
        <caption className="py-1 text-left font-semibold">{title}</caption>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.label} className="border-b last:border-b-0">
              <th
                scope="row"
                className="text-muted-foreground w-1/3 px-3 py-1.5 text-left font-normal"
              >
                {entry.label}
              </th>
              <td className="px-3 py-1.5 font-mono">{formatValue(entry.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <aside aria-label={title} className={cn("bg-card rounded-xl border p-4", className)}>
      <p className="mb-3 text-sm font-semibold tracking-wide uppercase">{title}</p>
      <dl className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.label} className="grid grid-cols-[40%_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">{entry.label}</dt>
            <dd className="font-mono">{formatValue(entry.value)}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
