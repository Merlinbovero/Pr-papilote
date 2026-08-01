import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { DominosTest } from "@/features/psychotech/dominos-test";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

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
  const entete = (
    <>
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · raisonnement logique
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test de dominos</h1>
        <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
          Une série de dominos suit une règle, une tuile manque : reconstituez-la. Trois niveaux,
          dix dominos par session, et des séries <strong>générées à l’infini</strong> — jamais deux
          fois la même. La réponse se compose au pavé : rien ne s’obtient par élimination.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.les-dominos"
        intro="Les familles de règles, l’ordre dans lequel les chercher et l’arithmétique modulo 7 qui gouverne les séries. À lire avant d’attaquer le niveau 2."
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
            { label: "Test de dominos" },
          ]}
        />
      </div>
      <DominosTest entete={entete} />
    </StandalonePageShell>
  );
}
