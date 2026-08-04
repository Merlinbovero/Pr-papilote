import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { PoolQuiz } from "@/features/quiz/pool-quiz";
import { buildConcoursPool } from "@/features/quiz/notion-pool";
import { concoursSchema } from "@/lib/content/content-schemas";
import { getModule } from "@/lib/content/referentials";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const dynamicParams = false;

/*
 * Identité Banc — lot F2a (pilote `eopan`), étendu au lot F3, **soldé au lot
 * F12**.
 *
 * Ce fichier portait un ensemble `CONCOURS_BANC = {eopan, eopn, alat}` et une
 * branche conditionnelle complète pour les concours qui n'y figuraient pas.
 * Cette branche était **morte depuis le lot F3**, et le prouver ne demande que
 * de lire trois lignes :
 *
 *   - `concoursSchema` est `z.enum(["eopan", "eopn", "alat"])` — il n'existe
 *     pas d'autre concours ;
 *   - `generateStaticParams` n'énumère que ces trois valeurs, et
 *     `dynamicParams = false` interdit toute autre URL ;
 *   - l'ensemble contenait exactement ces trois valeurs.
 *
 * Le drapeau était donc toujours vrai, et la moitié du gabarit inatteignable —
 * du code que rien n'exerçait, mais que toute relecture devait continuer à
 * comprendre et que toute modification devait continuer à maintenir. Il est
 * supprimé, et la page est écrite au seul registre qu'elle sert.
 */

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

  const entete = (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        S&apos;entraîner — {mod.name}
      </h1>
      <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
        Révision active sur la banque de questions du concours : choisissez une longueur, répondez,
        et lisez la correction de chaque question. Rien n&apos;est enregistré sans compte.
      </p>
    </header>
  );

  const filDAriane = [
    { label: "Accueil", href: "/" },
    { label: mod.name, href: `/${mod.slug}` },
    { label: "S'entraîner" },
  ];

  return (
    <StandalonePageShell
      /*
        Le registre Banc est porté par la page entière, pas par un bloc : un
        `.banc` posé sur la seule aire de séance dessinerait un rectangle
        tiède au milieu d'un fond froid. Le fond du site est le plus clair
        des deux (ΔE00 2,16 en clair, 0,86 en sombre) — toutes les encres du
        Banc y mesurent un contraste SUPÉRIEUR à celui vérifié sur
        `--bc-fond`, qui reste donc le pire cas des tests de jetons.

        La largeur et les marges passent à `.banc-cadre` : le Banc n'a qu'UN
        cadre, et le fil d'Ariane doit s'y aligner. Laissé au gabarit
        (`max-w-7xl`), il flottait 145 px à gauche de la séance.
      */
      className="banc max-w-none px-0 sm:px-0 lg:px-0"
    >
      <div className="banc-cadre">
        <SiteBreadcrumb items={filDAriane} />
      </div>

      {/* L'en-tête est confié au lanceur pour qu'il se replie avec le reste de
          l'introduction au lancement. Sans vivier il n'y a pas de séance : la
          page le rend alors elle-même, et doit fournir le cadre que
          `ModeSeance` aurait posé. */}
      {totalAvailable > 0 ? null : <div className="banc-cadre">{entete}</div>}

      {totalAvailable > 0 ? (
        <PoolQuiz
          label={label}
          poolUrl={`/entrainement/${mod.slug}/pool`}
          totalAvailable={totalAvailable}
          entete={entete}
          labelSeance={`Série d'entraînement — ${mod.name}`}
          blurb={
            <>
              Une série de questions tirées au hasard dans la banque du concours ({totalAvailable}{" "}
              disponibles), avec correction détaillée. Entraînement libre — pas un examen officiel.
            </>
          }
        />
      ) : (
        <p className="banc-cadre text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
          La banque de questions de ce concours se remplit progressivement.
        </p>
      )}
    </StandalonePageShell>
  );
}
