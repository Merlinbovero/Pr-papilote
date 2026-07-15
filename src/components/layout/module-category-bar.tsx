"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SidebarCategory } from "./module-sidebar-nav";

/**
 * Barre de catégories horizontale défilante, affichée sous `lg` (mobile et
 * tablette) où l'index latéral est masqué. Donne accès à toutes les catégories
 * du module sans quitter la page courante ; l'élément actif est mis en avant à
 * la couleur du module.
 */
interface ModuleCategoryBarProps {
  moduleSlug: string;
  moduleName: string;
  categories: SidebarCategory[];
  accentVar: string;
}

export function ModuleCategoryBar({
  moduleSlug,
  moduleName,
  categories,
  accentVar,
}: ModuleCategoryBarProps) {
  const pathname = usePathname();
  const ordered = [...categories].sort((a, b) => b.count - a.count);

  return (
    <nav
      className="-mx-4 mb-6 border-b px-4 sm:-mx-6 sm:px-6 lg:hidden"
      aria-label={`Catégories ${moduleName}`}
      style={{ ["--module-accent" as string]: accentVar }}
    >
      <ul className="flex gap-1 overflow-x-auto pb-3">
        {ordered.map((category) => {
          const href = `/${moduleSlug}/${category.slug}`;
          const active = pathname === href;
          return (
            <li key={category.slug} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={active ? { borderColor: "var(--module-accent)" } : undefined}
              >
                {category.name}
                {category.count > 0 ? (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {category.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
