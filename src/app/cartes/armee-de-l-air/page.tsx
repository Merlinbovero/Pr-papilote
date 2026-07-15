import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { BaseMap } from "@/features/cartes/base-map";
import { getImplantationViews } from "@/lib/cartes/data";
import { getModuleAccentVar } from "@/lib/module-accent";
import { SITE_PHOTOS } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Bases de l'armée de l'Air et de l'Espace — carte des implantations",
  description:
    "Le parcours EOPN sur la carte — Salon, Cognac, Saint-Dizier, Istres, Mont-de-Marsan, Avord.",
};

/** Carte armée de l'Air et de l'Espace — composition : les données viennent de l'assemblage serveur. */

export default function CartePage() {
  const implantations = getImplantationViews("air");
  return (
    <main className="space-y-8">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Cartes des bases", href: "/cartes" },
          { label: "Bases de l'armée de l'Air et de l'Espace" },
        ]}
      />
      <PageHeader
        eyebrow="Cartes des bases · Armée de l'Air et de l'Espace"
        title="Bases de l'armée de l'Air et de l'Espace"
        description="Le parcours EOPN sur la carte — Salon, Cognac, Saint-Dizier, Istres, Mont-de-Marsan, Avord."
        photo={SITE_PHOTOS.eopn}
        accentVar={getModuleAccentVar("eopn")}
      />
      <BaseMap implantations={implantations} armeeLabel="armée de l'Air et de l'Espace" />
    </main>
  );
}
