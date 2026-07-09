import Image from "next/image";
import { cn } from "@/lib/utils";

interface ContentImageProps {
  src: string;
  /** Texte alternatif OBLIGATOIRE (accessibilité — ch. 9 §5). */
  alt: string;
  /** Dimensions explicites imposées (aucun décalage de mise en page — CLS). */
  width: number;
  height: number;
  /** Légende affichée sous l'image. */
  caption?: string;
  /** Crédit visible (auteur · source · licence) — jamais d'image sans droit. */
  credit?: string;
  /** Vraie seulement pour l'image « au-dessus de la ligne de flottaison ». */
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Image de contenu (ch. 9 §3) : enveloppe unique de `next/image` qui impose
 * `alt`, des dimensions explicites (pas de CLS) et le chargement différé par
 * défaut. Les formats modernes (AVIF/WebP) et le redimensionnement sont pris
 * en charge par Next. Aucune image de contenu ne s'intègre autrement.
 */
export function ContentImage({
  src,
  alt,
  width,
  height,
  caption,
  credit,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 720px",
  className,
}: ContentImageProps) {
  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={cn("h-auto max-w-full rounded-lg border", className)}
    />
  );

  if (!caption && !credit) {
    return image;
  }

  return (
    <figure className="space-y-2">
      {image}
      {caption || credit ? (
        <figcaption className="text-muted-foreground text-sm">
          {caption}
          {caption && credit ? " " : null}
          {credit ? <span className="italic">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
