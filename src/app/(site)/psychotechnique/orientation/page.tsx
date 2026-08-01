import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { OrientationTest } from "@/features/psychotech/orientation-test";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Test d'orientation spatiale — lire une attitude en vol",
  description:
    "Test d'orientation des sélections pilote : lisez l'instrument de bord (horizon artificiel et compas) et retrouvez l'aéronef dans la position correspondante. Questions générées à l'infini, rendu 3D, 7 minutes / 27 questions. Reconstitution pédagogique.",
};

/**
 * Test d'orientation spatiale — la page compose le test ; la logique pure
 * (génération des attitudes, notation) vit dans src/lib/psychotech/orientation.ts
 * et le rendu 3D (Three.js, importé dynamiquement) dans le composant client.
 */
export default function OrientationPage() {
  const entete = (
    <>
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · repérage spatial
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test d&apos;orientation</h1>
        <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
          L&apos;un des tests emblématiques des sélections : lire une attitude de vol sur
          l&apos;instrument de bord, puis reconnaître l&apos;aéronef qui l&apos;adopte. Les
          questions sont générées à l&apos;infini — jamais deux fois la même.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-test-d-orientation"
        intro="Le code de l'horizon artificiel, l'inclinaison qui se lit à l'envers de l'appareil, et le cap qui se lit au compas — jamais déduit de l'inclinaison."
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
            { label: "Test d'orientation" },
          ]}
        />
      </div>
      <OrientationTest entete={entete} />
    </StandalonePageShell>
  );
}
