import { NextResponse } from "next/server";
import { getBiaConfig } from "@/lib/bia/config";
import { getBiaExamPools, toBiaPlayerQuestion, type BiaPlayerQuestion } from "@/lib/bia/data";

/**
 * Vivier de l'examen blanc BIA, servi en JSON **à la demande** (Phase 16).
 * Le contenu est gelé au build : la réponse est générée statiquement et
 * mise en cache, au lieu d'alourdir le HTML de la page d'examen (~450 Ko de
 * questions n'étaient téléchargés que pour être, le plus souvent, inutilisés).
 * Le player ne récupère ce vivier qu'au lancement effectif de l'examen.
 */
export const dynamic = "force-static";

export function GET() {
  const config = getBiaConfig();
  const pools = getBiaExamPools();
  const serialized: Record<string, BiaPlayerQuestion[]> = {};
  for (const matiere of config.matieres) {
    serialized[matiere.slug] = (pools.byMatiere.get(matiere.slug) ?? []).map((question) =>
      toBiaPlayerQuestion(question, matiere.slug)
    );
  }
  return NextResponse.json(serialized);
}
