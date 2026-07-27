import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { OrientationTest } from "@/features/psychotech/orientation-test";

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
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Test d'orientation" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · repérage spatial
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test d&apos;orientation</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          L&apos;un des tests emblématiques des sélections : lire une attitude de vol sur
          l&apos;instrument de bord, puis reconnaître l&apos;aéronef qui l&apos;adopte. Les
          questions sont générées à l&apos;infini — jamais deux fois la même.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.la-vision-spatiale"
        intro="Lire un horizon artificiel et un compas sans hésiter : le code de couleurs, l’assiette, l’inclinaison et le cap, puis la rotation mentale qui relie l’instrument à l’aéronef."
      />
      <OrientationTest />
    </StandalonePageShell>
  );
}
