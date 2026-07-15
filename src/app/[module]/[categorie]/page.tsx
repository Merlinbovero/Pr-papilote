import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { FicheCard } from "@/components/shared/fiche-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getFichesByCategory, getFicheHref } from "@/lib/content/fiches";
import { getCategories, getCategory, getModule } from "@/lib/content/referentials";
import { getModuleAccentVar } from "@/lib/module-accent";
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
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Fiches de la catégorie">
          {fiches.map((fiche) => (
            <li key={fiche.id}>
              <FicheCard href={getFicheHref(fiche)} title={fiche.title} summary={fiche.summary} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
