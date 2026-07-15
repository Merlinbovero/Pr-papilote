import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { BaseMap } from "@/features/cartes/base-map";
import { getImplantationViews } from "@/lib/cartes/data";

export const metadata: Metadata = {
  title: "Bases de l'aéronautique navale — carte des implantations",
  description:
    "Les quatre BAN métropolitaines — chasse embarquée en Bretagne, patrouille maritime à Lann-Bihoué, hélicoptères à Hyères et Lanvéoc.",
};

/** Carte aéronautique navale — composition : les données viennent de l'assemblage serveur. */

export default function CartePage() {
  const implantations = getImplantationViews("marine");
  return (
    <main className="space-y-8">
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Cartes des bases", href: "/cartes" },
          { label: "Bases de l'aéronautique navale" },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Bases de l&apos;aéronautique navale
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Les quatre BAN métropolitaines — chasse embarquée en Bretagne, patrouille maritime à
          Lann-Bihoué, hélicoptères à Hyères et Lanvéoc.
        </p>
      </header>
      <BaseMap implantations={implantations} armeeLabel="aéronautique navale" />
    </main>
  );
}
