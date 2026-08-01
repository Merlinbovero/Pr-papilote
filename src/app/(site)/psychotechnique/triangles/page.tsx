import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { TrianglesTest } from "@/features/psychotech/triangles-test";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Test des triangles — quel losange complète la figure ?",
  description:
    "Test des triangles des sélections EOPAN : un grand triangle découpé en petits triangles coloriés, deux laissés blancs, quatre losanges proposés. Format officiel 20 figures en 8 minutes, trois niveaux, correction nommant la règle. Reconstitution pédagogique.",
};

const FIL_D_ARIANE = [
  { label: "Accueil", href: "/" },
  { label: "Psychotechnique", href: "/psychotechnique" },
  { label: "Triangles" },
];

/**
 * Triangles — la page compose l’entraîneur ; toute la génération et la
 * notation vivent dans `src/lib/psychotech/triangles.ts`.
 *
 * Portée par le Banc au lot F7b : le chapeau éditorial et la fiche MÉTHODE
 * sont confiés à la séance pour se replier au lancement, faute de quoi ils
 * repoussaient le premier contrôle de réponse à 1 363 px sur un écran de 900.
 */
export default function TrianglesPage() {
  const entete = (
    <>
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · reconnaissance de motifs
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test des triangles</h1>
        <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
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
    </>
  );

  return (
    <StandalonePageShell className="banc max-w-none px-0 sm:px-0 lg:px-0">
      <div className="banc-cadre">
        <SiteBreadcrumb items={FIL_D_ARIANE} />
      </div>
      <TrianglesTest entete={entete} />
    </StandalonePageShell>
  );
}
