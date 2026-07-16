"use client";

import * as React from "react";
import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizPlayer, type PlayerQuestion } from "@/features/quiz/quiz-player";
import { InteractionSlot } from "@/features/interactions/interaction-slot";
import {
  COURSE_STATUS_LABELS,
  DEFAULT_COURSE_PROGRESS_CONFIG,
  deriveCourseStatus,
  type CourseStatus,
} from "@/lib/progression/cours";

/**
 * Expérience interactive d'un cours (docs/editorial/cours.md). Porte la
 * PROGRESSION CANONIQUE (clé `cours:<id>`, un seul identifiant quel que soit
 * le parcours d'entrée), l'interaction et le quiz. Le statut est DÉRIVÉ des
 * signaux (étapes obligatoires consultées, quiz réussi) — jamais un simple
 * bouton « terminé ». Stockage local ; la forme est prête pour Supabase.
 */
export interface CourseStepView {
  index: number;
  kind: "fiche" | "interaction" | "exercice" | "quiz" | "revision";
  title: string;
  obligatoire: boolean;
}

interface StoredProgress {
  opened: boolean;
  consulted: number[];
  quizDone: boolean;
  quizScore: number;
}

interface CourseExperienceProps {
  courseId: string;
  steps: CourseStepView[];
  interactionIds: string[];
  quizPool: PlayerQuestion[];
}

const EMPTY: StoredProgress = { opened: false, consulted: [], quizDone: false, quizScore: 0 };

function storageKey(courseId: string): string {
  return `cours:${courseId}`;
}

export function CourseExperience({
  courseId,
  steps,
  interactionIds,
  quizPool,
}: CourseExperienceProps) {
  const [progress, setProgress] = React.useState<StoredProgress>(EMPTY);
  const [hydrated, setHydrated] = React.useState(false);

  // Chargement + marquage « ouvert » (découverte) au montage. La lecture du
  // stockage est différée d'une frame (comme l'exam-player) : le HTML serveur
  // reste identique au premier rendu client, pas d'écart d'hydratation.
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      let stored: StoredProgress = { ...EMPTY, opened: true };
      try {
        const raw = window.localStorage.getItem(storageKey(courseId));
        if (raw) {
          stored = { ...stored, ...(JSON.parse(raw) as StoredProgress), opened: true };
        }
      } catch {
        // stockage indisponible : on reste en mémoire
      }
      setProgress(stored);
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, [courseId]);

  const persist = React.useCallback(
    (next: StoredProgress) => {
      setProgress(next);
      try {
        window.localStorage.setItem(storageKey(courseId), JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [courseId]
  );

  const markConsulted = React.useCallback(
    (index: number) => {
      setProgress((prev) => {
        if (prev.consulted.includes(index)) {
          return prev;
        }
        const next = { ...prev, opened: true, consulted: [...prev.consulted, index] };
        try {
          window.localStorage.setItem(storageKey(courseId), JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [courseId]
  );

  const interactionStep = steps.find((s) => s.kind === "interaction");
  const quizStep = steps.find((s) => s.kind === "quiz");
  const obligatory = steps.filter((s) => s.obligatoire);

  const status: CourseStatus = deriveCourseStatus({
    opened: progress.opened,
    consultedStepIndexes: progress.consulted,
    obligatoryStepIndexes: obligatory.map((s) => s.index),
    quizDone: progress.quizDone,
    quizScore: progress.quizScore,
    activeCriticalErrors: 0,
  });

  function onQuizFinished(ratePercent: number) {
    const next: StoredProgress = {
      ...progress,
      opened: true,
      quizDone: true,
      quizScore: ratePercent / 100,
      consulted:
        quizStep && !progress.consulted.includes(quizStep.index)
          ? [...progress.consulted, quizStep.index]
          : progress.consulted,
    };
    persist(next);
  }

  function resetProgress() {
    persist({ ...EMPTY, opened: true });
  }

  const seuilPct = Math.round(DEFAULT_COURSE_PROGRESS_CONFIG.quizSeuil * 100);

  return (
    <div className="space-y-8">
      {/* En-tête de progression */}
      <div className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Ma progression</span>
          <Badge variant={status === "maitrise" ? "default" : "secondary"}>
            {COURSE_STATUS_LABELS[status]}
          </Badge>
          <span className="sr-only" aria-live="polite">
            Statut du cours : {COURSE_STATUS_LABELS[status]}
          </span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={resetProgress}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Réinitialiser ma progression
        </Button>
      </div>

      {/* Étapes obligatoires — case à cocher accessible */}
      <section aria-label="Étapes du cours" className="space-y-2">
        <h2 className="text-xl font-semibold">Étapes à valider</h2>
        <ul className="space-y-2">
          {obligatory.map((step) => {
            const done = progress.consulted.includes(step.index);
            const auto = step.kind === "interaction" || step.kind === "quiz";
            return (
              <li key={step.index} className="flex items-center gap-2">
                {auto ? (
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    {done ? (
                      <CheckCircle2 className="text-success size-5" aria-hidden="true" />
                    ) : (
                      <Circle className="size-5" aria-hidden="true" />
                    )}
                    {step.title}
                    {done ? <span className="sr-only"> (fait)</span> : null}
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-pressed={done}
                    onClick={() => (done ? undefined : markConsulted(step.index))}
                    className="hover:text-foreground text-muted-foreground flex items-center gap-2 text-left text-sm"
                  >
                    {done ? (
                      <CheckCircle2 className="text-success size-5" aria-hidden="true" />
                    ) : (
                      <Circle className="size-5" aria-hidden="true" />
                    )}
                    <span>
                      {step.title}
                      {done ? "" : " — marquer comme étudié"}
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {hydrated ? null : <p className="sr-only">Chargement de la progression…</p>}
      </section>

      {/* Interaction */}
      {interactionStep && interactionIds.length > 0 ? (
        <section aria-label="Interaction" className="space-y-3">
          <h2 className="text-xl font-semibold">Manipuler</h2>
          {interactionIds.map((id) => (
            <InteractionSlot
              key={id}
              id={id}
              onInteract={() => markConsulted(interactionStep.index)}
            />
          ))}
        </section>
      ) : null}

      {/* Quiz du cours */}
      {quizStep && quizPool.length > 0 ? (
        <section aria-label="Quiz du cours" className="space-y-3">
          <h2 className="text-xl font-semibold">Se tester</h2>
          <p className="text-muted-foreground text-sm">
            Réussissez au moins {seuilPct} % pour atteindre le statut « maîtrisé ».
          </p>
          <QuizPlayer title="Quiz du cours" questions={quizPool} onFinished={onQuizFinished} />
        </section>
      ) : null}
    </div>
  );
}
