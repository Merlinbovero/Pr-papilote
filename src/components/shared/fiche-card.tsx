import Image from "next/image";
import Link from "next/link";
import { ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Carte de fiche — présentation homogène des listes (pages de catégorie,
 * matières BIA…). Deux compositions :
 *
 * - **par défaut** : titre, résumé, badge — sobre, pour les listes denses ;
 * - **média** (dès qu'une `image` est fournie) : vignette photo à gauche,
 *   type de fiche, titre, résumé et temps de lecture — pour donner envie
 *   d'explorer. Relief discret au survol, cohérent avec CategoryCard.
 */

interface FicheCardImage {
  src: string;
  alt: string;
  focal?: string;
}

interface FicheCardProps {
  href: string;
  title: string;
  summary?: string;
  badge?: string;
  /** Vignette d'illustration : bascule la carte en composition « média ». */
  image?: FicheCardImage;
  /** Libellé de type (ex. « Appareil »), affiché en surtitre. */
  typeLabel?: string;
  /** Temps de lecture estimé en minutes. */
  readingMinutes?: number;
  className?: string;
}

export function FicheCard({
  href,
  title,
  summary,
  badge,
  image,
  typeLabel,
  readingMinutes,
  className,
}: FicheCardProps) {
  const cardClass = cn(
    "bg-card h-full overflow-hidden rounded-xl border",
    "transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md",
    className
  );

  if (image) {
    return (
      <Link
        href={href}
        aria-label={title}
        className="focus-visible:ring-ring group block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
      >
        <article className={cn(cardClass, "flex")}>
          <div className="relative w-28 shrink-0 self-stretch sm:w-36">
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 640px) 9rem, 7rem"
              style={image.focal ? { objectPosition: image.focal } : undefined}
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
            {typeLabel ? (
              <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
                {typeLabel}
              </p>
            ) : null}
            <h3 className="text-base leading-tight font-semibold">{title}</h3>
            {summary ? (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{summary}</p>
            ) : null}
            {readingMinutes ? (
              <p className="text-muted-foreground mt-auto flex items-center gap-1 pt-1 text-xs">
                <ClockIcon aria-hidden className="size-3.5" />
                {readingMinutes} min
              </p>
            ) : null}
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="focus-visible:ring-ring group block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className={cn(cardClass, "p-5")}>
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
