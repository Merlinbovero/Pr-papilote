import { Badge } from "@/components/ui/badge";

interface FicheSectionProps {
  id: string;
  title: string;
  /** « maitriser » ajoute le badge expert, sobre et jamais dominant. */
  strate?: "approfondir" | "maitriser";
  children: React.ReactNode;
}

/** Section de fiche : H2 ancré (sommaire) + badge de strate éventuel. */
export function FicheSection({ id, title, strate = "approfondir", children }: FicheSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-20 space-y-3">
      <h2
        id={`${id}-titre`}
        className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
      >
        {title}
        {strate === "maitriser" ? (
          <Badge variant="outline" className="text-muted-foreground font-normal">
            Expert
          </Badge>
        ) : null}
      </h2>
      <div className="max-w-prose space-y-3 leading-7">{children}</div>
    </section>
  );
}
