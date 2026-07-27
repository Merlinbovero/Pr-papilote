import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { DominosTest } from "@/features/psychotech/dominos-test";

export const metadata: Metadata = {
  title: "Test de dominos — trois niveaux, questions générées à l’infini",
  description:
    "Test de dominos des sélections : retrouvez la tuile manquante d’une série. Trois niveaux (facile, difficile, impossible), dix dominos par session, réponse composée au pavé, correction expliquée. Séries générées à l’infini. Reconstitution pédagogique.",
};

/**
 * Test de dominos — la page compose le test ; la génération des séries, les
 * règles et la notation vivent dans `src/lib/psychotech/dominos.ts`.
 */
export default function DominosPage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Test de dominos" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · raisonnement logique
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test de dominos</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Une série de dominos suit une règle, une tuile manque : reconstituez-la. Trois niveaux,
          dix dominos par session, et des séries <strong>générées à l’infini</strong> — jamais deux
          fois la même. La réponse se compose au pavé : rien ne s’obtient par élimination.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.les-dominos"
        intro="Les familles de règles, l’ordre dans lequel les chercher et l’arithmétique modulo 7 qui gouverne les séries. À lire avant d’attaquer le niveau 2."
      />
      <DominosTest />
    </StandalonePageShell>
  );
}
