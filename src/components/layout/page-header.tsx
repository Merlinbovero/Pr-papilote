import Image from "next/image";
import type { SitePhoto } from "@/lib/photos";

/**
 * En-tête de page illustré, réutilisé sur toutes les pages intérieures
 * (retour V1 : « photos partout » + « couleur par armée »). Bandeau photo
 * réelle créditée, filet d'accent à la couleur du concours, libellé de
 * section (eyebrow), titre et description. Sans photo, se réduit à un
 * en-tête typographique propre.
 */

interface PageHeaderProps {
  /** Libellé de section en capitales (ex. « EOPAN · Appareils »). */
  eyebrow?: string;
  title: string;
  description?: string;
  photo?: SitePhoto;
  /** Variable CSS de la couleur d'accent (voir getModuleAccentVar). */
  accentVar?: string;
  /** Actions optionnelles (boutons) affichées sous la description. */
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  photo,
  accentVar = "var(--primary)",
  children,
}: PageHeaderProps) {
  if (!photo) {
    return (
      <header className="space-y-2 border-l-4 pl-4" style={{ borderColor: accentVar }}>
        {eyebrow ? (
          <p
            className="text-xs font-semibold tracking-[0.14em] uppercase"
            style={{ color: accentVar }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-prose text-lg">{description}</p>
        ) : null}
        {children ? <div className="flex flex-wrap gap-3 pt-1">{children}</div> : null}
      </header>
    );
  }

  return (
    <header className="relative isolate overflow-hidden rounded-2xl border">
      <Image
        src={photo.src}
        alt=""
        fill
        priority
        sizes="(min-width: 1280px) 1200px, 100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/25"
      />
      {/* Filet d'accent à la couleur du concours */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: accentVar }}
      />
      <div className="space-y-2 px-6 py-10 pl-8 md:px-10 md:py-14 md:pl-12">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-white/90 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl">
          {title}
        </h1>
        {description ? <p className="max-w-prose text-white/85">{description}</p> : null}
        {children ? <div className="flex flex-wrap gap-3 pt-2">{children}</div> : null}
      </div>
      <a
        href={photo.sourceUrl}
        className="absolute right-2 bottom-2 rounded px-1.5 py-0.5 text-[11px] text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        Photo : {photo.author} ({photo.license})
      </a>
    </header>
  );
}
