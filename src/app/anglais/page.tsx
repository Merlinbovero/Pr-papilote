import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenTextIcon, MessagesSquareIcon, RadioTowerIcon } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { PoolQuiz } from "@/features/quiz/pool-quiz";
import { BilingualVocab, type BilingualEntry } from "@/features/anglais/bilingual-vocab";
import { PhoneticTrainer } from "@/features/anglais/phonetic-trainer";
import { buildEnglishPool } from "@/features/quiz/notion-pool";
import { getFichesByCategory, getFicheHref, getTermes } from "@/lib/content/fiches";

export const metadata: Metadata = {
  title: "Anglais aéronautique — l'espace dédié",
  description:
    "Tout l'anglais des sélections pilote au même endroit : fiches et textes aéronautiques en anglais, vocabulaire bilingue en cartes-éclair, phraséologie et quiz chronométré avec correction.",
};

const CATEGORY = { module: "fondamentaux", category: "anglais-aeronautique" } as const;

/**
 * Espace « Anglais aéronautique » : réunit en un seul lieu le contenu anglais
 * déjà validé — les fiches (le « manuel » et les textes en anglais), le
 * vocabulaire bilingue du dictionnaire et le quiz d'anglais. Aucune donnée
 * nouvelle : la page compose l'existant.
 */
export default function AnglaisPage() {
  const fiches = getFichesByCategory(CATEGORY.module, CATEGORY.category);
  const englishTotal = buildEnglishPool().length;
  const vocab: BilingualEntry[] = getTermes()
    .filter((terme) => terme.english)
    .map((terme) => ({
      slug: terme.id.replace(/^terme\./, ""),
      fr: terme.title,
      en: terme.english as string,
      detail: terme.sigleExpansion,
    }));

  return (
    <StandalonePageShell breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Anglais" }]}>
      <header className="space-y-2">
        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          Anglais aéronautique
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          L&apos;espace anglais des sélections
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Tout l&apos;anglais du vol au même endroit : les fiches et textes aéronautiques en
          anglais, le vocabulaire bilingue en cartes-éclair, la phraséologie et un quiz chronométré.
          La maîtrise de l&apos;anglais est décisive aux sélections EOPAN, EOPN et ALAT.
        </p>
      </header>

      {/* Manuel & textes : les fiches d'anglais (lecture) */}
      <section aria-labelledby="fiches-titre" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="fiches-titre"
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
          >
            <BookOpenTextIcon aria-hidden className="text-primary size-5" />
            Le manuel et les textes en anglais
          </h2>
          <p className="text-muted-foreground max-w-prose text-sm">
            {fiches.length} fiches : cellule, moteur et instruments en anglais, phraséologie, météo
            (METAR), lecture d&apos;un NOTAM, faux amis, grammaire et méthode de compréhension.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fiches.map((fiche) => (
            <li key={fiche.id}>
              <Link
                href={getFicheHref(fiche)}
                className="bg-card hover:border-primary/40 hover:bg-elevated focus-visible:ring-ring block h-full rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="block leading-snug font-semibold">{fiche.title}</span>
                <span className="text-muted-foreground mt-1.5 line-clamp-2 block text-sm leading-6">
                  {fiche.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Vocabulaire bilingue */}
      <section aria-labelledby="vocab-titre" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="vocab-titre"
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
          >
            <MessagesSquareIcon aria-hidden className="text-primary size-5" />
            Vocabulaire bilingue
          </h2>
          <p className="text-muted-foreground max-w-prose text-sm">
            {vocab.length} termes en cartes-éclair, dans les deux sens — révisez le mot juste,
            français comme anglais.
          </p>
        </div>
        <BilingualVocab entries={vocab} />
      </section>

      {/* Alphabet OACI : référence + entraînement + épeleur */}
      <section aria-labelledby="alphabet-titre" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="alphabet-titre"
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
          >
            <RadioTowerIcon aria-hidden className="text-primary size-5" />
            L&apos;alphabet aéronautique (OACI)
          </h2>
          <p className="text-muted-foreground max-w-prose text-sm">
            Alfa, Bravo, Charlie… l&apos;épellation radio est incontournable à l&apos;oral. Épelez
            un mot, entraînez-vous en cartes-éclair et gardez la table sous la main.
          </p>
        </div>
        <PhoneticTrainer />
      </section>

      {/* Quiz d'anglais */}
      {englishTotal > 0 ? (
        <section aria-labelledby="quiz-titre" className="space-y-4">
          <h2 id="quiz-titre" className="sr-only">
            Quiz d&apos;anglais aéronautique
          </h2>
          <PoolQuiz
            label="Anglais aéronautique"
            poolUrl="/anglais/quiz/pool"
            totalAvailable={englishTotal}
            blurb={
              <>
                Une série de questions d&apos;anglais aéronautique tirées au hasard ({englishTotal}{" "}
                disponibles) — phraséologie, vocabulaire, grammaire et compréhension, avec
                correction détaillée.
              </>
            }
          />
        </section>
      ) : null}
    </StandalonePageShell>
  );
}
