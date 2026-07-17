"use client";

import * as React from "react";
import {
  BookMarkedIcon,
  ChartNoAxesColumnIcon,
  LayersIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Index latéral d'un module (desktop, ≥ lg). Panneau REPLIABLE : l'utilisateur
 * peut le masquer pour donner toute la place au contenu (état mémorisé en
 * local). Déplié, c'est une surface légère et distincte (sommaire du module,
 * catégories à réviser puis catégories vides repliées, outils) ; replié, il ne
 * reste qu'un rail étroit avec un bouton pour le rouvrir. Le contenu reste la
 * priorité, la navigation aide sans dominer.
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

const STORAGE_KEY = "module-sidebar-collapsed";

export function ModuleSidebarNav({
  moduleSlug,
  moduleName,
  categories,
  accentVar,
}: ModuleSidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  // Lecture différée de l'état mémorisé (comme l'exam-player) : le HTML serveur
  // reste déplié, pas d'écart d'hydratation ; on replie ensuite si besoin.
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        // stockage indisponible : on reste déplié
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const filled = categories.filter((c) => c.count > 0);
  const empty = categories.filter((c) => c.count === 0);
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  if (collapsed) {
    return (
      <aside
        className="sticky top-20 hidden shrink-0 self-start lg:block"
        aria-label={`Navigation ${moduleName}`}
      >
        <button
          type="button"
          onClick={toggle}
          className="bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40 flex size-9 items-center justify-center rounded-lg border transition-colors"
          aria-label={`Afficher le sommaire ${moduleName}`}
          title="Afficher le sommaire"
        >
          <PanelLeftOpenIcon aria-hidden className="size-5" />
        </button>
      </aside>
    );
  }

  function itemClass(active: boolean) {
    return cn(
      "flex items-center justify-between gap-2 rounded-md border-l-2 px-2.5 py-1.5 text-sm transition-colors",
      active
        ? "bg-accent text-accent-foreground font-medium"
        : "text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground"
    );
  }

  function countPill(count: number, active: boolean) {
    return (
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 py-0.5 text-[0.6875rem] tabular-nums",
          active ? "bg-primary/15 text-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    );
  }

  return (
    <aside
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-64 shrink-0 self-start overflow-y-auto pb-6 lg:block"
      aria-label={`Navigation ${moduleName}`}
      style={{ ["--module-accent" as string]: accentVar }}
    >
      <div className="bg-card/40 rounded-xl border p-3">
        {/* En-tête : sommaire du module + bouton de repli */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href={`/${moduleSlug}`} className="group min-w-0">
            <span
              className="block text-xs font-semibold tracking-wide uppercase transition-colors group-hover:opacity-80"
              style={{ color: "var(--module-accent)" }}
            >
              {moduleName}
            </span>
            <span className="text-muted-foreground mt-0.5 block text-xs">
              {total} fiche{total > 1 ? "s" : ""}
            </span>
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground hover:bg-accent -mr-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
            aria-label={`Masquer le sommaire ${moduleName}`}
            title="Masquer le sommaire"
          >
            <PanelLeftCloseIcon aria-hidden className="size-4" />
          </button>
        </div>

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
                    {countPill(category.count, active)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {empty.length > 0 ? (
            <details className="group">
              <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 px-2.5 text-xs font-semibold tracking-wide uppercase select-none">
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
                className="text-foreground hover:bg-accent flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors"
              >
                <ChartNoAxesColumnIcon aria-hidden className="size-4 shrink-0" />
                Progression
              </Link>
            </li>
            <li>
              <Link
                href="/dictionnaire"
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
              >
                <BookMarkedIcon aria-hidden className="size-4 shrink-0" />
                Dictionnaire
              </Link>
            </li>
            <li>
              <Link
                href={`/${moduleSlug}`}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
              >
                <LayersIcon aria-hidden className="size-4 shrink-0" />
                Toutes les catégories
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
