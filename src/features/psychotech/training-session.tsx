"use client";

import * as React from "react";
import Link from "next/link";
import { PlayIcon, TargetIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Chronometre } from "@/features/banc/chronometre";
import { LienApprofondir } from "@/features/banc/lien-approfondir";
import { ModeSeance } from "@/features/banc/mode-seance";
import { ReponseBanc } from "@/features/banc/etat-reponse";
import type { EtatChrono } from "@/lib/design/banc-tokens";
import { cn } from "@/lib/utils";
import { FAMILY_INFO } from "@/lib/psychotech/generators";
import { composeSession, scoreSession, SESSION_SIZES } from "@/lib/psychotech/session";
import { PsyInstrumentView } from "@/features/psychotech/psy-instrument";
import { DominoSeries, DominoTile } from "@/features/psychotech/domino-tile";
import { MatrixCellView, PsyMatrixGrid } from "@/features/psychotech/psy-matrix";
import {
  PSY_FAMILIES,
  type PsyAnswerEvent,
  type PsyFamily,
  type PsyQuestion,
  type PsySessionScore,
} from "@/lib/psychotech/types";

/**
 * Session d'entraînement psychotechnique — configuration (taille,
 * familles), consignes standardisées, chronomètre PAR QUESTION, phase
 * d'exposition (mémoire), correction immédiate avec méthode, score final
 * (précision, vitesse, familles fragiles) et historique local.
 * Le moteur (génération, notation) vit dans src/lib/psychotech.
 */

const HISTORY_KEY = "prepapilote.psychotech.history";

interface SessionHistoryEntry {
  finishedAt: string;
  size: number;
  precision: number;
  avgMs: number;
  aRetravailler: PsyFamily[];
}

function readHistory(): SessionHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SessionHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: SessionHistoryEntry[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Stockage indisponible — la session reste jouable.
  }
}

type Phase = "config" | "consignes" | "exposure" | "answering" | "feedback" | "done";

/**
 * Seuils du chronomètre — décidés **par le moteur**, jamais par le composant.
 *
 * L'échelle est ici celle d'une QUESTION, pas d'une épreuve : les limites de
 * temps vont de quinze à quarante-cinq secondes selon la famille. Dix secondes
 * méritent donc un signal, cinq en méritent un autre. Le rendu historique
 * n'avait qu'un seuil, à 5 s ; il est conservé et complété.
 */
const CHRONO_ATTENTION = 10;
const CHRONO_CRITIQUE = 5;

function etatChrono(restant: number): EtatChrono {
  if (restant <= 0) return "expired";
  if (restant <= CHRONO_CRITIQUE) return "critical";
  if (restant <= CHRONO_ATTENTION) return "warning";
  return "normal";
}

export interface TrainingSessionProps {
  /**
   * En-tête de page, confié à la séance pour qu'il **se replie au lancement**
   * — même contrat qu'aux routes migrées aux lots F2, F3 et F5.
   */
  entete?: React.ReactNode;
}

