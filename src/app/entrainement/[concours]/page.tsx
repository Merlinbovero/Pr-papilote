import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { ConcoursTraining } from "@/features/quiz/concours-training";
import { buildConcoursPool } from "@/features/quiz/notion-pool";
import { concoursSchema } from "@/lib/content/content-schemas";
import { getModule } from "@/lib/content/referentials";

export const dynamicParams = false;

interface EntrainementPageProps {
  params: Promise<{ concours: string }>;
}

export function generateStaticParams() {
  return concoursSchema.options.map((concours) => ({ concours }));
}

export async function generateMetadata({ params }: EntrainementPageProps): Promise<Metadata> {
  const { concours } = await params;
  const mod = getModule(concours);
  if (!mod) {
    return {};
  }
  return {
    title: `S'entraîner — ${mod.name}`,
    description: `Séries de questions tirées de la banque ${mod.name}, avec correction détaillée. Entraînement libre à la préparation du concours.`,
  };
}

/**
 * Entraînement libre d'un concours : la page ne sérialise que le décompte du
 * vivier ; le tirage et la correction vivent dans le player client, qui
 * récupère les questions à la demande depuis la route statique `/pool`.
 */
export default async function EntrainementPage({ params }: EntrainementPageProps) {
  const { concours } = await params;
  const parsed = concoursSchema.safeParse(concours);
  const mod = parsed.success ? getModule(parsed.data) : undefined;
  if (!parsed.success || !mod) {
    notFound();
  }

  const totalAvailable = buildConcoursPool(parsed.data).length;
  const label = mod.fullName ? `${mod.name} — ${mod.fullName}` : mod.name;

  return (
    <StandalonePageShell
      breadcrumb={[
        { label: "Accueil", href: "/" },
        { label: mod.name, href: `/${mod.slug}` },
        { label: "S'entraîner" },
      ]}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          S&apos;entraîner — {mod.name}
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Révision active sur la banque de questions du concours : choisissez une longueur,
          répondez, et lisez la correction de chaque question. Rien n&apos;est enregistré sans
          compte.
        </p>
      </header>

      {totalAvailable > 0 ? (
        <ConcoursTraining
          label={label}
          poolUrl={`/entrainement/${mod.slug}/pool`}
          totalAvailable={totalAvailable}
        />
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
          La banque de questions de ce concours se remplit progressivement.
        </p>
      )}
    </StandalonePageShell>
  );
}
