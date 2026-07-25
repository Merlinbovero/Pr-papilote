import { createElement } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

/**
 * Tableau de revue (traitement éditorial) : la liste « À réviser » d'un hub de
 * module rendue comme un vrai tableau de référence — colonnes « Catégorie /
 * Fiches », filets réguliers, décompte aligné à droite. Registre studieux et
 * dense, lisible d'un coup d'œil. Sur écran large, les catégories se répartissent
 * en deux tableaux côte à côte ; sur mobile, ils s'empilent. L'accent du module
 * ne colore que l'icône de famille ; tokens uniquement (thème clair/sombre).
 */

interface CategoryTableItem {
  slug: string;
  name: string;
  count: number;
  description?: string;
}

interface CategoryTableProps {
  /** Préfixe des liens (ex. `/eopn`). */
  basePath: string;
  categories: CategoryTableItem[];
  /** Variable CSS de la couleur d'accent du module. */
  accentVar?: string;
  className?: string;
}

function CategoryTableBlock({
  basePath,
  categories,
  accentVar,
}: {
  basePath: string;
  categories: CategoryTableItem[];
  accentVar: string;
}) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>
          <th className="border-foreground text-muted-foreground border-b-2 px-3 pb-2.5 text-xs font-semibold tracking-wider uppercase">
            Catégorie
          </th>
          <th className="border-foreground text-muted-foreground border-b-2 px-3 pb-2.5 text-right text-xs font-semibold tracking-wider uppercase">
            Fiches
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr
            key={category.slug}
            className="border-border hover:bg-muted/60 border-b transition-colors"
          >
            <td className="px-3 py-3">
              <Link
                href={`${basePath}/${category.slug}`}
                className="group focus-visible:ring-ring flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <span aria-hidden className="shrink-0">
                  {createElement(getCategoryIcon(category.slug), {
                    className: "size-4",
                    style: { color: accentVar },
                  })}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold underline-offset-4 group-hover:underline">
                    {category.name}
                  </span>
                  {category.description ? (
                    <span className="text-muted-foreground block truncate text-xs leading-snug">
                      {category.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </td>
            <td className="px-3 py-3 text-right align-middle whitespace-nowrap">
              <span className="text-base font-bold tabular-nums">{category.count}</span>
              <span className="text-muted-foreground ml-1 text-xs font-medium">
                {category.count > 1 ? "fiches" : "fiche"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CategoryTable({
  basePath,
  categories,
  accentVar = "var(--primary)",
  className,
}: CategoryTableProps) {
  const half = Math.ceil(categories.length / 2);
  const firstHalf = categories.slice(0, half);
  const secondHalf = categories.slice(half);

  return (
    <div
      className={cn("grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12 md:gap-y-0", className)}
    >
      <CategoryTableBlock basePath={basePath} categories={firstHalf} accentVar={accentVar} />
      {secondHalf.length > 0 ? (
        <CategoryTableBlock basePath={basePath} categories={secondHalf} accentVar={accentVar} />
      ) : null}
    </div>
  );
}
