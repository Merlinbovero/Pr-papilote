import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Carte de fiche (design pass D4) — présentation homogène des listes de fiches
 * (pages de catégorie, matières BIA…). Titre, résumé tronqué, badge optionnel,
 * relief discret au survol (ombre + légère montée), cohérent avec CategoryCard.
 */

interface FicheCardProps {
  href: string;
  title: string;
  summary?: string;
  badge?: string;
  className?: string;
}

export function FicheCard({ href, title, summary, badge, className }: FicheCardProps) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring group block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <div
        className={cn(
          "bg-card h-full rounded-xl border p-5",
          "transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md",
          className
        )}
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-base leading-tight font-semibold">{title}</h3>
          {summary ? (
            <p className="text-muted-foreground line-clamp-3 text-sm leading-snug">{summary}</p>
          ) : null}
          {badge ? (
            <Badge variant="outline" className="w-fit font-normal">
              {badge}
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
