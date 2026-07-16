import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { BiaExamPlayer } from "@/features/bia/exam-player";
import { getBiaConfig } from "@/lib/bia/config";
import { getBiaExamPools } from "@/lib/bia/data";

export const metadata: Metadata = {
  title: "Examen blanc BIA — 100 questions",
  description:
    "Un examen blanc du BIA dans les conditions de l'épreuve : 100 questions, 2 h 30, note par matière, correction détaillée et renvoi vers les fiches.",
};

/**
 * Examen blanc BIA — la page sérialise les viviers (calculés au build)
 * et la configuration ; toute l'expérience (tirage par session,
 * chronomètre, correction) vit dans le player client.
 */
export default function BiaExamenBlancPage() {
  const config = getBiaConfig();
  // Le vivier (~450 Ko) n'est plus sérialisé dans la page : le player le
  // récupère à la demande depuis /bia/examen-blanc/pool au lancement (Phase 16).
  // Seul le total (un nombre) est calculé au serveur pour l'écran d'accueil.
  const pools = getBiaExamPools();
  const totalAvailable = [...pools.byMatiere.values()].reduce((sum, list) => sum + list.length, 0);
  const matiereNames = Object.fromEntries(config.matieres.map((m) => [m.slug, m.name]));

  return (
    <StandalonePageShell>
      <SiteBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Parcours BIA", href: "/bia" },
          { label: "Examen blanc" },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Examen blanc BIA</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          100 questions, 2 h 30, les cinq matières dans l&apos;ordre officiel — puis une correction
          qui devient votre programme de révision.
        </p>
      </header>
      <BiaExamPlayer
        poolUrl="/bia/examen-blanc/pool"
        totalAvailable={totalAvailable}
        config={config}
        matiereNames={matiereNames}
      />
    </StandalonePageShell>
  );
}
