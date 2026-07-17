import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartLineIcon, ListChecksIcon, TimerIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { CategoryCard } from "@/components/shared/category-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFichesByCategory } from "@/lib/content/fiches";
import { getCategories, getModule } from "@/lib/content/referentials";
import { getModuleAccentVar } from "@/lib/module-accent";
import { getModulePhoto } from "@/lib/photos";

interface ModuleHubProps {
  params: Promise<{ module: string }>;
}

export async function generateMetadata({ params }: ModuleHubProps): Promise<Metadata> {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) {
    return {};
  }
  return {
    title: mod.fullName ? `${mod.name} — ${mod.fullName}` : mod.name,
    description: mod.description,
  };
}

/** Hub de module : identité, catégories, entrée vers la progression. */
export default async function ModuleHubPage({ params }: ModuleHubProps) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) {
    notFound();
  }
  const categories = getCategories(mod.slug).map((category) => ({
    ...category,
    count: getFichesByCategory(mod.slug, category.slug).length,
  }));
  const populated = categories.filter((category) => category.count > 0);
  const empty = categories.filter((category) => category.count === 0);
  const photo = getModulePhoto(mod.slug);
  const accentVar = getModuleAccentVar(mod.slug);

  return (
    <main className="space-y-8">
      <SiteBreadcrumb items={[{ label: "Accueil", href: "/" }, { label: mod.name }]} />
      <PageHeader
        eyebrow={
          mod.fullName
            ? `${mod.fullName}${mod.organization ? ` · ${mod.organization}` : ""}`
            : undefined
        }
        title={mod.name}
        description={mod.description}
        photo={photo}
        accentVar={accentVar}
        size="hero"
      />
      {/* Outils du module : les actions, mises en avant et peu nombreuses */}
      <section aria-label="Outils du module">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mod.slug === "psychotechnique" ? (
            <li>
              <Link
                href="/psychotechnique/entrainement"
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="border-primary/30 hover:border-primary h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TimerIcon aria-hidden className="text-primary size-4" />
                      Entraînement chronométré
                    </CardTitle>
                    <CardDescription>
                      Sessions générées — calcul, suites, mémoire, attention, orientation…
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ) : null}
          {mod.kind === "concours" ? (
            <li>
              <Link
                href={`/entrainement/${mod.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="border-primary/30 hover:border-primary h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ListChecksIcon aria-hidden className="text-primary size-4" />
                      S&apos;entraîner
                    </CardTitle>
                    <CardDescription>
                      Séries de questions du concours, tirées au hasard, avec correction détaillée.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ) : null}
          <li>
            <Link
              href={`/progression/${mod.slug}`}
              className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
            >
              <Card className="border-primary/30 hover:border-primary h-full transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ChartLineIcon aria-hidden className="text-primary size-4" />
                    Progression
                  </CardTitle>
                  <CardDescription>Votre espace personnel pour ce module.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        </ul>
      </section>

      {/* Catégories nourries : cartes avec compteur ; le reste en liste discrète */}
      {populated.length > 0 ? (
        <section aria-labelledby="categories-titre" className="space-y-4">
          <h2 id="categories-titre" className="text-xl font-semibold tracking-tight">
            À réviser
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {populated.map((category) => (
              <li key={category.slug}>
                <CategoryCard
                  href={`/${mod.slug}/${category.slug}`}
                  name={category.name}
                  categorySlug={category.slug}
                  count={category.count}
                  description={category.description}
                  accentVar={accentVar}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {empty.length > 0 ? (
        <section aria-labelledby="avenir-titre" className="space-y-3">
          <h2 id="avenir-titre" className="text-muted-foreground text-sm font-semibold">
            Autres catégories — contenu en cours de production
          </h2>
          <ul className="flex flex-wrap gap-2">
            {empty.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/${mod.slug}/${category.slug}`}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring hover:border-foreground/30 inline-block rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
