import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/content/print-button";
import { concoursSchema } from "@/lib/content/content-schemas";
import { getCategories, getModule } from "@/lib/content/referentials";
import { getFichesByCategory } from "@/lib/content/fiches";
import { getCourses } from "@/lib/content/cours";
import { FAMILY_INFO } from "@/lib/psychotech/generators";
import { PSY_FAMILIES } from "@/lib/psychotech/types";

export const dynamicParams = false;

interface WorksheetPageProps {
  params: Promise<{ concours: string }>;
}

export function generateStaticParams() {
  return concoursSchema.options.map((concours) => ({ concours }));
}

export async function generateMetadata({ params }: WorksheetPageProps): Promise<Metadata> {
  const { concours } = await params;
  const mod = getModule(concours);
  if (!mod) {
    return {};
  }
  return {
    title: `Fiche de travail — ${mod.name}`,
    description: `Feuille de route imprimable de la préparation ${mod.name} : toutes les étapes et sections à cocher au fil de vos révisions, sur papier.`,
    robots: { index: false, follow: false },
  };
}

/** Case à cocher imprimable avec libellé (cochable à l'écran, vide à l'impression). */
function CheckItem({ id, label, hint }: { id: string; label: string; hint?: string }) {
  return (
    <label htmlFor={id} className="flex break-inside-avoid items-start gap-2 py-1">
      <input
        id={id}
        type="checkbox"
        className="border-input accent-primary mt-0.5 size-4 shrink-0 rounded-sm border"
      />
      <span className="text-sm leading-6">
        {label}
        {hint ? <span className="text-muted-foreground"> — {hint}</span> : null}
      </span>
    </label>
  );
}

/** Bloc « catégorie » : titre + cases à cocher de ses fiches. */
function CategoryBlock({
  moduleSlug,
  categorySlug,
  name,
  idPrefix,
}: {
  moduleSlug: string;
  categorySlug: string;
  name: string;
  idPrefix: string;
}) {
  const fiches = getFichesByCategory(moduleSlug, categorySlug);
  if (fiches.length === 0) return null;
  return (
    <div className="break-inside-avoid space-y-1">
      <h3 className="text-sm font-semibold">
        {name} <span className="text-muted-foreground font-normal">({fiches.length})</span>
      </h3>
      <div className="border-border/70 border-l pl-3">
        {fiches.map((fiche) => (
          <CheckItem key={fiche.id} id={`${idPrefix}-${fiche.slug}`} label={fiche.title} />
        ))}
      </div>
    </div>
  );
}

/**
 * Fiche de travail imprimable d'un concours : toute la route d'apprentissage
 * (parcours mécanique du vol, socle Fondamentaux, connaissances du concours,
 * anglais, psychotechnique) avec des cases à cocher, pour un suivi sur papier.
 * L'en-tête et le pied de site sont masqués à l'impression (print:hidden).
 */
