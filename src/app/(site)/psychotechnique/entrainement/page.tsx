import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { TrainingSession } from "@/features/psychotech/training-session";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Entraînement psychotechnique — sessions chronométrées",
  description:
    "Entraînez-vous aux tests psychotechniques des sélections pilote : calcul mental, suites, séries logiques, mémoire, empan de chiffres, attention, orientation, rapidité, dominos, rotation mentale et double tâche — exercices générés, chronométrés et corrigés avec méthode.",
};

const FIL_D_ARIANE = [
  { label: "Accueil", href: "/" },
  { label: "Psychotechnique", href: "/psychotechnique" },
  { label: "Entraînement" },
];

/**
 * Entraînement psychotechnique — la page compose le player client ;
 * génération, chronométrage et notation vivent dans src/lib/psychotech.
 *
 * Cinquième route portée par le Banc (lot F7a), et la **pilote du module
 * psychotechnique** : c'est ici que l'audit F0b avait relevé ses pires
 * mesures. La composition est celle validée en F2a, F2b, F3 puis F5 — le
 * registre est porté par la page entière, fil d'Ariane compris, et l'en-tête
 * est confié à la séance pour se replier au lancement.
 */
export default function EntrainementPage() {
  const entete = (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Entraînement psychotechnique
      </h1>
      <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
        Onze familles d&apos;exercices générés à l&apos;infini, chronométrés comme aux sélections —
        chaque erreur renvoie vers la méthode.
      </p>
    </header>
  );

  return (
    <StandalonePageShell className="banc max-w-none px-0 sm:px-0 lg:px-0">
      <div className="banc-cadre">
        <SiteBreadcrumb items={FIL_D_ARIANE} />
      </div>

      <TrainingSession entete={entete} />
    </StandalonePageShell>
  );
}
