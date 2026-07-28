import type { Metadata } from "next";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { RevisionSession } from "@/features/revision/revision-session";
import { getModules } from "@/lib/content/referentials";

export const metadata: Metadata = {
  title: "Réviser — révision espacée",
  description:
    "Révisez au bon moment : les questions que vous maîtrisez le moins reviennent plus souvent, celles que vous maîtrisez s'espacent. Progression locale, sans compte.",
  robots: { index: false, follow: false },
};

/**
 * Révision espacée : le candidat révise sa banque de concours selon un système
 * de Leitner (échéances dérivées de ses réponses, mémorisées localement). La
 * page ne fait que composer le module — toute la logique vit côté client.
 */
export default function ReviserPage() {
  const concoursList = getModules()
    .filter((mod) => mod.kind === "concours")
    .map((mod) => ({ slug: mod.slug, name: mod.name }));

  return (
    <StandalonePageShell breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Réviser" }]}>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Réviser</h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          La révision espacée présente chaque question au bon moment : celles que vous ratez
          reviennent vite, celles que vous maîtrisez s&apos;espacent. Vos échéances sont calculées à
          partir de vos réponses et restent sur cet appareil.
        </p>
      </header>

      <RevisionSession concoursList={concoursList} />
    </StandalonePageShell>
  );
}
