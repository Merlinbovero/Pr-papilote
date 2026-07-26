import type { Metadata } from "next";
import Link from "next/link";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { CamerasTest } from "@/features/psychotech/cameras-test";

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
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Test des appareils photos" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · visualisation dans l’espace
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test des appareils photos</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Une scène, <strong>trois appareils numérotés</strong> à des places et des orientations
          différentes, et une seule photo : lequel l’a prise ? Les scènes sont{" "}
          <strong>générées à l’infini</strong> et chacune est vérifiée pour qu’une seule réponse
          soit défendable. Pour la méthode, voyez la{" "}
          <Link
            href="/psychotechnique/exercices/la-vision-spatiale"
            className="text-primary underline"
          >
            fiche vision spatiale
          </Link>
          .
        </p>
      </header>
      <CamerasTest />
    </StandalonePageShell>
  );
}
