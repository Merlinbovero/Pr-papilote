"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FormeImage, usePreloadFormes } from "@/features/psychotech/forme-scene";
import {
  buildFormeSession,
  FORME_FORMATS,
  FORME_LEVEL_LIST,
  generateFormePuzzle,
  scoreFormeSession,
  type FormeFormatKey,
  type FormePuzzle,
} from "@/lib/psychotech/formes";
import { cn } from "@/lib/utils";

/**
 * Test des formes imbriquées — lecteur.
 *
 * Toute la génération et la notation vivent dans `src/lib/psychotech/formes.ts`
 * ; ce fichier ne fait que présenter et enregistrer les réponses. L'assemblage
 * n'est **pas manipulable** : c'est la projection mentale qui est évaluée, et
 * un score doit rester comparable à celui de l'épreuve. La rotation n'apparaît
 * qu'à la correction, où comprendre prime.
 */

type Phase = "intro" | "playing" | "done";

const OPTION_LABELS = ["A", "B", "C", "D"];

const HISTORY_KEY = "pp.formes.history.v1";
const HISTORY_LIMIT = 10;

interface HistoryEntry {
  date: string;
  format: FormeFormatKey;
  correct: number;
  total: number;
  training: boolean;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is HistoryEntry => typeof e === "object" && e !== null);
  } catch {
    return [];
  }
}

function saveHistory(entries: readonly HistoryEntry[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Stockage indisponible (navigation privée) : la session reste jouable.
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Un exemple figé, montré à l'accueil : on comprend l'épreuve en la voyant. */
const TUTORIAL_PUZZLE = generateFormePuzzle(31337, 1);

function FormesTutorial() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Comment ça marche</h2>
      <p className="text-muted-foreground max-w-prose text-sm">
        En haut, un <strong>assemblage</strong> de pièces enchevêtrées. En dessous, quatre jeux de
        pièces <strong>désassemblées</strong> : un seul a servi à le construire. Les autres
        contiennent une pièce de trop, de travers ou mal proportionnée — souvent une seule, et
        parfois un simple détail.
      </p>
      <div className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
          L’assemblage
        </p>
        <div className="mx-auto max-w-md">
          <FormeImage
            puzzle={TUTORIAL_PUZZLE}
            kind={{ mode: "assembly" }}
            alt="Exemple d’assemblage : trois pièces enchevêtrées."
          />
        </div>
        <p className="text-muted-foreground mt-3 mb-1.5 text-xs font-semibold tracking-wide uppercase">
          Le bon jeu de pièces
        </p>
        <div className="mx-auto max-w-md">
          <FormeImage
            puzzle={TUTORIAL_PUZZLE}
            kind={{ mode: "option", optionIndex: TUTORIAL_PUZZLE.answerIndex }}
            alt="Les mêmes trois pièces, séparées."
            className="ring-success/60 ring-2"
          />
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          La méthode qui marche : lire les <strong>contours</strong> — ruptures d’angle, concavités,
          entailles — puis éliminer, plutôt que chercher à confirmer.
        </p>
      </div>
    </section>
  );
}

