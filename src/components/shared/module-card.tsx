import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Module } from "@/lib/content/schemas";

/**
 * Fond de remplacement par module tant que les photographies définitives
 * (droits vérifiés) ne sont pas fournies — voir VISION.md, arbitrage 12.
 * Les paires bg/texte restent contrastées dans les deux thèmes.
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
  /** Photographie officielle, branchée plus tard sans changer le composant. */
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * Carte d'accès à un module sur la page d'accueil : visuel plein cadre,
 * nom en très gros, aucun texte secondaire. Survol discret (zoom léger,
 * ombre), désactivé si l'utilisateur préfère réduire les animations.
 */
export function ModuleCard({ module: mod, orientation, imageSrc, imageAlt }: ModuleCardProps) {
  return (
    <Link
      href={`/${mod.slug}`}
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
          className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.14),transparent_55%)] transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      <span
        className={cn(
          "absolute right-4 bottom-4 left-4 font-bold tracking-tight text-white drop-shadow-sm",
          orientation === "vertical" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
        )}
      >
        {mod.name}
      </span>
    </Link>
  );
}
