import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Module } from "@/lib/content/schemas";

/**
 * Fond de remplacement par module quand aucune photographie n'est fournie —
 * les paires bg/texte restent contrastées dans les deux thèmes.
 */
const PLACEHOLDER_STYLES: Record<string, string> = {
  eopan: "bg-concours-eopan text-primary-foreground",
  eopn: "bg-concours-eopn text-primary-foreground",
  alat: "bg-concours-alat text-primary-foreground",
  psychotechnique: "bg-primary text-primary-foreground",
  fondamentaux: "bg-foreground text-background",
};

interface ModuleCardProps {
  module: Module;
  orientation: "vertical" | "horizontal";
  /** Photographie réelle, licence vérifiée (src/lib/photos.ts). */
  imageSrc?: string;
  imageAlt?: string;
  /** Point focal CSS (object-position) pour garder le sujet cadré. */
  imageFocal?: string;
  /** Ligne secondaire courte (armée, vocation) affichée sous le nom. */
  subtitle?: string;
}

/**
 * Carte d'accès à un module : photographie plein cadre, nom en très gros,
 * sous-titre court facultatif. Survol discret (zoom léger, ombre),
 * désactivé si l'utilisateur préfère réduire les animations. L'aria-label
 * reste le nom seul pour des liens stables au clavier et dans les tests.
 */
export function ModuleCard({
  module: mod,
  orientation,
  imageSrc,
  imageAlt,
  imageFocal,
  subtitle,
}: ModuleCardProps) {
  return (
    <Link
      href={`/${mod.slug}`}
      aria-label={mod.name}
      className={cn(
        "group focus-visible:ring-ring relative block overflow-hidden rounded-xl border shadow-sm",
        "transition-[transform,box-shadow] duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none",
        "motion-safe:hover:scale-[1.01]",
        orientation === "vertical"
          ? "aspect-[3/4] sm:aspect-[2/3]"
          : "aspect-[8/3] sm:aspect-[4/1]",
        PLACEHOLDER_STYLES[mod.slug] ?? "bg-primary text-primary-foreground"
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ""}
          fill
          sizes={orientation === "vertical" ? "(min-width: 768px) 33vw, 100vw" : "100vw"}
          style={imageFocal ? { objectPosition: imageFocal } : undefined}
          className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.14),transparent_55%)] transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <span className="absolute right-4 bottom-4 left-4 space-y-0.5">
        <span
          className={cn(
            "block font-bold tracking-tight text-white drop-shadow-sm",
            orientation === "vertical" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          )}
        >
          {mod.name}
        </span>
        {subtitle ? (
          <span className="block text-sm font-medium text-white/85 drop-shadow-sm">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