export function FormesTest() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [format, setFormat] = React.useState<FormeFormatKey>("officiel");
  const [training, setTraining] = React.useState(false);
  const [puzzles, setPuzzles] = React.useState<FormePuzzle[]>([]);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [checked, setChecked] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const deadlineRef = React.useRef(0);

  usePreloadFormes();

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  const sessionRef = React.useRef<{
    puzzles: FormePuzzle[];
    answers: (number | null)[];
    format: FormeFormatKey;
    training: boolean;
  }>({ puzzles: [], answers: [], format: "officiel", training: false });

  React.useEffect(() => {
    sessionRef.current = { puzzles, answers, format, training };
  }, [puzzles, answers, format, training]);

  const finish = React.useCallback(() => {
    const {
      puzzles: played,
      answers: given,
      format: playedFormat,
      training: wasTraining,
    } = sessionRef.current;
    const score = scoreFormeSession(played, given);
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      format: playedFormat,
      correct: score.correct,
      total: score.total,
      training: wasTraining,
    };
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, HISTORY_LIMIT);
      saveHistory(next);
      return next;
    });
    setPhase("done");
  }, []);

  React.useEffect(() => {
    if (phase !== "playing" || training) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        finish();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, training, finish]);

  const start = React.useCallback((key: FormeFormatKey, isTraining: boolean) => {
    const session = buildFormeSession(Math.floor(Math.random() * 1_000_000_000), key);
    setFormat(key);
    setTraining(isTraining);
    setPuzzles(session);
    setAnswers(session.map(() => null));
    setIndex(0);
    setChecked(false);
    deadlineRef.current = Date.now() + FORME_FORMATS[key].durationSeconds * 1000;
    setRemaining(FORME_FORMATS[key].durationSeconds);
    setPhase("playing");
  }, []);

  const current = puzzles[index];
  const answer = answers[index] ?? null;

  function choose(optionIndex: number) {
    if (checked) return;
    setAnswers((previous) => previous.map((a, i) => (i === index ? optionIndex : a)));
    if (training) setChecked(true);
  }

  function goNext() {
    if (index + 1 >= puzzles.length) {
      finish();
      return;
    }
    setIndex(index + 1);
    setChecked(false);
  }

  // --- Intro ---------------------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <FormesTutorial />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Les trois niveaux</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {FORME_LEVEL_LIST.map((info) => (
              <div key={info.level} className="bg-card rounded-lg border p-4">
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Niveau {info.level}
                </p>
                <p className="mt-0.5 text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 text-sm">{info.hint}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Les niveaux s’enchaînent au fil de la session, par tiers — comme à l’épreuve, où la
            difficulté monte de la première à la dernière question.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Lancer une session</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(FORME_FORMATS).map((info) => (
              <div key={info.key} className="bg-card flex flex-col rounded-lg border p-4">
                <p className="text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 flex-1 text-sm">{info.hint}</p>
                <p className="text-muted-foreground mt-2 text-sm tabular-nums">
                  {info.size} assemblages · {formatDuration(info.durationSeconds)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => start(info.key, false)}>
                    Lancer le test
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => start(info.key, true)}>
                    Entraînement
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            En <strong>mode entraînement</strong>, pas de chronomètre : la réponse est commentée
            après chaque assemblage, et l’on voit ce qui clochait dans le jeu choisi.
          </p>
        </section>

        {history.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Vos dernières sessions</h2>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {history.map((entry, i) => (
                    <tr key={i} className="border-t first:border-t-0">
                      <td className="text-muted-foreground p-2.5">
                        {new Date(entry.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="p-2.5">
                        {FORME_FORMATS[entry.format].label}
                        {entry.training ? " · entraînement" : ""}
                      </td>
                      <td className="p-2.5 text-right font-semibold tabular-nums">
                        {entry.correct}/{entry.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div className="border-warning/40 bg-warning/5 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">Reconstitution pédagogique.</strong> Cet exercice
            reproduit le <em>principe</em> du test des formes imbriquées (visualisation dans
            l’espace et projection en 3D) avec nos propres assemblages. Sans lien avec le logiciel
            officiel des armées.
          </p>
        </div>
      </div>
    );
  }

  // --- Bilan ---------------------------------------------------------------
  if (phase === "done") {
    const score = scoreFormeSession(puzzles, answers);
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-5 text-center">
          <p className="text-muted-foreground text-sm">
            {FORME_FORMATS[format].label}
            {training ? " · entraînement" : ""}
          </p>
          <p
            className={cn(
              "mt-1 text-5xl font-bold tabular-nums",
              score.precision >= 80
                ? "text-success"
                : score.precision >= 50
                  ? "text-warning"
                  : "text-destructive"
            )}
          >
            {score.correct}
            <span className="text-muted-foreground text-2xl">/{score.total}</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {score.answered} assemblage{score.answered > 1 ? "s" : ""} traité
            {score.answered > 1 ? "s" : ""} sur {score.total} · meilleure série&nbsp;:{" "}
            {score.bestStreak}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Correction</h2>
          {puzzles.map((puzzle, i) => {
            const given = answers[i];
            const right = given === puzzle.answerIndex;
            const goodLabel = OPTION_LABELS[puzzle.answerIndex];
            return (
              <div key={i} className="bg-card rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Assemblage {i + 1}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · niveau {puzzle.level}
                    </span>
                  </p>
                  {/* La bonne réponse est annoncée en clair, pas à chercher
                      dans le paragraphe d'explication. */}
                  <span className="flex flex-wrap items-center gap-2">
                    {!right ? (
                      <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold">
                        {given === null
                          ? "Non traité"
                          : `Vous aviez répondu jeu ${OPTION_LABELS[given]}`}
                      </span>
                    ) : null}
                    <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {right ? `Juste — jeu ${goodLabel}` : `Bonne réponse : jeu ${goodLabel}`}
                    </span>
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                      L’assemblage
                    </p>
                    <FormeImage
                      puzzle={puzzle}
                      kind={{ mode: "assembly" }}
                      alt={`Assemblage ${i + 1}.`}
                    />
                  </div>
                  <div>
                    <p className="text-success mb-1 text-xs font-semibold tracking-wide uppercase">
                      Le bon jeu — {goodLabel}
                    </p>
                    <FormeImage
                      puzzle={puzzle}
                      kind={{ mode: "option", optionIndex: puzzle.answerIndex }}
                      alt={`Le jeu ${goodLabel}, celui qui construit l’assemblage ${i + 1}.`}
                      className="ring-success/60 ring-2"
                    />
                  </div>
                </div>

                {/* Voir côte à côte le jeu choisi et le bon vaut mieux que
                    n'importe quelle phrase pour comprendre son erreur. */}
                {!right && given !== null ? (
                  <div className="mt-3">
                    <p className="text-destructive mb-1 text-xs font-semibold tracking-wide uppercase">
                      Le jeu {OPTION_LABELS[given]}, votre réponse
                    </p>
                    <FormeImage
                      puzzle={puzzle}
                      kind={{ mode: "option", optionIndex: given }}
                      alt={`Le jeu ${OPTION_LABELS[given]}, celui que vous aviez choisi.`}
                      className="ring-destructive/50 ring-2"
                    />
                    <p className="text-muted-foreground mt-2 text-sm">
                      Ce qui clochait : {puzzle.differences[given]}.
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => start(format, training)}>Recommencer</Button>
          <Button variant="outline" onClick={() => setPhase("intro")}>
            Changer de format
          </Button>
          <Button variant="outline" asChild>
            <Link href="/psychotechnique/exercices/la-vision-spatiale">Lire la méthode</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Session -------------------------------------------------------------
  const right = checked && answer === current.answerIndex;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Assemblage {index + 1}
          <span className="text-muted-foreground font-normal"> / {puzzles.length}</span>
          <span className="text-muted-foreground font-normal"> · niveau {current.level}</span>
        </p>
        {training ? (
          <span className="text-muted-foreground text-sm">Entraînement — sans chronomètre</span>
        ) : (
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              remaining <= 30 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {formatDuration(remaining)}
          </span>
        )}
      </div>

      <div className="mx-auto max-w-2xl">
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
          L’assemblage à décomposer
        </p>
        <FormeImage
          puzzle={current}
          kind={{ mode: "assembly" }}
          alt="Un assemblage de pièces enchevêtrées, à décomposer mentalement."
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">
          Quel jeu de pièces a servi à construire cet assemblage ?
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {current.options.map((_, i) => {
            const selected = answer === i;
            const isRight = checked && i === current.answerIndex;
            const isWrong = checked && selected && i !== current.answerIndex;
            return (
              <button
                key={OPTION_LABELS[i]}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={selected}
                className={cn(
                  "focus-visible:ring-ring rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  selected && !checked && "border-primary bg-primary/5 ring-primary/30 ring-2",
                  !selected && !checked && "hover:border-primary/50",
                  isRight && "border-success bg-success/10",
                  isWrong && "border-destructive bg-destructive/10"
                )}
              >
                <span
                  className={cn(
                    "mb-1.5 block text-sm font-bold",
                    isRight && "text-success",
                    isWrong && "text-destructive"
                  )}
                >
                  Jeu {OPTION_LABELS[i]}
                </span>
                <FormeImage
                  puzzle={current}
                  kind={{ mode: "option", optionIndex: i }}
                  alt={`Jeu ${OPTION_LABELS[i]} : les pièces séparées.`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {checked ? (
        <div
          className={cn(
            "rounded-lg border p-4",
            right ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
          )}
        >
          <p className="text-sm font-semibold">
            {right
              ? `Juste — l’assemblage vient du jeu ${OPTION_LABELS[current.answerIndex]}.`
              : `Faux — l’assemblage vient du jeu ${OPTION_LABELS[current.answerIndex]}.`}
          </p>
          {!right && answer !== null ? (
            <p className="text-muted-foreground mt-1 text-sm">
              Dans le jeu {OPTION_LABELS[answer]}, {current.differences[answer]}.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={goNext} disabled={!training && answer === null}>
          {index + 1 >= puzzles.length ? "Terminer" : "Assemblage suivant"}
        </Button>
        <Button variant="ghost" onClick={() => setPhase("intro")}>
          Abandonner
        </Button>
      </div>
    </div>
  );
}
