interface EssentialBlockProps {
  children: React.ReactNode;
  /** 3 à 5 puces « À retenir » — la version ultra-condensée. */
  keyPoints?: string[];
}

/**
 * « L'essentiel » : la lecture 30 secondes, autosuffisante (≤ 250 mots).
 * Visuellement distinct pour que l'œil le trouve sans lire.
 */
export function EssentialBlock({ children, keyPoints }: EssentialBlockProps) {
  return (
    <section
      id="l-essentiel"
      aria-labelledby="l-essentiel-titre"
      className="bg-card border-primary rounded-xl border border-l-4 p-6"
    >
      <h2 id="l-essentiel-titre" className="mb-3 text-2xl font-semibold tracking-tight">
        L&apos;essentiel
      </h2>
      <div className="space-y-3 leading-7">{children}</div>
      {keyPoints && keyPoints.length > 0 ? (
        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
            À retenir
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