export function TrainingSession({ entete }: TrainingSessionProps = {}) {
  const [phase, setPhase] = React.useState<Phase>("config");
  const [selectedFamilies, setSelectedFamilies] = React.useState<PsyFamily[]>([...PSY_FAMILIES]);
  const [size, setSize] = React.useState<number>(SESSION_SIZES.standard);
  const [questions, setQuestions] = React.useState<PsyQuestion[]>([]);
  const [index, setIndex] = React.useState(0);
  const [events, setEvents] = React.useState<PsyAnswerEvent[]>([]);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [remaining, setRemaining] = React.useState(0);
  const [questionStart, setQuestionStart] = React.useState(0);
  const [score, setScore] = React.useState<PsySessionScore | null>(null);
  const [history, setHistory] = React.useState<SessionHistoryEntry[]>([]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(readHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  const question = questions[index];

  const launch = (families: PsyFamily[], sessionSize: number) => {
    const session = composeSession({
      families,
      size: sessionSize,
      seed: Date.now() % 2147483647,
    });
    setQuestions(session);
    setIndex(0);
    setEvents([]);
    setSelected(null);
    setScore(null);
    setPhase("consignes");
  };

  const beginQuestion = React.useCallback((q: PsyQuestion) => {
    if (q.exposure) {
      setPhase("exposure");
      setRemaining(q.exposure.seconds);
    } else {
      setPhase("answering");
      setRemaining(q.timeLimitSeconds);
      setQuestionStart(Date.now());
    }
  }, []);

  const recordAnswer = React.useCallback(
    (choiceIndex: number | null) => {
      if (!question) {
        return;
      }
      const event: PsyAnswerEvent = {
        questionId: question.id,
        family: question.family,
        correct: choiceIndex === null ? undefined : choiceIndex === question.correctIndex,
        elapsedMs: Date.now() - questionStart,
      };
      setEvents((previous) => [...previous, event]);
      setSelected(choiceIndex);
      setPhase("feedback");
    },
    [question, questionStart]
  );

  // Chronomètres — exposition (mémoire) puis réponse.
  React.useEffect(() => {
    if (phase !== "exposure" && phase !== "answering") {
      return;
    }
    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(id);
          if (phase === "exposure") {
            setPhase("answering");
            setQuestionStart(Date.now());
            return question?.timeLimitSeconds ?? 0;
          }
          recordAnswer(null);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, question, recordAnswer]);

  const next = () => {
    if (index + 1 >= questions.length) {
      const finalScore = scoreSession(events);
      setScore(finalScore);
      const entry: SessionHistoryEntry = {
        finishedAt: new Date().toISOString(),
        size: questions.length,
        precision: finalScore.precision,
        avgMs: finalScore.avgMs,
        aRetravailler: finalScore.aRetravailler,
      };
      const nextHistory = [entry, ...history].slice(0, 20);
      writeHistory(nextHistory);
      setHistory(nextHistory);
      setPhase("done");
      return;
    }
    const upcoming = questions[index + 1];
    setIndex(index + 1);
    setSelected(null);
    beginQuestion(upcoming);
  };

  // -------------------------------------------------------------------------
  // Écrans
  // -------------------------------------------------------------------------

  const lastWeak = history[0]?.aRetravailler ?? [];

  /*
    Les DEUX écrans d'avant-séance sont calculés en toutes phases.

    `ModeSeance` ne démonte pas l'introduction, il la masque : « Revoir les
    consignes » doit pouvoir la ramener sans reconstruire quoi que ce soit.
    Les rendre conditionnellement, comme le faisait le rendu historique par
    retours anticipés, les ferait disparaître du document au lancement — et le
    rappel n'aurait plus rien à rappeler.
  */
  const ecranConfig = (
    <section aria-label="Configurer la session" className="space-y-6">
      <div className="bg-card space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Choisir la session</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => launch([...PSY_FAMILIES], SESSION_SIZES.courte)}>
            <PlayIcon aria-hidden className="size-4" />
            Courte — 10 questions
          </Button>
          <Button onClick={() => launch([...PSY_FAMILIES], SESSION_SIZES.standard)}>
            <PlayIcon aria-hidden className="size-4" />
            Standard — 20 questions
          </Button>
          <Button onClick={() => launch([...PSY_FAMILIES], SESSION_SIZES.longue)}>
            <PlayIcon aria-hidden className="size-4" />
            Longue — 40 questions
          </Button>
          {lastWeak.length > 0 ? (
            <Button variant="secondary" onClick={() => launch(lastWeak, SESSION_SIZES.standard)}>
              <TargetIcon aria-hidden className="size-4" />
              Ciblée — {lastWeak.map((f) => FAMILY_INFO[f].name).join(", ")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="bg-card space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Session personnalisée</h2>
        <p className="text-muted-foreground text-sm">
          Choisissez vos familles — la difficulté monte progressivement dans la session.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PSY_FAMILIES.map((family) => {
            const active = selectedFamilies.includes(family);
            return (
              <li key={family}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setSelectedFamilies((previous) =>
                      active ? previous.filter((f) => f !== family) : [...previous, family]
                    )
                  }
                  className={cn(
                    "focus-visible:ring-ring w-full rounded-lg border p-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active ? "border-primary bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <span className="font-medium">{FAMILY_INFO[family].name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm" htmlFor="session-size">
            Nombre de questions
          </label>
          <select
            id="session-size"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="bg-background focus-visible:ring-ring rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            {[10, 15, 20, 30, 40].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button
            disabled={selectedFamilies.length === 0}
            onClick={() => launch(selectedFamilies, size)}
          >
            Lancer la session personnalisée
          </Button>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="bg-card space-y-3 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Vos dernières sessions</h2>
          <ul className="space-y-1 text-sm">
            {history.slice(0, 5).map((entry) => (
              <li key={entry.finishedAt} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {new Date(entry.finishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {entry.size} questions
                </span>
                <span className="tabular-nums">
                  {Math.round(entry.precision * 100)} % · {(entry.avgMs / 1000).toFixed(1)} s/q
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">
            Historique conservé sur cet appareil uniquement.
          </p>
        </div>
      ) : null}
    </section>
  );

  const familiesInSession = [...new Set(questions.map((q) => q.family))];
  const ecranConsignes = (
    <section aria-label="Consignes" className="space-y-4">
      <div className="bg-card space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Consignes — {questions.length} questions</h2>
        <ul className="space-y-3 text-sm leading-6">
          {familiesInSession.map((family) => (
            <li key={family}>
              <span className="font-medium">{FAMILY_INFO[family].name}</span> —{" "}
              {FAMILY_INFO[family].consigne}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-sm">
          Chaque question est chronométrée — à zéro, elle compte sans réponse. La difficulté monte
          au fil de la session.
        </p>
        {phase === "consignes" ? (
          <Button
            size="lg"
            onClick={() => {
              beginQuestion(questions[0]);
            }}
          >
            <PlayIcon aria-hidden className="size-4" />
            Démarrer
          </Button>
        ) : null}
      </div>
    </section>
  );

  const ecranDone = !score ? null : (
    <section aria-label="Résultat de la session" className="space-y-6">
      <div className="banc-stimulus space-y-2 text-center">
        <p className="text-muted-foreground text-sm tracking-wide uppercase">Session terminée</p>
        <p className="text-4xl font-bold tracking-tight">
          {score.correct} / {score.asked}
        </p>
        <p className="text-muted-foreground">
          Précision {Math.round(score.precision * 100)} % · vitesse moyenne{" "}
          {(score.avgMs / 1000).toFixed(1)} s/question · {score.asked - score.answered} sans réponse
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {score.parFamille.map((f) => (
          <div key={f.family} className="bg-card rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">{FAMILY_INFO[f.family].name}</p>
            <p className="text-2xl font-semibold tabular-nums">
              {f.correct}/{f.asked}
            </p>
            <p className="text-muted-foreground text-xs">
              {Math.round(f.precision * 100)} % · {(f.avgMs / 1000).toFixed(1)} s/q ·{" "}
              <Link
                href={FAMILY_INFO[f.family].ficheHref}
                className="text-primary underline-offset-4 hover:underline"
              >
                la méthode
              </Link>
            </p>
          </div>
        ))}
      </div>

      {score.aRetravailler.length > 0 ? (
        <div className="bg-card space-y-3 rounded-xl border p-6">
          <h2 className="font-semibold">À retravailler</h2>
          <p className="text-sm leading-6">
            {score.aRetravailler.map((f) => FAMILY_INFO[f].name).join(", ")} — précision sous 60 %.
            Relisez la fiche de méthode puis lancez une session ciblée.
          </p>
          <Button onClick={() => launch(score.aRetravailler, SESSION_SIZES.standard)}>
            <TargetIcon aria-hidden className="size-4" />
            Session ciblée
          </Button>
        </div>
      ) : null}

      <Button variant="outline" onClick={() => setPhase("config")}>
        Nouvelle session
      </Button>
    </section>
  );

  const ecranExposition = !question?.exposure ? null : (
    <section aria-label="Mémorisation" className="space-y-6">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          Question {index + 1} / {questions.length} · {FAMILY_INFO[question.family].name}
        </span>
        <Chronometre
          secondes={remaining}
          etat={etatChrono(remaining)}
          label="Temps de mémorisation"
          className="banc-chrono-cadre"
        />
      </div>
      <div className="banc-stimulus text-center" style={{ padding: "2rem" }}>
        <p className="mb-4 text-sm" style={{ color: "var(--bc-encre2)" }}>
          Mémorisez :
        </p>
        {question.exposure.lines.map((line) => (
          <p key={line} className="text-2xl font-semibold tracking-wide">
            {line}
          </p>
        ))}
      </div>
    </section>
  );

  const showFeedback = phase === "feedback";

  const ecranQuestion = !question ? null : (
    <section aria-label="Question en cours" className="space-y-6">
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            Question {index + 1} / {questions.length} · {FAMILY_INFO[question.family].name}
          </span>
          <span className="flex items-center gap-3">
            <Badge variant="outline" className="font-normal">
              Niveau {question.difficulty}
            </Badge>
            {phase === "answering" ? (
              <Chronometre
                secondes={remaining}
                etat={etatChrono(remaining)}
                label="Temps restant pour cette question"
                className="banc-chrono-cadre"
              />
            ) : null}
          </span>
        </div>
        {/*
          `index` compte les questions déjà passées — la courante n'est pas
          terminée. Le libellé dit donc l'avancement, pas la position.
        */}
        <Progress
          aria-label="Progression de la séance"
          aria-valuetext={`${index} question${index > 1 ? "s" : ""} terminée${
            index > 1 ? "s" : ""
          } sur ${questions.length}`}
          value={(index / questions.length) * 100}
        />
      </div>

      <div className="banc-stimulus space-y-5">
        <h2 className="banc-enonce text-xl font-semibold whitespace-pre-line">{question.prompt}</h2>
        {question.gridLines ? (
          <pre
            aria-label="Grille à analyser"
            className="banc-stimulus-graphique overflow-x-auto font-mono text-lg leading-8 tracking-widest"
            style={{
              backgroundColor: "var(--bc-fond3)",
              borderRadius: "var(--bc-rayon)",
              padding: "1rem",
            }}
          >
            {question.gridLines.join("\n")}
          </pre>
        ) : null}
        {question.instrument ? <PsyInstrumentView instrument={question.instrument} /> : null}
        {question.matrix ? <PsyMatrixGrid matrix={question.matrix} /> : null}
        {question.dominos ? (
          <div
            className="banc-stimulus-graphique"
            style={{
              backgroundColor: "var(--bc-fond3)",
              borderRadius: "var(--bc-rayon)",
              padding: "1rem",
            }}
          >
            <DominoSeries puzzle={question.dominos.puzzle} tileSize={42} />
          </div>
        ) : null}

        <ul className="flex flex-col" style={{ gap: "var(--bc-espace-reponse)" }} role="list">
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = selected === choiceIndex;
            const isRight = choiceIndex === question.correctIndex;
            return (
              <li key={choiceIndex}>
                <ReponseBanc
                  desactive={showFeedback}
                  selectionnee={isSelected}
                  etat={
                    !showFeedback ? undefined : isRight ? "juste" : isSelected ? "erreur" : "neutre"
                  }
                  onClick={() => recordAnswer(choiceIndex)}
                >
                  {question.matrix ? (
                    <span className="flex flex-1 items-center gap-3">
                      <MatrixCellView cell={question.matrix.options[choiceIndex]} />
                      <span className="font-mono text-sm" style={{ color: "var(--bc-encre2)" }}>
                        {choice}
                      </span>
                    </span>
                  ) : question.dominos ? (
                    <span className="flex flex-1 items-center gap-3">
                      <DominoTile domino={question.dominos.options[choiceIndex]} size={26} />
                      <span className="font-mono text-sm" style={{ color: "var(--bc-encre2)" }}>
                        {choice}
                      </span>
                    </span>
                  ) : (
                    <span className="flex-1 font-mono">{choice}</span>
                  )}
                </ReponseBanc>
              </li>
            );
          })}
        </ul>
      </div>

      {showFeedback ? (
        <div className="space-y-4">
          {/*
            Nommé « Correction », comme dans le lecteur de quiz : le Banc n'a
            qu'un vocabulaire, et c'est ce nom que le focus fait lire ailleurs.
            Il donne aussi aux contrôles une ancre précise — le verdict est
            désormais écrit deux fois, ici en toutes lettres et sur la réponse
            concernée, et une assertion non portée trouverait les deux.
          */}
          <div role="group" aria-label="Correction" className="banc-stimulus space-y-2">
            <p className="font-medium">
              {selected === null
                ? "Temps écoulé"
                : selected === question.correctIndex
                  ? "Bonne réponse"
                  : "Réponse incorrecte"}
            </p>
            <p className="banc-consigne text-sm leading-7">{question.method}</p>
            <p className="banc-consigne text-sm">
              <LienApprofondir href={FAMILY_INFO[question.family].ficheHref}>
                Revoir la méthode — {FAMILY_INFO[question.family].name}
              </LienApprofondir>
            </p>
          </div>
          <Button onClick={next}>
            {index + 1 >= questions.length ? "Voir le résultat" : "Question suivante"}
          </Button>
        </div>
      ) : null}
    </section>
  );

  /*
    Le mode séance est ici **contrôlé** : l'entraînement se lance en deux
    temps — choisir une session, puis lire les consignes des familles tirées —
    et aucun bouton unique ne peut résumer cet avant-séance. Les deux écrans
    sont donc l'introduction, repliée d'un coup au premier chronomètre.
  */
  const enSeance = phase !== "config" && phase !== "consignes";

  return (
    <ModeSeance
      enSeance={enSeance}
      labelSeance="Entraînement psychotechnique"
      onSortie={() => setPhase("config")}
      introduction={
        <div className="space-y-6">
          {entete}
          {phase === "config" ? ecranConfig : ecranConsignes}
        </div>
      }
    >
      {phase === "done" ? ecranDone : phase === "exposure" ? ecranExposition : ecranQuestion}
    </ModeSeance>
  );
}
