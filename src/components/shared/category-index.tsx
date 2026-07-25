import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Index de revue (traitement éditorial) : la liste « À réviser » d'un hub de
 * module rendue comme un sommaire de revue — rangées numérotées, filets fins,
 * décompte aligné à droite. Registre sobre et lisible, sans carte ni photo :
 * la hiérarchie vient de la typographie et des règles horizontales. L'accent
 * du module ne se révèle qu'au survol (filet latéral + soulignement du titre),
 * pour rester compatible thème clair/sombre.
 */

interface CategoryIndexItem {
  slug: string;
  name: string;
  count: number;
  description?: string;
}

interface CategoryIndexProps {
  /** Préfixe des liens (ex. `/eopn`). */
  basePath: string;
  categories: CategoryIndexItem[];
  /** Variable CSS de la couleur d'accent du module. */
  accentVar?: string;
  className?: string;
}

export function CategoryIndex({
  basePath,
  categories,
  accentVar = "var(--primary)",
  className,
}: CategoryIndexProps) {
  return (
    <ol className={cn("grid grid-cols-1 sm:grid-cols-2 sm:gap-x-12 lg:gap-x-16", className)}>
      {categories.map((category, index) => (
        <li key={category.slug} className="border-border border-t last:border-b">
          <Link
            href={`${basePath}/${category.slug}`}
            className="group focus-visible:ring-ring relative flex items-baseline gap-4 rounded-sm py-4 pr-1 pl-3 focus-visible:ring-2 focus-visible:outline-none"
          >
            {/* Filet d'accent latéral, révélé au survol */}
            <span
              aria-hidden
              className="absolute top-1/2 left-0 h-0 w-0.5 -translate-y-1/2 rounded-full opacity-0 transition-all duration-200 group-hover:h-8 group-hover:opacity-100"
              style={{ backgroundColor: accentVar }}
            />
            <span className="text-muted-foreground w-6 shrink-0 text-xs font-semibold tracking-widest tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block font-semibold tracking-tight underline-offset-4 group-hover:underline"
                style={{ textDecorationColor: accentVar }}
              >
                {category.name}
              </span>
              {category.description ? (
                <span className="text-muted-foreground mt-0.5 block truncate text-xs leading-snug">
                  {category.description}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-lg leading-none font-bold tabular-nums">
                {category.count}
              </span>
              <span className="text-muted-foreground block text-[10px] tracking-[0.16em] uppercase">
                {category.count > 1 ? "fiches" : "fiche"}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
