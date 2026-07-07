import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getCategories, getCategory, getModule } from "@/lib/content/referentials";

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

  return (
    <main className="space-y-8">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: mod.name, href: `/${mod.slug}` },
          { label: category.name },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground">{mod.name}</p>
      </header>
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Contenu en cours de production</EmptyTitle>
          <EmptyDescription>
            Les fiches de cette catégorie seront publiées progressivement. Chaque fiche indiquera
            ses sources et sa date de dernière vérification.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
}
