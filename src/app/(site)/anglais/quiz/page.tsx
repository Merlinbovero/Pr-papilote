import type { Metadata } from "next";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { PoolQuiz } from "@/features/quiz/pool-quiz";
import { buildEnglishPool } from "@/features/quiz/notion-pool";

// La page pose `.banc` sur son `<main>` : c'est un point d'adhésion, donc
// elle charge le registre (voir `mode-seance.tsx`).
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Quiz d'anglais aéronautique — série chronométrée",
  description:
    "Une série de questions d'anglais aéronautique tirées au hasard — phraséologie, vocabulaire, grammaire et compréhension — avec correction détaillée. Entraînement libre à la préparation des sélections.",
};

const FIL_D_ARIANE = [
  { label: "Accueil", href: "/" },
  { label: "Anglais", href: "/anglais" },
  { label: "Quiz" },
];

/**
 * Quiz d'anglais aéronautique — **la dernière route portée par le Banc**
 * (lot F12), et la seule que la clôture ait fait naître.
 *
 * ── Pourquoi une route, et non un bloc sur le hub ───────────────────────
 * Ce quiz vivait encastré dans `/anglais`, cinquième section d'un hub qui en
 * compte cinq, et c'était la **dernière surface en registre `legacy`**. Le
 * classer `documentaire` aurait été commode et faux : le critère arbitré au
 * lot F4 range en documentaire ce qui est « court, contextuel et encastré »,
 * or celui-ci est une série de dix à quarante questions, tirée dans toute la
 * banque d'anglais et non dans la section qui la précède, avec un résultat
 * final autonome. Il échoue à deux des trois conditions.
 *
 * La doctrine prévoyait déjà ce cas, et sa réponse est écrite dans
 * `quiz-player.tsx` depuis le lot F4 :
 *
 * > si un quiz encastré devient long, chronométré, persistant ou doté d'un
 * > résultat autonome, il franchit le seuil de la séance : il doit alors
 * > proposer une **entrée explicite** vers le Banc, et non transformer
 * > silencieusement la page documentaire.
 *
 * C'est exactement ce qui est appliqué ici. Le hub garde son registre
 * documentaire et gagne une entrée nommée ; la séance obtient la page sans
 * concurrence dont elle a besoin. La symétrie était d'ailleurs déjà à moitié
 * en place : `/anglais/quiz/pool` servait le vivier avant que `/anglais/quiz`
 * n'existe.
 *
 * La composition est celle validée de F2a à F7d, sans rien de nouveau : le
 * registre est porté par la page entière, fil d'Ariane compris, et l'en-tête
 * est confié à la séance pour se replier au lancement.
 */
export default function AnglaisQuizPage() {
  const totalAvailable = buildEnglishPool().length;

  const entete = (
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Quiz d&apos;anglais</h1>
      <p className="banc-consigne text-lg" style={{ color: "var(--bc-encre2)" }}>
        Phraséologie, vocabulaire, grammaire et compréhension — choisissez une longueur, répondez,
        et lisez la correction de chaque question. Rien n&apos;est enregistré sans compte.
      </p>
    </header>
  );

  return (
    <StandalonePageShell className="banc max-w-none px-0 sm:px-0 lg:px-0">
      <div className="banc-cadre">
        <SiteBreadcrumb items={FIL_D_ARIANE} />
      </div>

      {totalAvailable > 0 ? (
        <PoolQuiz
          label="Anglais aéronautique"
          poolUrl="/anglais/quiz/pool"
          totalAvailable={totalAvailable}
          entete={entete}
          labelSeance="Série d'anglais aéronautique"
          blurb={
            <>
              Une série de questions d&apos;anglais aéronautique tirées au hasard ({totalAvailable}{" "}
              disponibles) — phraséologie, vocabulaire, grammaire et compréhension, avec correction
              détaillée.
            </>
          }
        />
      ) : (
        <>
          <div className="banc-cadre">{entete}</div>
          <p className="banc-cadre text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
            La banque de questions d&apos;anglais se remplit progressivement.
          </p>
        </>
      )}
    </StandalonePageShell>
  );
}
