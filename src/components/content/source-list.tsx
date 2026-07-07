import type { SourceItem } from "./types";

const KIND_LABELS: Record<SourceItem["kind"], string> = {
  officiel: "Source officielle",
  institutionnel: "Source institutionnelle",
  presse: "Presse",
  ouvrage: "Ouvrage",
};

interface SourceListProps {
  sources: SourceItem[];
}

/**
 * Sources numérotées, ancrées depuis le texte via #source-N.
 * La traçabilité (« consulté le ») est publique : c'est un argument
 * de confiance, pas une note interne.
 */
export function SourceList({ sources }: SourceListProps) {
  return (
    <section id="sources" aria-labelledby="sources-titre" className="scroll-mt-20 space-y-3">
      <h2 id="sources-titre" className="text-2xl font-semibold tracking-tight">
        Sources et références
      </h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        {sources.map((source, index) => {
          const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
            new Date(source.consultedAt)
          );
          return (
            <li
              key={`${source.title}-${index}`}
              id={`source-${index + 1}`}
              className="scroll-mt-20"
            >
              {source.url ? (
                <a
                  href={source.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {source.title}
                </a>
              ) : (
                <span className="font-medium">{source.title}</span>
              )}
              <span className="text-muted-foreground">
                {" "}
                — {KIND_LABELS[source.kind]}, consulté le {date}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
