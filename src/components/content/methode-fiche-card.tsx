import { FicheCard } from "@/components/shared/fiche-card";
import { getFicheById, getFicheHref, getReadingMinutes } from "@/lib/content/fiches";

interface MethodeFicheCardProps {
  /** Identifiant de la fiche de méthode à mettre en avant. */
  ficheId: string;
  /** Titre de section — par défaut « Avant de vous lancer ». */
  heading?: string;
  /** Phrase d'accroche sous le titre, propre à l'épreuve. */
  intro: string;
}

/**
 * Renvoi vers la fiche de méthode depuis un entraîneur.
 *
 * Les pages d'entraînement portaient ce lien au fil d'une phrase d'intro : on
 * ne voyait pas qu'une fiche existait. Le renvoi est ici un bloc à part
 * entière, composé de la carte du catalogue (`FicheCard`), avec le type
 * « Méthode » en surtitre — c'est le même objet visuel que dans les listes de
 * fiches, donc immédiatement reconnaissable comme quelque chose à lire.
 *
 * La fiche est chargée par identifiant : si elle disparaît du contenu, le bloc
 * s'efface au lieu de laisser un lien mort.
 */
export function MethodeFicheCard({
  ficheId,
  heading = "Avant de vous lancer",
  intro,
}: MethodeFicheCardProps) {
  const fiche = getFicheById(ficheId);
  if (!fiche) return null;

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-heading inline-flex items-center gap-2 text-xl font-bold tracking-tight">
          <span aria-hidden className="bg-primary h-5 w-1 rounded-full" />
          {heading}
        </h2>
        <p className="text-muted-foreground max-w-prose">{intro}</p>
      </div>
      <FicheCard
        href={getFicheHref(fiche)}
        title={fiche.title}
        summary={fiche.summary}
        image={
          fiche.image
            ? { src: fiche.image.src, alt: fiche.image.alt, focal: fiche.image.focal }
            : undefined
        }
        typeLabel="Méthode"
        readingMinutes={getReadingMinutes(fiche)}
      />
    </section>
  );
}
