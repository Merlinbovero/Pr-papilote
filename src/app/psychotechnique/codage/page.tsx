import type { Metadata } from "next";
import { MethodeFicheCard } from "@/components/content/methode-fiche-card";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { CodageTest } from "@/features/psychotech/codage-test";

export const metadata: Metadata = {
  title: "Test de codage (TAMI-C) — 45 questions en 2 min 30",
  description:
    "Test de codage du TAMI-C (sélections EOPN) : une grille de mots associés à des codes à quatre chiffres, 45 questions en 2 min 30. Trois tailles de grille, correction nommant le mot du code donné par erreur. Reconstitution pédagogique.",
};

/**
 * Codage — la page compose l’entraîneur ; toute la génération et la notation
 * vivent dans `src/lib/psychotech/codage.ts`.
 */
export default function CodagePage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Codage" },
        ]}
      />
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Psychotechnique · vitesse de recherche
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Test de codage</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Une grille de mots, un code à quatre chiffres pour chacun, et{" "}
          <strong>45 questions en 2 min 30</strong> — 3,3 secondes l’unité. La grille ne change pas
          de la session : on la mémorise peu à peu, et c’est ce qui fait gagner du temps. Les cinq
          codes proposés viennent <strong>tous de la grille</strong> : aucun ne s’élimine sans avoir
          retrouvé la bonne ligne.
        </p>
      </header>
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-test-de-codage"
        intro="La boucle de lecture à installer, la comparaison chiffre par chiffre qui sépare 1985 de 1988, et pourquoi le débit compte ici autant que la justesse."
      />
      <CodageTest />
    </StandalonePageShell>
  );
}
