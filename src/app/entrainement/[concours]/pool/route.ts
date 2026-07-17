import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { buildConcoursPool } from "@/features/quiz/notion-pool";
import { concoursSchema } from "@/lib/content/content-schemas";

/**
 * Vivier d'entraînement d'un concours, servi en JSON **à la demande**.
 * Gelé au build (force-static, mis en cache) : le player ne le récupère qu'au
 * lancement d'une session, pour ne pas alourdir le HTML de la page (le vivier
 * d'un concours dépasse plusieurs centaines de questions).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return concoursSchema.options.map((concours) => ({ concours }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ concours: string }> }
) {
  const { concours } = await params;
  const parsed = concoursSchema.safeParse(concours);
  if (!parsed.success) {
    notFound();
  }
  return NextResponse.json(buildConcoursPool(parsed.data));
}
