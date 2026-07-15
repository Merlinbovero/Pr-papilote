import { cn } from "@/lib/utils";

export interface TimelineEntry {
  /** Date ou période affichée (ex. « 1909 », « 1944-1945 »). */
  date: string;
  title: string;
  body?: string;
  /** Met l'événement en relief (rupture, jalon majeur). */
  highlight?: boolean;
}

interface TimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

/**
 * Chronologie verticale (gabarit Histoire, docs/design-system.md). La date
 * est mise en avant à gauche, la ligne relie les jalons ; un jalon majeur
 * porte une pastille pleine à la couleur d'accent.
 */
export function Timeline({ entries, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-6 border-l pl-6", className)}>
      {entries.map((entry, index) => (
        <li key={`${entry.date}-${index}`} className="relative">
          <span
            aria-hidden
            className={cn(
              "absolute top-1.5 -left-[1.6875rem] size-3 rounded-full border-2",
              entry.highlight
                ? "border-primary bg-primary"
                : "border-muted-foreground bg-background"
            )}
          />
          <p
            className={cn(
              "text-sm font-semibold tracking-wide",
              entry.highlight ? "text-primary" : "text-muted-foreground"
            )}
          >
            {entry.date}
          </p>
          <p className="text-foreground mt-0.5 font-medium">{entry.title}</p>
          {entry.body ? (
            <p className="text-muted-foreground mt-1 text-sm leading-6">{entry.body}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
