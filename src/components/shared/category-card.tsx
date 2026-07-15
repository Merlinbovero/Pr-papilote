import { createElement } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

/**
 * Carte de catégorie (design pass D2) : icône de famille dans une pastille
 * teintée à la couleur du module, titre, décompte. Relief discret au survol
 * (ombre + légère montée). Système visuel commun aux hubs de modules et au
 * BIA — cohérence sans dépendre d'une photo par catégorie.
 */

interface CategoryCardProps {
  href: string;
  name: string;
  /** slug de catégorie (choisit l'icône). */
  categorySlug: string;
  /** Nombre de fiches (affiché si > 0). */
  count?: number;
  description?: string;
  /** Variable CSS de la couleur d'accent du module. */
  accentVar?: string;
}

export function CategoryCard({
  href,
  name,
  categorySlug,
  count,
  description,
  accentVar = "var(--primary)",
}: CategoryCardProps) {
  const icon = createElement(getCategoryIcon(categorySlug), {
    className: "size-4",
    style: { color: accentVar },
    "aria-hidden": true,
  });
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring group block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <div
        className={cn(
          "bg-card relative h-full overflow-hidden rounded-xl border p-4",
          "transition-[transform,box-shadow,border-color] duration-200",
          "group-hover:-translate-y-0.5 group-hover:shadow-md"
        )}
      >
        {/* Filet d'accent supérieur, révélé au survol */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ backgroundColor: accentVar }}
        />
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in oklab, ${accentVar} 14%, transparent)` }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm leading-tight font-semibold">{name}</h3>
              {count && count > 0 ? (
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {count} {count > 1 ? "fiches" : "fiche"}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
