import { TriangleAlertIcon } from "lucide-react";

interface PitfallsBlockProps {
  items: string[];
}

/**
 * « Pièges et erreurs fréquentes » — la plus forte valeur concours
 * d'une fiche, et le vivier des questions de quiz.
 */
export function PitfallsBlock({ items }: PitfallsBlockProps) {
  return (
    <section
      id="pieges"
      aria-labelledby="pieges-titre"
      className="border-warning scroll-mt-20 rounded-xl border border-l-4 p-6"
    >
      <h2
        id="pieges-titre"
        className="mb-3 flex items-center gap-2 text-2xl font-semibold tracking-tight"
      >
        <TriangleAlertIcon aria-hidden className="text-warning size-5" />
        Pièges et erreurs fréquentes
      </h2>
      <ul className="list-disc space-y-2 pl-5 leading-7">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
