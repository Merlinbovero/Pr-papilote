import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { BaseMap } from "@/features/cartes/base-map";
import { getImplantationViews } from "@/lib/cartes/data";

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
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Implantations de l&apos;ALAT
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Écoles (Dax, Le Cannet-des-Maures), régiments d&apos;hélicoptères de combat et
          états-majors.
        </p>
      </header>
      <BaseMap implantations={implantations} armeeLabel="aviation légère de l'armée de Terre" />
    </main>
  );
}
