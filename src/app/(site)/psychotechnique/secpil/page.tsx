import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SecpilSimulator } from "@/features/psychotech/secpil-simulator";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

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
  const entete = (
    <>
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · attention partagée
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Simulateur SECPIL</h1>
        <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
          L&apos;épreuve psychomotrice reine des sélections EOPN, reconstituée avec des commandes
          accessibles : suivre, coordonner, puis calculer — le tout en même temps.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-secpil"
        intro="Le déroulé réel de l’épreuve, ce que chaque phase mesure et la stratégie d’attention partagée. À lire en premier : le SECPIL se comprend avant de se travailler."
      />
    </>
  );

  return (
    <StandalonePageShell className="banc max-w-none px-0 sm:px-0 lg:px-0">
      <div className="banc-cadre">
        <SiteBreadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Psychotechnique", href: "/psychotechnique" },
            { label: "Simulateur SECPIL" },
          ]}
        />
      </div>
      <SecpilSimulator entete={entete} />
    </StandalonePageShell>
  );
}
