import type { Metadata } from "next";
import Link from "next/link";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SecpilSimulator } from "@/features/psychotech/secpil-simulator";

export const metadata: Metadata = {
  title: "Simulateur SECPIL — entraîneur psychomoteur (souris + flèches)",
  description:
    "Entraîneur inspiré du SECPIL des sélections EOPN : suivi d'un point sur un « 8 » (manche/souris), cible horizontale (palonnier/flèches) et calcul mental, en attention partagée sur quatre phases. Version accessible, sans lien avec le logiciel officiel.",
};

/**
 * Simulateur SECPIL — la page compose l'entraîneur temps réel ; toute la logique
 * pure (géométrie des cibles, notation, séquence de calcul) vit dans
 * src/lib/psychotech/secpil.ts et le rendu dans le composant client.
 */
export default function SecpilPage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Simulateur SECPIL" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · attention partagée
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Simulateur SECPIL</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          L&apos;épreuve psychomotrice reine des sélections EOPN, reconstituée avec des commandes
          accessibles : suivre, coordonner, puis calculer — le tout en même temps. Pour comprendre
          l&apos;épreuve et la méthode, lisez la{" "}
          <Link href="/psychotechnique/exercices/le-secpil" className="text-primary underline">
            fiche SECPIL
          </Link>
          .
        </p>
      </header>
      <SecpilSimulator />
    </StandalonePageShell>
  );
}
