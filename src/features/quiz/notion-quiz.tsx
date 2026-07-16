"use client";

import * as React from "react";
import { TargetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizPlayer, type PlayerQuestion } from "./quiz-player";

/**
 * Mini-quiz d'une notion, en fin de fiche (Phase 8). Le vivier complet des
 * questions qui évaluent la fiche est fourni par le serveur ; le tirage se
 * fait au clic (jamais au rendu, pour éviter tout écart d'hydratation).
 * La fiche elle-même n'affiche jamais de progression.
 */
interface NotionQuizProps {
  ficheTitle: string;
  pool: PlayerQuestion[];
  /** Taille maximale d'une série (le vivier peut être plus petit). */
  seriesSize?: number;
}

function drawSeries(pool: PlayerQuestion[], size: number): PlayerQuestion[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(size, shuffled.length));
}

export function NotionQuiz({ ficheTitle, pool, seriesSize = 5 }: NotionQuizProps) {
  const [series, setSeries] = React.useState<PlayerQuestion[] | null>(null);

  if (pool.length === 0) {
    return null;
  }

  const drawCount = Math.min(seriesSize, pool.length);

  if (!series) {
    return (
      <section
        id="s-entrainer"
        aria-labelledby="s-entrainer-titre"
        className="bg-card scroll-mt-20 rounded-xl border p-6 print:hidden"
      >
        <h2
          id="s-entrainer-titre"
          className="mb-1 flex items-center gap-2 text-2xl font-semibold tracking-tight"
        >
          <TargetIcon aria-hidden className="text-primary size-5" />
          Tester cette notion
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {pool.length} question{pool.length > 1 ? "s" : ""} porte
          {pool.length > 1 ? "nt" : ""} sur cette fiche — série de {drawCount}, correction
          immédiate, renvoi vers la fiche.
        </p>
        <Button onClick={() => setSeries(drawSeries(pool, seriesSize))}>
          <TargetIcon aria-hidden className="size-4" />
          Tester cette notion
        </Button>
      </section>
    );
  }

  return (
    <section
      id="s-entrainer"
      aria-label="Quiz de la notion"
      className="scroll-mt-20 space-y-4 print:hidden"
    >
      <QuizPlayer title={`Tester — ${ficheTitle}`} questions={series} />
      <div className="flex flex-wrap gap-3">
        {pool.length > drawCount ? (
          <Button variant="outline" onClick={() => setSeries(drawSeries(pool, seriesSize))}>
            Nouvelle série
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => setSeries(null)}>
          Fermer le quiz
        </Button>
      </div>
    </section>
  );
}
