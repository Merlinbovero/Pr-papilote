import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { TrainingSession } from "@/features/psychotech/training-session";

export const metadata: Metadata = {
  title: "Entraînement psychotechnique — sessions chronométrées",
  description:
    "Entraînez-vous aux tests psychotechniques des sélections pilote : calcul mental, suites, séries logiques, mémoire, empan de chiffres, attention, orientation, rapidité, dominos, rotation mentale et double tâche — exercices générés, chronométrés et corrigés avec méthode.",
};

/**
 * Entraînement psychotechnique — la page compose le player client ;
 * génération, chronométrage et notation vivent dans src/lib/psychotech.
 */
export default function EntrainementPage() {
  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Psychotechnique", href: "/psychotechnique" },
          { label: "Entraînement" },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Entraînement psychotechnique
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Onze familles d&apos;exercices générés à l&apos;infini, chronométrés comme aux sélections
          — chaque erreur renvoie vers la méthode.
        </p>
      </header>
      <TrainingSession />
    </StandalonePageShell>
  );
}
