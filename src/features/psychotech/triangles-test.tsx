"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TriangleFigure, TrianglePieceView } from "@/features/psychotech/triangle-figure";
import {
  buildTriangleSession,
  generateTrianglePuzzle,
  scoreTriangleSession,
  TRIANGLE_FORMATS,
  TRIANGLE_LEVEL_LIST,
  type TriangleFormatKey,
  type TrianglePuzzle,
} from "@/lib/psychotech/triangles";
import { cn } from "@/lib/utils";

/**
 * Test des triangles — lecteur.
 *
 * Toute la génération et la notation vivent dans
 * `src/lib/psychotech/triangles.ts`.
 *
 * Parti pris assumé : **le test reste sec, le débrief est généreux**. Pendant
 * la session on ne montre rien d'autre que la figure et les quatre losanges,
 * comme aux sélections. La règle qui gouvernait la figure n'apparaît qu'à la
 * correction — le débrief n'est pas l'épreuve, c'est là qu'on apprend à
 * reconnaître les motifs.
 */

type Phase = "intro" | "playing" | "done";

const OPTION_LABELS = ["A", "B", "C", "D"];

const HISTORY_KEY = "pp.triangles.history.v1";
const HISTORY_LIMIT = 10;

interface HistoryEntry {
  date: string;
  format: TriangleFormatKey;
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

/** Un exemple figé : on comprend l'épreuve en la voyant, pas en la lisant. */
const TUTORIAL = generateTrianglePuzzle(20260727, 1);

function TrianglesTutorial() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Comment ça marche</h2>
      <p className="text-muted-foreground max-w-prose text-sm">
        Un grand triangle est découpé en petits triangles coloriés, et{" "}
        <strong>deux d’entre eux sont laissés blancs</strong>. Parmi quatre losanges, un seul
        complète la figure.
      </p>
      <p className="text-muted-foreground max-w-prose text-sm">
        La figure n’est <strong>pas coloriée au hasard</strong> : elle obéit à une règle —
        répétition par lignes, symétrie, diagonales, couronnes, alternance, motif d’un quart répété.
        Trouver la règle, c’est trouver la pièce. La règle n’est jamais donnée pendant le test ;
        elle est nommée à la correction.
      </p>
      <div className="bg-card grid gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            La figure
          </p>
          <div className="mx-auto max-w-[16rem]">
            <TriangleFigure puzzle={TUTORIAL} />
          </div>
        </div>
        <div>
          <p className="text-success mb-1.5 text-xs font-semibold tracking-wide uppercase">
            Complétée par la bonne pièce
          </p>
          <div className="mx-auto max-w-[16rem]">
            <TriangleFigure puzzle={TUTORIAL} filled={TUTORIAL.options[TUTORIAL.answerIndex]} />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">{TUTORIAL.rule}</p>
        </div>
      </div>
    </section>
  );
}

