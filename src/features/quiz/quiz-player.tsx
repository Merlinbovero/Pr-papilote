"use client";

import * as React from "react";
import { CircleCheckIcon, CircleXIcon, ClockIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/lib/content/content-schemas";
import { Annonce, finAnnonce, verdictAnnonce } from "@/components/a11y/annonce";
import { deplacerFocus } from "@/lib/a11y/focus-transition";

/**
 * Lecteur de quiz — question, réponses, correction pédagogique,
 * chronomètre, progression, restitution. Piloté par un modèle de vue
 * neutre : il ne dépend ni de la banque, ni du format de fichier, ni
 * d'un mode particulier (docs/editorial/moteur-pedagogique.md).
 */

export interface PlayerChoice {
  label: string;
  /** Pourquoi ce choix est faux (affiché en correction, si fourni). */
  note?: string;
}

export interface PlayerQuestion {
  id: string;
  theme: string;
  difficulty: number;
  statement: string;
  choices: PlayerChoice[];
  correctChoices: number[];
  explanation: string;
  /** Fiches à approfondir (relation « évalue »). */
  furtherReading?: { label: string; href: string }[];
}

interface QuizPlayerProps {
  title: string;
  questions: PlayerQuestion[];
  /** Secondes par question (chronomètre facultatif). */
  timePerQuestionSeconds?: number;
  /** Rien n'est enregistré tant que ce n'est pas branché (sans compte). */
  persisted?: boolean;
  /** Appelé une fois la série terminée, avec le score en pourcentage (0–100). */
  onFinished?: (ratePercent: number) => void;
  /** Appelé à chaque validation, avec l'identifiant de question et sa justesse. */
  onAnswered?: (questionId: string, isCorrect: boolean) => void;
}

type Phase = "answering" | "correction" | "finished";

export function QuizPlayer({
  title,
  questions,
  timePerQuestionSeconds,
  persisted = false,
  onFinished,
  onAnswered,
}: QuizPlayerProps) {
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("answering");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [results, setResults] = React.useState<boolean[]>([]);
  const [remaining, setRemaining] = React.useState(timePerQuestionSeconds ?? 0);
  const finishedNotified = React.useRef(false);

  // Annonces et focus — lot F1a. La région porte ce que le focus ne dit pas ;
  // le focus porte l'intitulé de l'écran. Aucun des deux ne répète l'autre.
  const [annonce, setAnnonce] = React.useState("");
  const zoneQuestion = React.useRef<HTMLDivElement>(null);
  const zoneCorrection = React.useRef<HTMLDivElement>(null);
  const zoneResultat = React.useRef<HTMLDivElement>(null);
  /**
   * L'élément qui a DÉCLENCHÉ la transition — le bouton actionné, pas le
   * dernier élément focalisé : sans cette nuance, la règle de non-vol du
   * focus (voir `focus-transition.ts`) n'écarterait jamais rien.
   */
  const declencheur = React.useRef<Element | null>(null);
  const noterDeclencheur = (evenement: { currentTarget: Element }) => {
    declencheur.current = evenement.currentTarget;
  };
  /** Le premier rendu n'est pas une transition : on ne vole pas le focus. */
  const premierRendu = React.useRef(true);

  React.useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    const cible =
      phase === "finished"
        ? zoneResultat.current
        : phase === "correction"
          ? zoneCorrection.current
          : zoneQuestion.current;
    deplacerFocus(cible, { declencheur: declencheur.current });
  }, [phase, index]);

  // Notifie la fin de série une seule fois (progression de cours, etc.).
  React.useEffect(() => {
    if (phase === "finished" && onFinished && !finishedNotified.current) {
      finishedNotified.current = true;
      const rate = questions.length
        ? Math.round((results.filter(Boolean).length / questions.length) * 100)
        : 0;
      onFinished(rate);
    }
  }, [phase, onFinished, questions.length, results]);

  const question = questions[index];
  const isMultiple = question ? question.correctChoices.length > 1 : false;
  /** Questions achevées : la question courante ne l'est qu'une fois corrigée. */
  const terminees = index + (phase === "correction" ? 1 : 0);

  const validate = React.useCallback(() => {
    if (phase !== "answering" || !question) {
      return;
    }
    const expected = new Set(question.correctChoices);
    const correct =
      selected.length === expected.size && selected.every((choice) => expected.has(choice));
    setResults((previous) => [...previous, correct]);
    onAnswered?.(question.id, correct);
    // La bonne réponse n'est dictée que si elle est unique et courte : sur un
    // choix multiple, l'énumérer serait plus confus que de renvoyer à l'écran.
    const bonneReponse =
      question.correctChoices.length === 1
        ? question.choices[question.correctChoices[0]]?.label
        : undefined;
    setAnnonce(verdictAnnonce(correct, bonneReponse));
    setPhase("correction");
  }, [phase, question, selected, onAnswered]);

  // Chronomètre : décompte pendant la phase de réponse ; à zéro, la
  // question est validée en l'état. La remise à la durée pleine se fait
  // au passage à la question suivante (jamais un setState dans l'effet).
  React.useEffect(() => {
    if (!timePerQuestionSeconds || phase !== "answering") {
      return;
    }
    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(id);
          validate();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [index, phase, timePerQuestionSeconds, validate]);

  if (!question) {
    return null;
  }

  const toggle = (choiceIndex: number) => {
    if (phase !== "answering") {
      return;
    }
    setSelected((previous) => {
      if (isMultiple) {
        return previous.includes(choiceIndex)
          ? previous.filter((value) => value !== choiceIndex)
          : [...previous, choiceIndex];
      }
      return [choiceIndex];
    });
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setAnnonce(finAnnonce(results.filter(Boolean).length, questions.length));
      setPhase("finished");
      return;
    }
    setIndex((value) => value + 1);
    setSelected([]);
    setRemaining(timePerQuestionSeconds ?? 0);
    // Le focus va lire « Question N sur T » : le répéter ici ferait double
    // lecture. La région se tait donc au changement de question.
    setAnnonce("");
    setPhase("answering");
  };

  if (phase === "finished") {
    const score = results.filter(Boolean).length;
    const rate = Math.round((score / questions.length) * 100);
    return (
      <section aria-label="Résultat du quiz" className="space-y-6">
        <Annonce message={annonce} />
        <div
          ref={zoneResultat}
          tabIndex={-1}
          role="group"
          aria-label="Résultats"
          className="bg-card space-y-2 rounded-xl border p-6 text-center outline-none"
        >
          <p className="text-muted-foreground text-sm tracking-wide uppercase">Résultat</p>
          <p className="text-4xl font-bold tracking-tight">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground">{rate} % de bonnes réponses</p>
        </div>
        {!persisted ? (
          <Alert>
            <AlertTitle>Connectez-vous pour conserver vos résultats</AlertTitle>
            <AlertDescription>
              Vos réponses alimenteront alors votre carnet d&apos;erreurs et vos statistiques de
              progression.
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          onClick={() => {
            setIndex(0);
            setSelected([]);
            setResults([]);
            setRemaining(timePerQuestionSeconds ?? 0);
            setPhase("answering");
          }}
        >
          Recommencer
        </Button>
      </section>
    );
  }

  return (
    <section aria-label={title} className="space-y-6">
      <Annonce message={annonce} />
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            Question {index + 1} / {questions.length}
          </span>
          <span className="flex items-center gap-3">
            <Badge variant="outline" className="font-normal">
              {DIFFICULTY_LABELS[question.difficulty] ?? `Niveau ${question.difficulty}`}
            </Badge>
            {timePerQuestionSeconds && phase === "answering" ? (
              <span className="flex items-center gap-1 tabular-nums" aria-live="off">
                <ClockIcon aria-hidden className="size-4" />
                {remaining}s
              </span>
            ) : null}
          </span>
        </div>
        <Progress
          aria-label="Progression du quiz"
          // La barre compte les questions ACHEVÉES, pas la position courante :
          // sur la question 3 encore sans réponse, deux sont terminées. Le
          // libellé suit donc l'avancement, comme la valeur.
          aria-valuetext={`${terminees} question${terminees > 1 ? "s" : ""} terminée${
            terminees > 1 ? "s" : ""
          } sur ${questions.length}`}
          value={(terminees / questions.length) * 100}
        />
      </div>

      {/*
        Cible de focus au changement de question. Le nom accessible dit la
        POSITION — « Question 3 sur 10 » — que la barre de progression, elle,
        n'exprime pas : elle mesure l'avancement.
      */}
      <div
        ref={zoneQuestion}
        tabIndex={-1}
        role="group"
        aria-label={`Question ${index + 1} sur ${questions.length}`}
        className="space-y-6 outline-none"
      >
        <h2 className="text-xl font-semibold">{question.statement}</h2>
        {isMultiple && phase === "answering" ? (
          <p className="text-muted-foreground text-sm">Plusieurs réponses possibles.</p>
        ) : null}

        <ul className="space-y-2" role="list">
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = selected.includes(choiceIndex);
            const isRight = question.correctChoices.includes(choiceIndex);
            const showState = phase === "correction";
            return (
              <li key={choiceIndex}>
                <button
                  type="button"
                  onClick={() => toggle(choiceIndex)}
                  aria-pressed={isSelected}
                  disabled={phase === "correction"}
                  className={cn(
                    "focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    !showState && isSelected && "border-primary bg-accent",
                    !showState && !isSelected && "hover:bg-accent/50",
                    showState && isRight && "border-success bg-success/10",
                    showState && isSelected && !isRight && "border-destructive bg-destructive/10"
                  )}
                >
                  {showState && isRight ? (
                    <CircleCheckIcon aria-hidden className="text-success size-4 shrink-0" />
                  ) : showState && isSelected && !isRight ? (
                    <CircleXIcon aria-hidden className="text-destructive size-4 shrink-0" />
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0 rounded-full border",
                        isSelected && "border-primary bg-primary"
                      )}
                    />
                  )}
                  <span className="flex-1">{choice.label}</span>
                </button>
                {showState && choice.note && (isSelected || isRight) ? (
                  <p className="text-muted-foreground mt-1 pl-7 text-sm">{choice.note}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {phase === "answering" ? (
        <Button
          onClick={(evenement) => {
            noterDeclencheur(evenement);
            validate();
          }}
          disabled={selected.length === 0}
        >
          Valider
        </Button>
      ) : (
        <div className="space-y-4">
          <div
            ref={zoneCorrection}
            tabIndex={-1}
            role="group"
            aria-label="Correction"
            className="bg-card space-y-2 rounded-xl border p-4 outline-none"
          >
            <p className="font-medium">
              {results[results.length - 1] ? "Bonne réponse" : "Réponse incorrecte"}
            </p>
            <p className="text-sm leading-7">{question.explanation}</p>
            {question.furtherReading && question.furtherReading.length > 0 ? (
              <p className="text-muted-foreground text-sm">
                Pour approfondir :{" "}
                {question.furtherReading.map((fiche, ficheIndex) => (
                  <React.Fragment key={fiche.href}>
                    {ficheIndex > 0 ? ", " : ""}
                    <a
                      href={fiche.href}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {fiche.label}
                    </a>
                  </React.Fragment>
                ))}
              </p>
            ) : null}
          </div>
          <Button
            onClick={(evenement) => {
              noterDeclencheur(evenement);
              next();
            }}
          >
            {index + 1 >= questions.length ? "Voir le résultat" : "Question suivante"}
          </Button>
        </div>
      )}
    </section>
  );
}
