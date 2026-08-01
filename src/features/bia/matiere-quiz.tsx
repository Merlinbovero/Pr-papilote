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
  /*
    Le tirage porte un numéro, et ce numéro est la CLÉ du lecteur.

    `QuizPlayer` garde sa phase, son index, sa sélection et ses résultats dans
    son propre état. Remplacer la prop `questions` ne les réinitialise pas :
    React réutilise l'instance, et le lecteur reste figé sur l'écran de score.
    « Nouvelle série » ne relançait donc rien une fois la série terminée —
    défaut relevé par la campagne de référence du lot F4, avant toute
    migration, et reproduit par un contrôle unitaire dédié.

    Changer la clé force le remontage : c'est le moyen prévu par React pour
    réinitialiser un état, et il ne touche pas au moteur partagé par les
    routes déjà migrées.
  */
  const [tirage, setTirage] = React.useState(0);

  const tirer = React.useCallback(() => {
    setSeries(drawSeries(pool, seriesSize));
    setTirage((n) => n + 1);
  }, [pool, seriesSize]);

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
        <Button onClick={tirer}>
          <PlayIcon aria-hidden className="size-4" />
          Lancer une série
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <QuizPlayer
        key={tirage}
        title={`Quiz — ${matiereName}`}
        questions={series}
        /*
          Registre DOCUMENTAIRE, et non `banc` : ce quiz est la prolongation
          immédiate de la lecture, subordonné au document, sans destination
          autonome. Il garde donc l'apparence de son hôte — mais il tient le
          contrat d'accessibilité du Banc, DT-002 comprise.
        */
        variant="documentaire"
        /*
          Le contrat de `focusAuMontage` le demande explicitement : au remontage
          voulu par l'utilisateur, le focus va à la première question, pas au
          bouton qui vient d'être actionné. Faux au premier tirage, où le
          lecteur n'a pas encore été demandé.
        */
        focusAuMontage={tirage > 1}
      />
      <Button variant="outline" onClick={tirer}>
        Nouvelle série
      </Button>
    </div>
  );
}
