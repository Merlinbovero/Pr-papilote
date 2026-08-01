import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { BiaExamPlayer } from "@/features/bia/exam-player";
import { getBiaConfig } from "@/lib/bia/config";
import { getBiaExamPools } from "@/lib/bia/data";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Examen blanc BIA — 100 questions",
  description:
    "Un examen blanc du BIA dans les conditions de l'épreuve : 100 questions, 2 h 30, note par matière, correction détaillée et renvoi vers les fiches.",
};

const FIL_D_ARIANE = [
  { label: "Accueil", href: "/" },
  { label: "Parcours BIA", href: "/bia" },
  { label: "Examen blanc" },
];

/**
 * Examen blanc BIA — la page sérialise les viviers (calculés au build)
 * et la configuration ; toute l'expérience (tirage par session,
 * chronomètre, correction) vit dans le player client.
 *
 * Quatrième route portée par le Banc (lot F5), et la première qui soit une
 * ÉPREUVE plutôt qu'un entraînement. La composition est celle validée sur
 * `/entrainement/eopan` puis `/reviser` : le registre est porté par la page
 * entière — fil d'Ariane compris, sans quoi il flotterait hors du cadre — et
 * l'en-tête est confié à la séance pour se replier au lancement.
 */
export default function BiaExamenBlancPage() {
  const config = getBiaConfig();
  // Le vivier (~450 Ko) n'est plus sérialisé dans la page : le player le
  // récupère à la demande depuis /bia/examen-blanc/pool au lancement (Phase 16).
  // Seul le total (un nombre) est calculé au serveur pour l'écran d'accueil.
  const pools = getBiaExamPools();
  const totalAvailable = [...pools.byMatiere.values()].reduce((sum, list) => sum + list.length, 0);
  const matiereNames = Object.fromEntries(config.matieres.map((m) => [m.slug, m.name]));

  const entete = (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Examen blanc BIA</h1>
      <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
        100 questions, 2 h 30, les cinq matières dans l&apos;ordre officiel — puis une correction
        qui devient votre programme de révision.
      </p>
    </header>
  );

  return (
    <StandalonePageShell className="banc max-w-none px-0 sm:px-0 lg:px-0">
      <div className="banc-cadre">
        <SiteBreadcrumb items={FIL_D_ARIANE} />
      </div>

      <BiaExamPlayer
        poolUrl="/bia/examen-blanc/pool"
        totalAvailable={totalAvailable}
        config={config}
        matiereNames={matiereNames}
        entete={entete}
      />
    </StandalonePageShell>
  );
}
