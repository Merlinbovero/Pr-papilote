import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { BaseMap } from "@/features/cartes/base-map";
import { getImplantationViews } from "@/lib/cartes/data";
import { getFranceMap } from "@/lib/cartes/geo";
import { getFranceLandmarks } from "@/lib/cartes/landmarks";
import { getModuleAccentVar } from "@/lib/module-accent";
import { SITE_PHOTOS } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Bases de l'aéronautique navale — carte des implantations",
  description:
    "Les quatre BAN métropolitaines — chasse embarquée en Bretagne, patrouille maritime à Lann-Bihoué, hélicoptères à Hyères et Lanvéoc.",
};

/** Carte aéronautique navale — composition : les données viennent de l'assemblage serveur. */

export default function CartePage() {
  const implantations = getImplantationViews("marine");
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Cartes des bases", href: "/cartes" },
          { label: "Bases de l'aéronautique navale" },
        ]}
      />
      <PageHeader
        eyebrow="Cartes des bases · Marine nationale"
        title="Bases de l'aéronautique navale"
        description="Les BAN métropolitaines — chasse embarquée en Bretagne, patrouille maritime à Lann-Bihoué, hélicoptères à Hyères et Lanvéoc — et les bases navales outre-mer."
        photo={SITE_PHOTOS.marine}
        accentVar={getModuleAccentVar("eopan")}
      />
      <BaseMap
        implantations={implantations}
        armeeLabel="aéronautique navale"
        map={getFranceMap()}
        landmarks={getFranceLandmarks()}
        accentVar={getModuleAccentVar("eopan")}
      />
    </StandalonePageShell>
  );
}
