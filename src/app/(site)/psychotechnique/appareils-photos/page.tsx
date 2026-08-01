import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { CamerasTest } from "@/features/psychotech/cameras-test";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Test des appareils photos — quel objectif a pris cette vue ?",
  description:
    "Test des appareils photos des sélections EOPAN : une scène, trois appareils numérotés, une seule photo — lequel l’a prise ? Scènes générées à l’infini en 3D, format officiel 30 vues en 8 minutes, correction expliquée. Reconstitution pédagogique.",
};

/**
 * Test des appareils photos — la page compose le test ; la génération des
 * scènes et la garantie d’unicité de la réponse vivent dans
 * `src/lib/psychotech/cameras.ts`, le rendu 3D dans `camera-scene.tsx`.
 */
export default function AppareilsPhotosPage() {
  const entete = (
    <>
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · visualisation dans l’espace
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test des appareils photos</h1>
        <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
          Une scène, <strong>trois appareils numérotés</strong> à des places et des orientations
          différentes, et une seule photo : lequel l’a prise ? Les scènes sont{" "}
          <strong>générées à l’infini</strong> et chacune est vérifiée pour qu’une seule réponse
          soit défendable.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-test-des-appareils-photos"
        intro="L'ordre gauche-droite des objets, les occultations qui éliminent en un coup d'œil, et l'erreur qui coûte le plus cher : raisonner depuis sa place de lecteur au lieu de se placer à l'objectif."
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
            { label: "Test des appareils photos" },
          ]}
        />
      </div>
      <CamerasTest entete={entete} />
    </StandalonePageShell>
  );
}
