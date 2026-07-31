import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { PoolQuiz } from "@/features/quiz/pool-quiz";
import { buildConcoursPool } from "@/features/quiz/notion-pool";
import { concoursSchema } from "@/lib/content/content-schemas";
import { getModule } from "@/lib/content/referentials";

export const dynamicParams = false;

/**
 * Route pilote de l'identité Banc — lot F2a.
 *
 * Un seul concours l'active. Les autres gabarits d'entraînement, servis par
 * ce même fichier, gardent le rendu historique : la migration se fait route
 * par route, et se compare donc à un témoin non migré.
 */
const CONCOURS_BANC = "eopan";

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
  const banc = parsed.data === CONCOURS_BANC;

  const entete = (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        S&apos;entraîner — {mod.name}
      </h1>
      <p
        className={banc ? "banc-consigne text-lg" : "text-muted-foreground max-w-prose text-lg"}
        style={banc ? { color: "var(--bc-encre2)" } : undefined}
      >
        Révision active sur la banque de questions du concours : choisissez une longueur, répondez,
        et lisez la correction de chaque question. Rien n&apos;est enregistré sans compte.
      </p>
    </header>
  );

  return (
    <StandalonePageShell
      /*
        Le registre Banc est porté par la page entière, pas par un bloc : un
        `.banc` posé sur la seule aire de séance dessinerait un rectangle
        tiède au milieu d'un fond froid. Le fond du site est le plus clair
        des deux (ΔE00 2,16 en clair, 0,86 en sombre) — toutes les encres du
        Banc y mesurent un contraste SUPÉRIEUR à celui vérifié sur
        `--bc-fond`, qui reste donc le pire cas des tests de jetons.
      */
      className={banc ? "banc" : undefined}
      breadcrumb={[
        { label: "Accueil", href: "/" },
        { label: mod.name, href: `/${mod.slug}` },
        { label: "S'entraîner" },
      ]}
    >
      {/* En variante Banc, l'en-tête est confié au lanceur pour qu'il se
          replie avec le reste de l'introduction au lancement. Sans vivier il
          n'y a pas de séance : la page le rend alors elle-même. */}
      {banc && totalAvailable > 0 ? null : entete}

      {totalAvailable > 0 ? (
        <PoolQuiz
          label={label}
          poolUrl={`/entrainement/${mod.slug}/pool`}
          totalAvailable={totalAvailable}
          variant={banc ? "banc" : "legacy"}
          entete={banc ? entete : undefined}
          blurb={
            <>
              Une série de questions tirées au hasard dans la banque du concours ({totalAvailable}{" "}
              disponibles), avec correction détaillée. Entraînement libre — pas un examen officiel.
            </>
          }
        />
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
          La banque de questions de ce concours se remplit progressivement.
        </p>
      )}
    </StandalonePageShell>
  );
}