export function TrianglesTest() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [format, setFormat] = React.useState<TriangleFormatKey>("officiel");
  const [training, setTraining] = React.useState(false);
  const [puzzles, setPuzzles] = React.useState<TrianglePuzzle[]>([]);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [checked, setChecked] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const deadlineRef = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  /**
   * Ramène l'exercice en haut de l'écran **après** le changement de phase :
   * mesurer avant que React n'ait remplacé le contenu reviendrait à calculer
   * un défilement sur une page qui n'existe déjà plus.
   */
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const element = rootRef.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [phase, index]);

  const sessionRef = React.useRef<{
    puzzles: TrianglePuzzle[];
    answers: (number | null)[];
    format: TriangleFormatKey;
    training: boolean;
  }>({ puzzles: [], answers: [], format: "officiel", training: false });

  React.useEffect(() => {
    sessionRef.current = { puzzles, answers, format, training };
  }, [puzzles, answers, format, training]);

  const finish = React.useCallback(() => {
    const current = sessionRef.current;
    const score = scoreTriangleSession(current.puzzles, current.answers);
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      format: current.format,
      correct: score.correct,
      total: score.total,
      training: current.training,
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

  const start = React.useCallback((chosen: TriangleFormatKey, isTraining: boolean) => {
    const session = buildTriangleSession(Math.floor(Math.random() * 1_000_000_000), chosen);
    setFormat(chosen);
    setTraining(isTraining);
    setPuzzles(session);
    setAnswers(session.map(() => null));
    setIndex(0);
    setChecked(false);
    deadlineRef.current = Date.now() + TRIANGLE_FORMATS[chosen].durationSeconds * 1000;
    setRemaining(TRIANGLE_FORMATS[chosen].durationSeconds);
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
      <div ref={rootRef} className="space-y-6">
        <TrianglesTutorial />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Les trois niveaux</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TRIANGLE_LEVEL_LIST.map((info) => (
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
            Les niveaux s’enchaînent par tiers au fil de la session — comme à l’épreuve, où les
            motifs se combinent de la première à la dernière question.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Lancer une session</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(TRIANGLE_FORMATS).map((info) => (
              <div key={info.key} className="bg-card flex flex-col rounded-lg border p-4">
                <p className="text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 flex-1 text-sm">{info.hint}</p>
                <p className="text-muted-foreground mt-2 text-sm tabular-nums">
                  {info.size} figures · {formatDuration(info.durationSeconds)}
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
            En <strong>mode entraînement</strong>, pas de chronomètre : la règle et la figure
            complétée s’affichent après chaque réponse.
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
                        {TRIANGLE_FORMATS[entry.format].label}
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
            reproduit le <em>principe</em> du test des triangles (reconnaissance de motifs et
            déduction) avec nos propres figures. Sans lien avec le logiciel officiel des armées.
          </p>
        </div>
      </div>
    );
  }

  // --- Bilan ---------------------------------------------------------------
  if (phase === "done") {
    const score = scoreTriangleSession(puzzles, answers);
    return (
      <div ref={rootRef} className="space-y-6">
        <div className="bg-card rounded-lg border p-5 text-center">
          <p className="text-muted-foreground text-sm">
            {TRIANGLE_FORMATS[format].label}
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
            {score.answered} figure{score.answered > 1 ? "s" : ""} traitée
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
                    Figure {i + 1}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · niveau {puzzle.level}
                    </span>
                  </p>
                  <span className="flex flex-wrap items-center gap-2">
                    {!right ? (
                      <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold">
                        {given === null
                          ? "Non traitée"
                          : `Vous aviez répondu ${OPTION_LABELS[given]}`}
                      </span>
                    ) : null}
                    <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {right ? `Juste — ${goodLabel}` : `Bonne réponse : ${goodLabel}`}
                    </span>
                  </span>
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                  <strong className="text-foreground">La règle.</strong> {puzzle.rule}
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                      La figure posée
                    </p>
                    <TriangleFigure puzzle={puzzle} />
                  </div>
                  <div>
                    <p className="text-success mb-1 text-xs font-semibold tracking-wide uppercase">
                      Complétée — pièce {goodLabel}
                    </p>
                    <TriangleFigure
                      puzzle={puzzle}
                      filled={puzzle.options[puzzle.answerIndex]}
                      className="ring-success/50 rounded-lg ring-2"
                    />
                  </div>
                  {!right && given !== null ? (
                    <div>
                      <p className="text-destructive mb-1 text-xs font-semibold tracking-wide uppercase">
                        Votre pièce {OPTION_LABELS[given]}
                      </p>
                      <TriangleFigure
                        puzzle={puzzle}
                        filled={puzzle.options[given]}
                        className="ring-destructive/50 rounded-lg ring-2"
                      />
                      <p className="text-muted-foreground mt-2 text-sm">
                        {puzzle.differences[given]}.
                      </p>
                    </div>
                  ) : null}
                </div>
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
            <Link href="/psychotechnique/exercices/les-matrices">Lire la méthode</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Session -------------------------------------------------------------
  const right = checked && answer === current.answerIndex;

  return (
    <div ref={rootRef} className="min-h-[calc(100svh-7rem)] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Figure {index + 1}
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

      <div className="mx-auto max-w-md">
        <TriangleFigure
          puzzle={current}
          filled={checked ? current.options[current.answerIndex] : undefined}
        />
      </div>

      <div>
        <p className="mb-2 text-center text-sm font-semibold">Quel losange complète la figure ?</p>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {current.options.map((option, i) => {
            const selected = answer === i;
            const isRight = checked && i === current.answerIndex;
            const isWrong = checked && selected && i !== current.answerIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={selected}
                aria-label={`Losange ${OPTION_LABELS[i]}`}
                className={cn(
                  "focus-visible:ring-ring flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  selected && !checked && "border-primary bg-primary/5 ring-primary/30 ring-2",
                  !selected && !checked && "hover:border-primary/50",
                  isRight && "border-success bg-success/10",
                  isWrong && "border-destructive bg-destructive/10"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    isRight && "text-success",
                    isWrong && "text-destructive"
                  )}
                >
                  {OPTION_LABELS[i]}
                </span>
                <span className="w-full max-w-[7rem]">
                  <TrianglePieceView piece={option} size={current.size} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {checked ? (
        <div
          className={cn(
            "mx-auto max-w-2xl rounded-lg border p-4",
            right ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
          )}
        >
          <p className="text-sm font-semibold">
            {right
              ? `Juste — la pièce ${OPTION_LABELS[current.answerIndex]}.`
              : `Faux — c’était la pièce ${OPTION_LABELS[current.answerIndex]}.`}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            <strong className="text-foreground">La règle.</strong> {current.rule}
          </p>
          {!right && answer !== null ? (
            <p className="text-muted-foreground mt-1 text-sm">
              Dans la pièce {OPTION_LABELS[answer]}, {current.differences[answer]}.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={goNext} disabled={!training && answer === null}>
          {index + 1 >= puzzles.length ? "Terminer" : "Figure suivante"}
        </Button>
        <Button variant="ghost" onClick={() => setPhase("intro")}>
          Abandonner
        </Button>
      </div>
    </div>
  );
}
