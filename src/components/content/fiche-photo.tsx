import Image from "next/image";
import type { FichePhoto } from "@/lib/content/content-schemas";

/**
 * Bannière photo d'illustration en tête de fiche (design pass P1) : une vraie
 * photo libre de droits qui montre le sujet, avec crédit et lien vers la
 * source (attribution des licences CC honorée).
 */
export function FichePhotoBanner({ photo }: { photo: FichePhoto }) {
  return (
    <figure className="space-y-1.5 print:hidden">
      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden rounded-2xl border sm:aspect-[2/1]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="(min-width: 1280px) 900px, 100vw"
          style={photo.focal ? { objectPosition: photo.focal } : undefined}
          className="object-cover"
        />
      </div>
      <figcaption className="text-muted-foreground text-xs">
        {photo.alt} — Photo :{" "}
        <a href={photo.sourceUrl} className="underline-offset-2 hover:underline">
          {photo.author} ({photo.license})
        </a>
      </figcaption>
    </figure>
  );
}
