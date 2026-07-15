import type { Metadata } from "next";
import Image from "next/image";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { getAllSitePhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Crédits photographiques",
  description:
    "Auteurs, licences et sources des photographies utilisées sur PrépaPilote — toutes de libre réutilisation vérifiée.",
};

/**
 * Crédits photographiques (règle éditoriale : aucune image inventée ; chaque
 * photo est réelle, sous licence de libre réutilisation, auteur et source
 * cités). Sert aussi l'obligation d'attribution des licences CC BY / CC BY-SA.
 */
export default function CreditsPhotosPage() {
  const photos = getAllSitePhotos();
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <SiteBreadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Crédits photos" }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Crédits photographiques</h1>
        <p className="text-muted-foreground max-w-prose">
          Toutes les photographies du site sont réelles et proviennent de Wikimedia Commons sous une
          licence de libre réutilisation (domaine public, CC0, CC BY ou CC BY-SA). Elles sont
          seulement redimensionnées et compressées. Aucune image n&apos;est générée.
        </p>
      </header>
      <ul className="space-y-4">
        {photos.map((photo) => (
          <li
            key={photo.src}
            className="bg-card flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
          >
            <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 12rem, 100vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-base font-semibold">{photo.title}</p>
              <p className="text-muted-foreground">Auteur : {photo.author}</p>
              <p className="text-muted-foreground">
                Licence :{" "}
                {photo.licenseUrl ? (
                  <a
                    href={photo.licenseUrl}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {photo.license}
                  </a>
                ) : (
                  photo.license
                )}
              </p>
              <a
                href={photo.sourceUrl}
                className="text-primary inline-block underline-offset-4 hover:underline"
              >
                Voir la source →
              </a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
