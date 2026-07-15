import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { BaseMap } from "@/features/cartes/base-map";
import { getImplantationViews } from "@/lib/cartes/data";

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
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Bases de l&apos;armée de l&apos;Air et de l&apos;Espace
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Le parcours EOPN sur la carte — Salon, Cognac, Saint-Dizier, Istres, Mont-de-Marsan,
          Avord.
        </p>
      </header>
      <BaseMap implantations={implantations} armeeLabel="armée de l'Air et de l'Espace" />
    </main>
  );
}
