import type { Metadata } from "next";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { RevisionSession } from "@/features/revision/revision-session";
import { getModules } from "@/lib/content/referentials";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Réviser — révision espacée",
  description:
    "Révisez au bon moment : les questions que vous maîtrisez le moins reviennent plus souvent, celles que vous maîtrisez s'espacent. Progression locale, sans compte.",
  robots: { index: false, follow: false },
};

const FIL_D_ARIANE = [{ label: "Accueil", href: "/" }, { label: "Réviser" }];

/**
 * Révision espacée : le candidat révise sa banque de concours selon un système
 * de Leitner (échéances dérivées de ses réponses, mémorisées localement). La
 * page ne fait que composer le module — toute la logique vit côté client.
 *
 * Deuxième route portée par le Banc (lot F2b). La composition est celle
 * validée sur `/entrainement/eopan` : le registre est porté par la page, le
 * cadre est celui du Banc — fil d'Ariane compris — et l'en-tête est confié à
 * la séance pour se replier au lancement.
 */
export default function ReviserPage() {
  const concoursList = getModules()
    .filter((mod) => mod.kind === "concours")
    .map((mod) => ({ slug: mod.slug, name: mod.name }));

  const entete = (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Réviser</h1>
      <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
        La révision espacée présente chaque question au bon moment : celles que vous ratez
        reviennent vite, celles que vous maîtrisez s&apos;espacent.
      </p>
    </header>
  );

  return (
    <StandalonePageShell className="banc max-w-none px-0 sm:px-0 lg:px-0">
      <div className="banc-cadre">
        <SiteBreadcrumb items={FIL_D_ARIANE} />
      </div>

      <RevisionSession concoursList={concoursList} entete={entete} />
    </StandalonePageShell>
  );
}
