import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { BaseMap } from "@/features/cartes/base-map";
import { getImplantationViews } from "@/lib/cartes/data";
import { getModuleAccentVar } from "@/lib/module-accent";
import { SITE_PHOTOS } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Implantations de l'ALAT — carte des implantations",
  description:
    "Écoles (Dax, Le Cannet-des-Maures), régiments d'hélicoptères de combat et états-majors.",
};

/** Carte aviation légère de l'armée de Terre — composition : les données viennent de l'assemblage serveur. */

export default function CartePage() {
  const implantations = getImplantationViews("terre");
  return (
    <main className="space-y-8">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Cartes des bases", href: "/cartes" },
          { label: "Implantations de l'ALAT" },
        ]}
      />
      <PageHeader
        eyebrow="Cartes des bases · Armée de Terre"
        title="Implantations de l'ALAT"
        description="Écoles (Dax, Le Cannet-des-Maures), régiments d'hélicoptères de combat et états-majors."
        photo={SITE_PHOTOS.alat}
        accentVar={getModuleAccentVar("alat")}
      />
      <BaseMap implantations={implantations} armeeLabel="aviation légère de l'armée de Terre" />
    </main>
  );
}
