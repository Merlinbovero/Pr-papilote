import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartLineIcon, TimerIcon } from "lucide-react";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, getModule } from "@/lib/content/referentials";
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
  const categories = getCategories(mod.slug);
  const photo = getModulePhoto(mod.slug);

  return (
    <main className="space-y-8">
      <SiteBreadcrumb items={[{ label: "Accueil", href: "/" }, { label: mod.name }]} />
      {photo ? (
        <header className="relative isolate overflow-hidden rounded-2xl border">
          <Image
            src={photo.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="-z-10 object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-black/25"
          />
          <div className="space-y-2 px-6 py-10 md:px-10 md:py-14">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl">
              {mod.name}
            </h1>
            {mod.fullName ? (
              <p className="text-lg text-white/90">
                {mod.fullName}
                {mod.organization ? ` · ${mod.organization}` : null}
              </p>
            ) : null}
            <p className="max-w-prose text-white/85">{mod.description}</p>
          </div>
        </header>
      ) : (
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{mod.name}</h1>
          {mod.fullName ? (
            <p className="text-muted-foreground text-lg">
              {mod.fullName}
              {mod.organization ? ` · ${mod.organization}` : null}
            </p>
          ) : null}
          <p className="max-w-prose">{mod.description}</p>
        </header>
      )}
      <section aria-label="Catégories">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/${mod.slug}/${category.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    {category.description ? (
                      <CardDescription>{category.description}</CardDescription>
                    ) : null}
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
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
    </main>
  );
}
