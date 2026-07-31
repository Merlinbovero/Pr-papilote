import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { PoolQuiz } from "@/features/quiz/pool-quiz";
import { buildConcoursPool } from "@/features/quiz/notion-pool";
import { concoursSchema } from "@/lib/content/content-schemas";
import { getModule } from "@/lib/content/referentials";
import { cn } from "@/lib/utils";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const dynamicParams = false;

/**
 * Identité Banc — lot F2a (pilote `eopan`), étendu au lot F3.
 *
 * Les trois concours servis par ce fichier portent désormais le Banc. Le
 * gabarit est commun : `eopan` a servi de pilote pendant que `eopn` et `alat`
 * restaient témoins, et c'est cette comparaison qui a mesuré le gain avant de
 * l'étendre.
 *
 * **Le témoin ne disparaît pas pour autant.** Les autres appelants du lecteur
 * de quiz — `/anglais`, les quiz de matière BIA, les mini-quiz de fiche, les
 * leçons canoniques — gardent le rendu historique, et leur registre vit dans
 * `e2e/banc-route-pilote.spec.ts`. La comparaison reste donc possible ; elle
 * change simplement de surface.
 *
 * Un ensemble plutôt qu'une valeur : ajouter un concours au Banc ne doit pas
 * demander de retoucher la condition, seulement cette ligne.
 */
const CONCOURS_BANC = new Set(["eopan", "eopn", "alat"]);

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
  const banc = CONCOURS_BANC.has(parsed.data);

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
      className={banc ? "banc max-w-none px-0 sm:px-0 lg:px-0" : undefined}
      breadcrumb={banc ? undefined : filDAriane}
    >
      {banc ? (
        <div className="banc-cadre">
          <SiteBreadcrumb items={filDAriane} />
        </div>
      ) : null}

      {/* En variante Banc, l'en-tête est confié au lanceur pour qu'il se
          replie avec le reste de l'introduction au lancement. Sans vivier il
          n'y a pas de séance : la page le rend alors elle-même, et doit alors
          fournir le cadre que `ModeSeance` aurait posé. */}
      {banc && totalAvailable > 0 ? null : banc ? (
        <div className="banc-cadre">{entete}</div>
      ) : (
        entete
      )}

      {totalAvailable > 0 ? (
        <PoolQuiz
          label={label}
          poolUrl={`/entrainement/${mod.slug}/pool`}
          totalAvailable={totalAvailable}
          variant={banc ? "banc" : "legacy"}
          entete={banc ? entete : undefined}
          labelSeance={banc ? `Série d'entraînement — ${mod.name}` : undefined}
          blurb={
            <>
              Une série de questions tirées au hasard dans la banque du concours ({totalAvailable}{" "}
              disponibles), avec correction détaillée. Entraînement libre — pas un examen officiel.
            </>
          }
        />
      ) : (
        <p
          className={cn(
            "text-muted-foreground rounded-lg border border-dashed p-6 text-sm",
            banc && "banc-cadre"
          )}
        >
          La banque de questions de ce concours se remplit progressivement.
        </p>
      )}
    </StandalonePageShell>
  );
}
