import { NextResponse } from "next/server";
import { buildEnglishPool } from "@/features/quiz/notion-pool";

/**
 * Vivier d'anglais aéronautique, servi en JSON **à la demande** (force-static).
 * Le player ne le récupère qu'au lancement d'une série, pour ne pas alourdir le
 * HTML de l'espace anglais.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildEnglishPool());
}
