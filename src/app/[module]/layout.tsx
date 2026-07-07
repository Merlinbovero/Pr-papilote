import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getModule, getModules } from "@/lib/content/referentials";

export const dynamicParams = false;

export function generateStaticParams() {
  return getModules().map((mod) => ({ module: mod.slug }));
}

/**
 * Coquille commune des cinq modules : barre latérale des catégories
 * (desktop) et contenu. La structure est identique d'un module à l'autre
 * — l'utilisateur ne réapprend jamais l'interface.
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
  const categories = getCategories(mod.slug);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block" aria-label={`Navigation ${mod.name}`}>
        <p className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          {mod.name}
        </p>
        <nav>
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/${mod.slug}/${category.slug}`}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground block rounded-md px-3 py-1.5 text-sm transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href={`/progression/${mod.slug}`}
                className="text-primary hover:bg-accent block rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                Progression
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
