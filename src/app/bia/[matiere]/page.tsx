import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { FicheCard } from "@/components/shared/fiche-card";
import { MatiereQuiz } from "@/features/bia/matiere-quiz";
import { getBiaConfig, getBiaMatiere } from "@/lib/bia/config";
import { getBiaExamPools, getBiaFichesByMatiere, toBiaPlayerQuestion } from "@/lib/bia/data";
import { getCategory } from "@/lib/content/referentials";
import { getFicheHref } from "@/lib/content/fiches";
import { SITE_PHOTOS, type SitePhoto } from "@/lib/photos";

/** Photo d'en-tête par matière du BIA (design pass D2). */
const MATIERE_PHOTOS: Record<string, SitePhoto> = {
  "meteorologie-aerologie": SITE_PHOTOS.meteo,
  "aerodynamique-et-principes-du-vol": SITE_PHOTOS.fondamentaux,
  "etude-des-aeronefs-et-engins-spatiaux": SITE_PHOTOS.espace,
  "navigation-reglementation-securite": SITE_PHOTOS.psychotechnique,
  "histoire-et-culture": SITE_PHOTOS.histoire,
  anglais: SITE_PHOTOS.eopn,
};

interface MatierePageProps {
  params: Promise<{ matiere: string }>;
}

export function generateStaticParams() {
  const config = getBiaConfig();
  return [...config.matieres.map((m) => ({ matiere: m.slug }))].concat([
    { matiere: config.epreuveFacultative.slug },
  ]);
}

export async function generateMetadata({ params }: MatierePageProps): Promise<Metadata> {
  const { matiere: slug } = await params;
  const matiere = getBiaMatiere(slug);
  if (!matiere) {
    return {};
  }
  return {
    title: `${matiere.name} — parcours BIA`,
    description: matiere.description,
  };
}

/** Une matière du BIA : ses fiches groupées par catégorie et son quiz. */
export default async function BiaMatierePage({ params }: MatierePageProps) {
  const { matiere: slug } = await params;
  const matiere = getBiaMatiere(slug);
  if (!matiere) {
    notFound();
  }

  const fiches = getBiaFichesByMatiere().get(slug) ?? [];
  const pools = getBiaExamPools();
  const pool = (pools.byMatiere.get(slug) ?? []).map((q) => toBiaPlayerQuestion(q, slug));

  const byCategory = new Map<string, typeof fiches>();
  for (const fiche of fiches) {
    const list = byCategory.get(fiche.category);
    if (list) {
      list.push(fiche);
    } else {
      byCategory.set(fiche.category, [fiche]);
    }
  }

  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Parcours BIA", href: "/bia" },
          { label: matiere.name },
        ]}
      />
      <PageHeader
        eyebrow="Parcours BIA"
        title={matiere.name}
        description={matiere.description}
        photo={MATIERE_PHOTOS[slug]}
      />
      <p className="text-muted-foreground text-sm">
        {fiches.length} fiches · {pool.length} questions d&apos;entraînement
      </p>

      <section aria-label="Fiches de la matière" className="space-y-6">
        {[...byCategory.entries()].map(([categorySlug, list]) => {
          const category = getCategory("fondamentaux", categorySlug);
          return (
            <div key={categorySlug} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {category?.name ?? categorySlug}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((fiche) => (
                  <li key={fiche.id}>
                    <FicheCard
                      href={getFicheHref(fiche)}
                      title={fiche.title}
                      summary={fiche.summary}
                      badge={`Niveau ${fiche.level}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section aria-label="Quiz de la matière">
        <MatiereQuiz matiereName={matiere.name} pool={pool} />
      </section>
    </StandalonePageShell>
  );
}
