import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { FormesTest } from "@/features/psychotech/formes-test";

export const metadata: Metadata = {
  title: "Test des formes imbriquées — de quel jeu de pièces vient cet assemblage ?",
  description:
    "Test des formes imbriquées des sélections EOPAN : un assemblage de pièces enchevêtrées, quatre jeux de pièces désassemblées, un seul est le bon. Format officiel 20 assemblages en 8 minutes, trois niveaux, correction expliquée. Reconstitution pédagogique.",
};

/**
 * Formes imbriquées — la page compose l’entraîneur ; toute la génération et la
 * notation vivent dans `src/lib/psychotech/formes.ts`.
 */
export default function FormesImbriqueesPage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Formes imbriquées" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · visualisation dans l’espace
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Test des formes imbriquées
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Un assemblage de pièces enchevêtrées, quatre jeux de pièces désassemblées :{" "}
          <strong>un seul a servi à le construire</strong>. Trois niveaux, du jeu de trois pièces
          bien distinctes aux cinq pièces que seul un détail sépare. Les assemblages sont générés et
          chacun est vérifié pour qu’une seule réponse soit défendable.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.les-formes-imbriquees"
        intro="Compter les pièces, lire les contours avant les volumes, cartographier les jonctions, puis éliminer plutôt que confirmer — et pourquoi deux passages valent mieux qu'un."
      />
      <FormesTest />
    </StandalonePageShell>
  );
}