export default async function WorksheetPage({ params }: WorksheetPageProps) {
  const { concours } = await params;
  const parsed = concoursSchema.safeParse(concours);
  const mod = parsed.success ? getModule(parsed.data) : undefined;
  if (!parsed.success || !mod) {
    notFound();
  }

  const cours = [...getCourses()].sort((a, b) => a.ordre - b.ordre);
  const fondamentauxCategories = getCategories("fondamentaux").filter(
    (c) => c.slug !== "anglais-aeronautique"
  );
  const concoursCategories = getCategories(mod.slug);
  const anglaisFiches = getFichesByCategory("fondamentaux", "anglais-aeronautique");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-6 print:py-0">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Fiche de travail
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Préparation {mod.name}
              {mod.organization ? (
                <span className="text-muted-foreground block text-lg font-normal">
                  {mod.organization}
                </span>
              ) : null}
            </h1>
          </div>
          <PrintButton />
        </div>
        <p className="text-muted-foreground max-w-prose text-sm">
          Votre feuille de route à imprimer : cochez chaque section au fur et à mesure que vous la
          maîtrisez. Le suivi chiffré (scores, statistiques) reste sur la page Progression.
        </p>

        {/* Champs à remplir à la main sur le papier. */}
        <dl className="text-muted-foreground flex flex-wrap gap-x-8 gap-y-2 border-y py-3 text-sm">
          <div className="flex items-baseline gap-2">
            <dt>Nom :</dt>
            <dd className="border-foreground/30 inline-block w-40 border-b" aria-hidden />
          </div>
          <div className="flex items-baseline gap-2">
            <dt>Date d&apos;épreuve :</dt>
            <dd className="border-foreground/30 inline-block w-28 border-b" aria-hidden />
          </div>
          <div className="flex items-baseline gap-2">
            <dt>Objectif de la semaine :</dt>
            <dd className="border-foreground/30 inline-block w-40 border-b" aria-hidden />
          </div>
        </dl>
      </header>

      {/* 1 — Parcours guidé : la mécanique du vol, dans l'ordre */}
      <section className="break-inside-avoid space-y-2">
        <h2 className="border-primary border-l-4 pl-3 text-xl font-semibold tracking-tight">
          1 · Parcours — Mécanique du vol
        </h2>
        <p className="text-muted-foreground text-sm">
          Les {cours.length} cours à suivre dans l&apos;ordre, chacun avec sa durée estimée.
        </p>
        <div className="border-border/70 border-l pl-3">
          {cours.map((c) => (
            <CheckItem
              key={c.id}
              id={`cours-${c.slug}`}
              label={`Cours ${c.ordre} — ${c.title}`}
              hint={`≈ ${c.dureeEstimeeMin} min`}
            />
          ))}
        </div>
      </section>

      {/* 2 — Socle Fondamentaux */}
      <section className="space-y-3">
        <h2 className="border-primary border-l-4 pl-3 text-xl font-semibold tracking-tight">
          2 · Le socle commun — Fondamentaux
        </h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {fondamentauxCategories.map((category) => (
            <CategoryBlock
              key={category.slug}
              moduleSlug="fondamentaux"
              categorySlug={category.slug}
              name={category.name}
              idPrefix={`fond-${category.slug}`}
            />
          ))}
        </div>
      </section>

      {/* 3 — Connaissances du concours */}
      <section className="space-y-3">
        <h2 className="border-primary border-l-4 pl-3 text-xl font-semibold tracking-tight">
          3 · {mod.name} — connaissances
        </h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {concoursCategories.map((category) => (
            <CategoryBlock
              key={category.slug}
              moduleSlug={mod.slug}
              categorySlug={category.slug}
              name={category.name}
              idPrefix={`conc-${category.slug}`}
            />
          ))}
        </div>
      </section>

      {/* 4 — Anglais aéronautique */}
      {anglaisFiches.length > 0 ? (
        <section className="space-y-2">
          <h2 className="border-primary border-l-4 pl-3 text-xl font-semibold tracking-tight">
            4 · Anglais aéronautique
          </h2>
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {anglaisFiches.map((fiche) => (
              <CheckItem key={fiche.id} id={`angl-${fiche.slug}`} label={fiche.title} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 5 — Psychotechnique */}
      <section className="break-inside-avoid space-y-2">
        <h2 className="border-primary border-l-4 pl-3 text-xl font-semibold tracking-tight">
          5 · Psychotechnique
        </h2>
        <p className="text-muted-foreground text-sm">
          Les familles d&apos;épreuves à travailler jusqu&apos;à l&apos;aisance chronométrée.
        </p>
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {PSY_FAMILIES.map((family) => (
            <CheckItem key={family} id={`psy-${family}`} label={FAMILY_INFO[family].name} />
          ))}
        </div>
      </section>

      <p className="text-muted-foreground border-t pt-4 text-xs">
        PrépaPilote — fiche de travail {mod.name}. Contenu vérifié et sourcé ; suivi chiffré sur la
        page Progression.
      </p>
    </main>
  );
}
