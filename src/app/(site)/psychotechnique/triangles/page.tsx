import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { TrianglesTest } from "@/features/psychotech/triangles-test";

export const metadata: Metadata = {
  title: "Test des triangles — quel losange complète la figure ?",
  description:
    "Test des triangles des sélections EOPAN : un grand triangle découpé en petits triangles coloriés, deux laissés blancs, quatre losanges proposés. Format officiel 20 figures en 8 minutes, trois niveaux, correction nommant la règle. Reconstitution pédagogique.",
};

/**
 * Triangles — la page compose l’entraîneur ; toute la génération et la
 * notation vivent dans `src/lib/psychotech/triangles.ts`.
 */
export default function TrianglesPage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Triangles" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · reconnaissance de motifs
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test des triangles</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Un grand triangle découpé en petits triangles coloriés,{" "}
          <strong>deux laissés blancs</strong>, quatre losanges proposés : un seul complète la
          figure. Elle n’est pas coloriée au hasard — répétition, symétrie, diagonales, couronnes —
          et <strong>trouver la règle, c’est trouver la pièce</strong>. Format officiel : 20 figures
          en 8 minutes.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-test-des-triangles"
        intro="Les sept familles de règles qui gouvernent la figure, la méthode en quatre temps — chercher la règle avant la pièce, la vérifier sur une case connue, éliminer — et le piège des marques, qui suivent souvent une autre règle que les couleurs."
      />
      <TrianglesTest />
    </StandalonePageShell>
  );
}
