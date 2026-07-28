"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  buildCodageSession,
  CODAGE_FORMATS,
  CODAGE_LEVEL_LIST,
  CODAGE_LEVELS,
  scoreCodageSession,
  wordForCode,
  type CodageFormatKey,
  type CodageLevel,
  type CodageSession,
} from "@/lib/psychotech/codage";
import { cn } from "@/lib/utils";

/**
 * Test de codage (TAMI-C) — lecteur.
 *
 * Toute la génération et la notation vivent dans `src/lib/psychotech/codage.ts`.
 *
 * Le parti pris d'interaction découle de la cadence : **3,3 secondes par
 * question**. Un clic sur un code **valide et enchaîne aussitôt** — un bouton
 * « suivant » mangerait la moitié du temps imparti. La grille, elle, ne bouge
 * jamais : c'est ce qui permet de mémoriser peu à peu les positions, ce que le
 * test récompense.
 */

type Phase = "intro" | "playing" | "done";

const HISTORY_KEY = "pp.codage.history.v1";
const HISTORY_LIMIT = 10;

interface HistoryEntry {
  date: string;
  format: CodageFormatKey;
  level: CodageLevel;
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

/**
 * La grille. Trois colonnes comme à l'épreuve, le mot à gauche et le code à
 * droite, en chiffres tabulaires pour que les colonnes s'alignent — c'est ce
 * qui permet de balayer verticalement au lieu de lire ligne à ligne.
 */
function CodageGrid({
  session,
  highlight,
  marks,
}: {
  session: CodageSession;
  /** Rang du mot demandé — mis en évidence en entraînement et à la correction. */
  highlight?: number;
  /** Codes à signaler : le bon en vert, celui donné à tort en rouge. */
  marks?: { correct?: string; wrong?: string };
}) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
      {session.grid.map((entry, i) => {
        const isTarget = highlight === i;
        const isCorrect = marks?.correct === entry.code;
        const isWrong = marks?.wrong === entry.code;
        return (
          <li
            key={entry.word}
            className={cn(
              "bg-card flex items-center justify-between gap-3 rounded-md border px-3 py-2",
              isTarget && "border-primary bg-primary/5 ring-primary/30 ring-2",
              isCorrect && "border-success bg-success/10",
              isWrong && "border-destructive bg-destructive/10"
            )}
          >
            <span className={cn("truncate text-sm", isTarget && "font-semibold")}>
              {entry.word}
            </span>
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                isCorrect && "text-success font-bold",
                isWrong && "text-destructive font-bold"
              )}
            >
              {entry.code}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CodageTest() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [format, setFormat] = React.useState<CodageFormatKey>("officiel");
  const [level, setLevel] = React.useState<CodageLevel>(1);
  const [training, setTraining] = React.useState(false);
  const [session, setSession] = React.useState<CodageSession | null>(null);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [feedback, setFeedback] = React.useState<number | null>(null);
  const [remaining, setRemaining] = React.useState(0);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const deadlineRef = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  /**
   * Ramène l'exercice en haut de l'écran **après** le changement de phase, et
   * non pendant : l'intro est longue, la session courte, et mesurer la position
   * avant que React n'ait remplacé le contenu donnait un défilement calculé sur
   * une page qui n'existait déjà plus.
   */
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const element = rootRef.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [phase]);

  const sessionRef = React.useRef<{
    session: CodageSession | null;
    answers: (number | null)[];
    format: CodageFormatKey;
    level: CodageLevel;
    training: boolean;
  }>({ session: null, answers: [], format: "officiel", level: 1, training: false });

  React.useEffect(() => {
    sessionRef.current = { session, answers, format, level, training };
  }, [session, answers, format, level, training]);

  const finish = React.useCallback(() => {
    const current = sessionRef.current;
    if (!current.session) return;
    const score = scoreCodageSession(current.session.questions, current.answers);
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      format: current.format,
      level: current.level,
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
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, training, finish]);

  const start = React.useCallback(
    (key: CodageFormatKey, chosenLevel: CodageLevel, isTraining: boolean) => {
      const built = buildCodageSession(Math.floor(Math.random() * 1_000_000_000), key, chosenLevel);
      setFormat(key);
      setLevel(chosenLevel);
      setTraining(isTraining);
      setSession(built);
      setAnswers(built.questions.map(() => null));
      setIndex(0);
      setFeedback(null);
      deadlineRef.current = Date.now() + CODAGE_FORMATS[key].durationSeconds * 1000;
      setRemaining(CODAGE_FORMATS[key].durationSeconds);
      setPhase("playing");
    },
    []
  );

  /**
   * Répondre enchaîne. En test on passe sans rien montrer — c'est la cadence
   * réelle. En entraînement on marque la réponse une seconde, le temps de voir
   * la bonne ligne de la grille, puis on enchaîne aussi : s'arrêter à chaque
   * question casserait le rythme que l'épreuve exige d'installer.
   */
  function choose(optionIndex: number) {
    if (!session || feedback !== null) return;
    const next = answers.map((a, i) => (i === index ? optionIndex : a));
    setAnswers(next);

    const advance = () => {
      setFeedback(null);
      if (index + 1 >= session.questions.length) {
        sessionRef.current = { ...sessionRef.current, answers: next };
        finish();
        return;
      }
      setIndex(index + 1);
    };

    if (!training) {
      advance();
      return;
    }
    setFeedback(optionIndex);
    window.setTimeout(advance, 1100);
  }

  // --- Intro ---------------------------------------------------------------
  if (phase === "intro") {
    const demo = buildCodageSession(20260727, "court", 1);
    return (
      <div ref={rootRef} className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Comment ça marche</h2>
          <p className="text-muted-foreground max-w-prose text-sm">
            Une <strong>grille de mots</strong> est affichée, chacun avec son{" "}
            <strong>code à quatre chiffres</strong>. À chaque question, un mot est demandé : il faut
            désigner son code parmi cinq propositions. La grille{" "}
            <strong>ne change pas de toute la session</strong> — on la mémorise peu à peu, et c’est
            ce qui fait gagner du temps.
          </p>
          <p className="text-muted-foreground max-w-prose text-sm">
            Le piège : les <strong>cinq codes proposés viennent tous de la grille</strong>. Aucun
            n’est inventé, donc aucun ne s’élimine sans avoir retrouvé la bonne ligne. Et ils se
            ressemblent.
          </p>
          <div className="bg-card space-y-3 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Exemple — quel code est associé au mot{" "}
              <span className="text-foreground">
                {demo.grid[demo.questions[0].entryIndex].word}
              </span>{" "}
              ?
            </p>
            <CodageGrid session={demo} highlight={demo.questions[0].entryIndex} />
            <div className="flex flex-wrap gap-2">
              {demo.questions[0].options.map((code) => (
                <span
                  key={code}
                  className="bg-muted/50 rounded-md border px-3 py-1.5 font-mono text-sm tabular-nums"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Choisir sa grille</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CODAGE_LEVEL_LIST.map((info) => (
              <button
                key={info.level}
                type="button"
                onClick={() => setLevel(info.level)}
                aria-pressed={level === info.level}
                className={cn(
                  "focus-visible:ring-ring rounded-lg border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  level === info.level
                    ? "border-primary bg-primary/5 ring-primary/30 ring-2"
                    : "bg-card hover:border-primary/50"
                )}
              >
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Niveau {info.level}
                </p>
                <p className="mt-0.5 text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 text-sm">{info.hint}</p>
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            La difficulté ne monte pas en cours de session, contrairement à nos autres épreuves : la
            grille étant fixe, elle se choisit au départ. Le{" "}
            <strong>niveau 1 est le format de l’épreuve</strong> — douze mots.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Lancer une session</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(CODAGE_FORMATS).map((info) => (
              <div key={info.key} className="bg-card flex flex-col rounded-lg border p-4">
                <p className="text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 flex-1 text-sm">{info.hint}</p>
                <p className="text-muted-foreground mt-2 text-sm tabular-nums">
                  {info.size} questions · {formatDuration(info.durationSeconds)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => start(info.key, level, false)}>
                    Lancer le test
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => start(info.key, level, true)}>
                    Entraînement
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            <strong>Répondre enchaîne aussitôt</strong> : à 3,3 secondes la question, un bouton «
            suivant » coûterait la moitié du temps. En <strong>mode entraînement</strong>, pas de
            chronomètre, et la bonne ligne de la grille s’allume une seconde après chaque réponse.
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
                        {CODAGE_FORMATS[entry.format].label} · grille de{" "}
                        {CODAGE_LEVELS[entry.level].size}
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
            reproduit le <em>principe</em> du test de codage du TAMI-C (vitesse de recherche et
            rigueur) avec nos propres grilles. Sans lien avec le logiciel officiel des armées.
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // --- Bilan ---------------------------------------------------------------
  if (phase === "done") {
    const score = scoreCodageSession(session.questions, answers);
    const erreurs = session.questions
      .map((question, i) => ({ question, i, given: answers[i] }))
      .filter(({ question, given }) => given !== null && given !== question.answerIndex);

    return (
      <div ref={rootRef} className="space-y-6">
        <div className="bg-card rounded-lg border p-5 text-center">
          <p className="text-muted-foreground text-sm">
            {CODAGE_FORMATS[format].label} · grille de {CODAGE_LEVELS[level].size}
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
            {score.answered} question{score.answered > 1 ? "s" : ""} traitée
            {score.answered > 1 ? "s" : ""} sur {score.total} · {score.justesse} % de justesse sur
            ce que vous avez traité · meilleure série&nbsp;: {score.bestStreak}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Sur cette épreuve, le <strong>débit</strong> compte autant que la justesse : les
            questions non traitées comptent comme fausses.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">La grille de cette session</h2>
          <CodageGrid session={session} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {erreurs.length === 0 ? "Aucune erreur" : `Vos ${erreurs.length} erreurs`}
          </h2>
          {erreurs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Tout ce que vous avez traité était juste.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="p-2.5 font-semibold">Question</th>
                    <th className="p-2.5 font-semibold">Mot demandé</th>
                    <th className="p-2.5 font-semibold">Votre réponse</th>
                    <th className="p-2.5 font-semibold">Bonne réponse</th>
                  </tr>
                </thead>
                <tbody>
                  {erreurs.map(({ question, i, given }) => {
                    const donne = question.options[given as number];
                    const bon = question.options[question.answerIndex];
                    // À quel mot appartenait le code donné : c'est l'explication
                    // la plus parlante d'une faute de codage.
                    const motDuCodeDonne = wordForCode(session.grid, donne);
                    return (
                      <tr key={i} className="border-t align-top">
                        <td className="text-muted-foreground p-2.5 tabular-nums">{i + 1}</td>
                        <td className="p-2.5 font-semibold">
                          {session.grid[question.entryIndex].word}
                        </td>
                        <td className="text-destructive p-2.5">
                          <span className="font-mono font-bold tabular-nums">{donne}</span>
                          {motDuCodeDonne ? (
                            <span className="text-muted-foreground block text-xs">
                              c’est le code de « {motDuCodeDonne} »
                            </span>
                          ) : null}
                        </td>
                        <td className="text-success p-2.5 font-mono font-bold tabular-nums">
                          {bon}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => start(format, level, training)}>Recommencer</Button>
          <Button variant="outline" onClick={() => setPhase("intro")}>
            Changer de grille ou de format
          </Button>
          <Button variant="outline" asChild>
            <Link href="/psychotechnique/exercices/le-test-de-codage">Lire la méthode</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Session -------------------------------------------------------------
  const question = session.questions[index];
  const target = session.grid[question.entryIndex];
  const answered = feedback !== null;
  const right = answered && feedback === question.answerIndex;

  return (
    // Pleine hauteur d'écran pendant la session : à 3,3 secondes la question,
    // rien de ce qui précède ne doit rester en vue — et c'est aussi ce qui
    // permet au recentrage d'aboutir, une page trop courte ne défilant pas.
    <div ref={rootRef} className="min-h-[calc(100svh-7rem)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Question {index + 1}
          <span className="text-muted-foreground font-normal"> / {session.questions.length}</span>
          <span className="text-muted-foreground font-normal">
            {" "}
            · grille de {session.grid.length}
          </span>
        </p>
        {training ? (
          <span className="text-muted-foreground text-sm">Entraînement — sans chronomètre</span>
        ) : (
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              remaining <= 20 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {formatDuration(remaining)}
          </span>
        )}
      </div>

      <p className="text-center text-xl font-semibold md:text-2xl">
        Quel code est associé au mot <span className="text-primary">{target.word}</span> ?
      </p>

      <CodageGrid
        session={session}
        highlight={answered ? question.entryIndex : undefined}
        marks={
          answered
            ? {
                correct: question.options[question.answerIndex],
                wrong: right ? undefined : question.options[feedback as number],
              }
            : undefined
        }
      />

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {question.options.map((code, i) => {
          const isRight = answered && i === question.answerIndex;
          const isWrong = answered && i === feedback && i !== question.answerIndex;
          return (
            <button
              key={code}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                "focus-visible:ring-ring min-w-[5.5rem] rounded-lg border px-4 py-3 font-mono text-lg font-bold tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none",
                !answered && "hover:border-primary hover:bg-primary/5",
                isRight && "border-success bg-success/10 text-success",
                isWrong && "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              {code}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={finish}>
          Terminer maintenant
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPhase("intro")}>
          Abandonner
        </Button>
      </div>
    </div>
  );
}
