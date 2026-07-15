"use client";

import { BookMarkedIcon, ChartNoAxesColumnIcon, LayersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Index latéral d'un module (desktop, ≥ lg). Outil de navigation à part
 * entière : en-tête avec total de fiches, catégories à réviser (compteur) puis
 * catégories encore vides repliées, accès aux outils du module (progression,
 * dictionnaire). Collant avec défilement interne, accent à la couleur du
 * module sur l'élément courant. Repère constant d'un module à l'autre.
 */

export interface SidebarCategory {
  slug: string;
  name: string;
  count: number;
}

interface ModuleSidebarNavProps {
  moduleSlug: string;
  moduleName: string;
  categories: SidebarCategory[];
  /** Variable CSS de la couleur d'accent du module (filet, élément actif). */
  accentVar: string;
}

export function ModuleSidebarNav({
  moduleSlug,
  moduleName,
  categories,
  accentVar,
}: ModuleSidebarNavProps) {
  const pathname = usePathname();
  const filled = categories.filter((c) => c.count > 0);
  const empty = categories.filter((c) => c.count === 0);
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  function itemClass(active: boolean) {
    return cn(
      "flex items-center justify-between gap-2 rounded-md border-l-2 px-3 py-1.5 text-sm transition-colors",
      active
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground border-transparent hover:bg-accent/60 hover:text-foreground"
    );
  }

  return (
    <aside
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-60 shrink-0 self-start overflow-y-auto pb-6 lg:block"
      aria-label={`Navigation ${moduleName}`}
      style={{ ["--module-accent" as string]: accentVar }}
    >
      <Link href={`/${moduleSlug}`} className="group mb-3 block">
        <span className="text-muted-foreground group-hover:text-foreground text-xs font-semibold tracking-wide uppercase transition-colors">
          {moduleName}
        </span>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          {total} fiche{total > 1 ? "s" : ""}
        </span>
      </Link>

      <nav className="space-y-4">
        <ul className="space-y-0.5">
          {filled.map((category) => {
            const href = `/${moduleSlug}/${category.slug}`;
            const active = pathname === href;
            return (
              <li key={category.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={itemClass(active)}
                  style={active ? { borderLeftColor: "var(--module-accent)" } : undefined}
                >
                  <span className="truncate">{category.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {category.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {empty.length > 0 ? (
          <details className="group">
            <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 px-3 text-xs font-semibold tracking-wide uppercase select-none">
              Autres catégories ({empty.length})
            </summary>
            <ul className="mt-1 space-y-0.5">
              {empty.map((category) => {
                const href = `/${moduleSlug}/${category.slug}`;
                const active = pathname === href;
                return (
                  <li key={category.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={itemClass(active)}
                      style={active ? { borderLeftColor: "var(--module-accent)" } : undefined}
                    >
                      <span className="truncate">{category.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ) : null}

        <ul className="space-y-0.5 border-t pt-3">
          <li>
            <Link
              href={`/progression/${moduleSlug}`}
              aria-current={pathname === `/progression/${moduleSlug}` ? "page" : undefined}
              className="text-foreground hover:bg-accent flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <ChartNoAxesColumnIcon aria-hidden className="size-4 shrink-0" />
              Progression
            </Link>
          </li>
          <li>
            <Link
              href="/dictionnaire"
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              <BookMarkedIcon aria-hidden className="size-4 shrink-0" />
              Dictionnaire
            </Link>
          </li>
          <li>
            <Link
              href={`/${moduleSlug}`}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              <LayersIcon aria-hidden className="size-4 shrink-0" />
              Toutes les catégories
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
