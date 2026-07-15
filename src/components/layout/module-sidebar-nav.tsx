"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Index latéral d'un module (desktop). Chaque catégorie porte son nombre de
 * fiches ; les catégories vides sont estompées mais restent accessibles ; la
 * catégorie courante est surlignée. Sert de repère constant d'un module à
 * l'autre sans réapprentissage (retour V1 n°2).
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
}

export function ModuleSidebarNav({ moduleSlug, moduleName, categories }: ModuleSidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 lg:block" aria-label={`Navigation ${moduleName}`}>
      <Link
        href={`/${moduleSlug}`}
        className="text-muted-foreground hover:text-foreground mb-3 block text-sm font-semibold tracking-wide uppercase transition-colors"
      >
        {moduleName}
      </Link>
      <nav>
        <ul className="space-y-0.5">
          {categories.map((category) => {
            const href = `/${moduleSlug}/${category.slug}`;
            const active = pathname === href;
            return (
              <li key={category.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{category.name}</span>
                  {category.count > 0 ? (
                    <span className="shrink-0 text-xs tabular-nums">{category.count}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
          <li className="pt-2">
            <Link
              href={`/progression/${moduleSlug}`}
              aria-current={pathname === `/progression/${moduleSlug}` ? "page" : undefined}
              className="text-primary hover:bg-accent block rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Progression
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
