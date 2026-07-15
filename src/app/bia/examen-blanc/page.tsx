import type { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { BiaExamPlayer } from "@/features/bia/exam-player";
import { getBiaConfig } from "@/lib/bia/config";
import { getBiaExamPools, toBiaPlayerQuestion, type BiaPlayerQuestion } from "@/lib/bia/data";

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
  const pools = getBiaExamPools();

  const serialized: Record<string, BiaPlayerQuestion[]> = {};
  for (const matiere of config.matieres) {
    serialized[matiere.slug] = (pools.byMatiere.get(matiere.slug) ?? []).map((q) =>
      toBiaPlayerQuestion(q, matiere.slug)
    );
  }
  const matiereNames = Object.fromEntries(config.matieres.map((m) => [m.slug, m.name]));

  return (
    <main className="space-y-8">
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
      <BiaExamPlayer pools={serialized} config={config} matiereNames={matiereNames} />
    </main>
  );
}
