import Link from "next/link";
import type { RelationItem } from "./types";

interface RelationBlockProps {
  title: string;
  items: RelationItem[];
}

/**
 * Encart de relations généré depuis le graphe documentaire
 * (Notions préalables, Notions liées, Voir également, Applications).
 * Ne rien afficher si la relation est vide : pas de zone morte.
 */
export function RelationBlock({ title, items }: RelationBlockProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label={title} className="space-y-2">
      <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
            {item.context ? (
              <span className="text-muted-foreground text-sm"> — {item.context}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
