"use client";

import * as React from "react";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizPlayer, type PlayerQuestion } from "@/features/quiz/quiz-player";
import type { BiaPlayerQuestion } from "@/lib/bia/schema";

/**
 * Quiz thématique d'une matière BIA — le vivier complet est fourni par le
 * serveur ; le tirage de la série se fait au clic (jamais au rendu, pour
 * éviter tout écart d'hydratation), donc chaque série est différente.
 */

interface MatiereQuizProps {
  matiereName: string;
  pool: BiaPlayerQuestion[];
  seriesSize?: number;
}

function drawSeries(pool: BiaPlayerQuestion[], size: number): PlayerQuestion[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(size, shuffled.length)).map((question) => ({
    id: question.id,
    theme: question.theme,
    difficulty: question.difficulty,
    statement: question.statement,
    choices: question.choices,
    correctChoices: question.correctChoices,
    explanation: question.explanation,
    furtherReading: question.furtherReading,
  }));
}

export function MatiereQuiz({ matiereName, pool, seriesSize = 10 }: MatiereQuizProps) {
  const [series, setSeries] = React.useState<PlayerQuestion[] | null>(null);

  if (pool.length === 0) {
    return null;
  }

  if (!series) {
    return (
      <div className="bg-card space-y-3 rounded-xl border p-6">
        <h3 className="font-semibold">Quiz thématique</h3>
        <p className="text-muted-foreground text-sm">
          Une série de {Math.min(seriesSize, pool.length)} questions tirées des {pool.length}{" "}
          questions de la matière — correction immédiate, renvoi vers les fiches.
        </p>
        <Button onClick={() => setSeries(drawSeries(pool, seriesSize))}>
          <PlayIcon aria-hidden className="size-4" />
          Lancer une série
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <QuizPlayer title={`Quiz — ${matiereName}`} questions={series} />
      <Button variant="outline" onClick={() => setSeries(drawSeries(pool, seriesSize))}>
        Nouvelle série
      </Button>
    </div>
  );
}
