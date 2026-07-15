import { notFound } from "next/navigation";
import { ModuleSidebarNav } from "@/components/layout/module-sidebar-nav";
import { getFichesByCategory } from "@/lib/content/fiches";
import { getCategories, getModule, getModules } from "@/lib/content/referentials";

export const dynamicParams = false;

export function generateStaticParams() {
  return getModules().map((mod) => ({ module: mod.slug }));
}

/**
 * Coquille commune des cinq modules : index latéral des catégories (desktop)
 * et contenu. La structure est identique d'un module à l'autre — l'utilisateur
 * ne réapprend jamais l'interface.
 */
export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) {
    notFound();
  }
  const categories = getCategories(mod.slug).map((category) => ({
    slug: category.slug,
    name: category.name,
    count: getFichesByCategory(mod.slug, category.slug).length,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ModuleSidebarNav moduleSlug={mod.slug} moduleName={mod.name} categories={categories} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
