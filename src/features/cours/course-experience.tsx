"use client";

import * as React from "react";
import { PlancheBouton } from "@/components/planche/planche-commandes";
import { PlancheSection } from "@/components/planche/planche";
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
 *
 * Lot M4 — habillage PLANCHE. Ce composant n'a qu'un seul point de montage,
 * la route `/cours/[slug]` : il est donc réécrit directement, sans prop de
 * variante ni branche conditionnelle. **La logique est intacte** — clé de
 * stockage, dérivation du statut, signaux, seuil de quiz.
 *
 * `QuizPlayer` reste **hors périmètre** : il est partagé avec `/reviser`,
 * `/bia/[matiere]` et la prévisualisation du design-system. Il est déposé
 * dans un bloc `.pl-hote`, qui lui donne un titre, des filets et un rythme
 * PLANCHE **sans cibler un seul de ses éléments internes** — la règle
 * `.pl-corps p:not(.pl-hote *)` arrête même la typographie du corps à sa
 * frontière. La couture est visible et assumée jusqu'au lot du Banc.
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
    <>
      {/* Relevé de progression — un rang de cotes, pas une carte. */}
      <div className="pl-releve">
        <span className="pl-releve-l">Ma progression</span>
        <span className="pl-releve-v" data-etat={status}>
          {COURSE_STATUS_LABELS[status]}
        </span>
        <span className="sr-only" aria-live="polite">
          Statut du cours : {COURSE_STATUS_LABELS[status]}
        </span>
        <PlancheBouton variante="fantome" onClick={resetProgress}>
          Réinitialiser ma progression
        </PlancheBouton>
      </div>

      {/* Étapes obligatoires — case à cocher accessible */}
      <section aria-label="Étapes du cours">
        <PlancheSection id="etapes">Étapes à valider</PlancheSection>
        <ul className="pl-etapes">
          {obligatory.map((step) => {
            const done = progress.consulted.includes(step.index);
            const auto = step.kind === "interaction" || step.kind === "quiz";
            return (
              <li key={step.index} data-fait={done ? "oui" : "non"}>
                {auto ? (
                  <span className="pl-etape">
                    <span className="pl-etape-m" aria-hidden="true" />
                    {step.title}
                    {done ? <span className="sr-only"> (fait)</span> : null}
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-pressed={done}
                    onClick={() => (done ? undefined : markConsulted(step.index))}
                    className="pl-etape"
                  >
                    <span className="pl-etape-m" aria-hidden="true" />
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
        <section aria-label="Interaction">
          <PlancheSection id="manipuler">Manipuler</PlancheSection>
          {interactionIds.map((id) => (
            <InteractionSlot
              key={id}
              id={id}
              onInteract={() => markConsulted(interactionStep.index)}
            />
          ))}
        </section>
      ) : null}

      {/* Quiz du cours — bloc hôte : cadre PLANCHE, intérieur non touché. */}
      {quizStep && quizPool.length > 0 ? (
        <section aria-label="Quiz du cours">
          <PlancheSection id="se-tester">Se tester</PlancheSection>
          <p className="pl-manip-c">
            Réussissez au moins {seuilPct} % pour atteindre le statut « maîtrisé ».
          </p>
          <div className="pl-hote">
            {/*
              Registre arbitré au lot F12 : **documentaire**. Le quiz du cours
              est la section « Se tester » d'une leçon — il porte sur ce qui
              vient d'être lu, dépend du contexte de la page, et n'a aucune
              destination propre. Il garde donc l'habillage PLANCHE de son hôte
              et tient le contrat d'accessibilité du Banc, ce qui est
              exactement ce que `documentaire` désigne. C'est la couture
              annoncée plus haut : elle n'est plus « assumée jusqu'au lot du
              Banc », elle est classée.
            */}
            <QuizPlayer
              title="Quiz du cours"
              questions={quizPool}
              variant="documentaire"
              onFinished={onQuizFinished}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
