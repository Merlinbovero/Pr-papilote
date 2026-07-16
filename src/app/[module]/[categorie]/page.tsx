import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { FicheCard } from "@/components/shared/fiche-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getFichesByCategory, getFicheHref, getReadingMinutes } from "@/lib/content/fiches";
import { getCategories, getCategory, getModule } from "@/lib/content/referentials";
import { getFicheTypeLabel } from "@/lib/fiche-type-label";
import { getModuleAccentVar } from "@/lib/module-accent";
import { getServiceGroup, SERVICE_GROUPS } from "@/lib/service-status";
import { getCategoryPhoto } from "@/lib/photos";

export const dynamicParams = false;

interface CategoryHubProps {
  params: Promise<{ module: string; categorie: string }>;
}

export function generateStaticParams({ params }: { params: { module: string } }) {
  return getCategories(params.module).map((category) => ({ categorie: category.slug }));
}

export async function generateMetadata({ params }: CategoryHubProps): Promise<Metadata> {
  const { module: moduleSlug, categorie } = await params;
  const mod = getModule(moduleSlug);
  const category = getCategory(moduleSlug, categorie);
  if (!mod || !category) {
    return {};
  }
  return {
    title: `${category.name} — ${mod.name}`,
    description: `${category.name} du module ${mod.name} sur PrépaPilote.`,
  };
}

/**
 * Hub de catégorie. Affiche l'état vide tant que la production de
 * contenu n'a pas commencé ; accueillera la liste des fiches.
 */
export default async function CategoryHubPage({ params }: CategoryHubProps) {
  const { module: moduleSlug, categorie } = await params;
  const mod = getModule(moduleSlug);
  const category = getCategory(moduleSlug, categorie);
  if (!mod || !category) {
    notFound();
  }
  const fiches = getFichesByCategory(mod.slug, category.slug);
  const accentVar = getModuleAccentVar(mod.slug);
  const photo = getCategoryPhoto(mod.slug, category.slug);
  // Regroupement par statut de service dès qu'une fiche d'aéronef le porte.
  const hasService = fiches.some((fiche) => fiche.service);

  const renderFicheCard = (fiche: (typeof fiches)[number]) => (
    <FicheCard
      href={getFicheHref(fiche)}
      title={fiche.title}
      summary={fiche.summary}
      image={
        fiche.image
          ? { src: fiche.image.src, alt: fiche.image.alt, focal: fiche.image.focal }
          : undefined
      }
      typeLabel={getFicheTypeLabel(fiche.type)}
      readingMinutes={getReadingMinutes(fiche)}
    />
  );

  return (
    <main className="space-y-8">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: mod.name, href: `/${mod.slug}` },
          { label: category.name },
        ]}
      />
      <PageHeader
        eyebrow={mod.name}
        title={category.name}
        description={category.description}
        photo={photo}
        accentVar={accentVar}
      />
      {fiches.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Contenu en cours de production</EmptyTitle>
            <EmptyDescription>
              Les fiches de cette catégorie seront publiées progressivement. Chaque fiche indiquera
              ses sources et sa date de dernière vérification.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : hasService ? (
        <div className="space-y-8">
          {SERVICE_GROUPS.map(({ group, label }) => {
            const groupFiches = fiches.filter(
              (fiche) => fiche.service && getServiceGroup(fiche.service.status) === group
            );
            if (groupFiches.length === 0) {
              return null;
            }
            return (
              <section key={group} aria-labelledby={`groupe-${group}`} className="space-y-3">
                <h2 id={`groupe-${group}`} className="text-lg font-semibold tracking-tight">
                  {label}{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    ({groupFiches.length})
                  </span>
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {groupFiches.map((fiche) => (
                    <li key={fiche.id}>{renderFicheCard(fiche)}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Fiches de la catégorie">
          {fiches.map((fiche) => (
            <li key={fiche.id}>{renderFicheCard(fiche)}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
