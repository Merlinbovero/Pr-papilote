import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { CalculTest } from "@/features/psychotech/calcul-test";

export const metadata: Metadata = {
  title: "Calcul mental — neuf thèmes, trois niveaux, questions sans fin",
  description:
    "Entraînement au calcul mental des sélections EOPAN : additions, multiplications, divisions, grilles 3×3, ordres de grandeur, fractions et pourcentages, calculs du métier. Format officiel 24 questions en 8 minutes, ou séries sans fin. Questions tirées au hasard à chaque session.",
};

/**
 * Calcul mental — la page compose l’entraîneur ; toute la génération et la
 * notation vivent dans `src/lib/psychotech/calcul.ts`.
 */
export default function CalculMentalPage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Calcul mental" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · calcul mental
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Calcul mental</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          L’épreuve jugée la plus difficile des sélections — et celle qui se travaille le mieux.
          Neuf thèmes, trois niveaux, quatre longueurs dont un <strong>format sans fin</strong> que
          l’on arrête quand on veut. Les questions sont{" "}
          <strong>tirées au hasard à chaque session</strong> — chaque thème en réserve plusieurs
          milliers, vous ne reverrez pas le même calcul.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-calcul-mental"
        intro="Les techniques de calcul rapide, les conversions du métier (nœuds, pieds, règle du 1 en 60) et les pièges classiques. À lire avant de chronométrer quoi que ce soit."
      />
      <CalculTest />
    </StandalonePageShell>
  );
}
