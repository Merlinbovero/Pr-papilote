import type { RevisionItem } from "./types";

/**
 * Historique des révisions d'une fiche (ch. 8 §5) : chaque évolution
 * significative porte son motif. Sobre et discret — la traçabilité inspire
 * confiance sans encombrer la lecture. Rien si l'historique est vide.
 */
export function RevisionHistory({ revisions }: { revisions: RevisionItem[] }) {
  if (revisions.length === 0) {
    return null;
  }
  const ordered = [...revisions].sort((a, b) => b.version - a.version);
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));

  return (
    <section aria-labelledby="revisions-title" className="space-y-3">
      <h2 id="revisions-title" className="text-lg font-semibold tracking-tight">
        Historique des révisions
      </h2>
      <ol className="space-y-2">
        {ordered.map((revision) => (
          <li
            key={revision.version}
            className="text-muted-foreground flex flex-col gap-0.5 border-l-2 pl-3 text-sm"
          >
            <span className="text-foreground font-medium">
              v{revision.version} · {formatDate(revision.date)}
            </span>
            <span>{revision.motif}</span>
            <span className="text-xs">
              {revision.author}
              {revision.reviewer ? ` · relu par ${revision.reviewer}` : ""}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
