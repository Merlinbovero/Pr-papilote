"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookmarkIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  FlagIcon,
  PlayIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  composeBiaExam,
  gradeComposedExam,
  type BiaExamQuestion,
  type BiaExamReport,
} from "@/lib/bia/exam";
import type { BiaConfig, BiaPlayerQuestion } from "@/lib/bia/schema";

/**
 * Examen blanc BIA — expérience complète côté client
 * (docs/editorial/module-bia.md) : composition par graine de session
 * (renouvellement via l'historique local), navigation libre entre les
 * questions, marquage « à revoir », chronomètre global, validation
 * finale, correction détaillée avec renvoi vers les fiches, score par
 * matière et synthèse. Le moteur (composition, notation) vient de
 * src/lib/bia/exam — aucune logique de barème ici.
 */

const SEEN_STORAGE_KEY = "prepapilote.bia.seenQuestions";
const HISTORY_STORAGE_KEY = "prepapilote.bia.examHistory";

interface ExamHistoryEntry {
  finishedAt: string;
  noteGlobale20: number;
  admis: boolean;
  dureeSecondes: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible (navigation privée…) : l'examen reste jouable.
  }
}

interface BiaExamPlayerProps {
  /** URL du vivier JSON, récupéré à la demande au lancement (Phase 16). */
  poolUrl: string;
  /** Nombre total de questions du vivier (compté au serveur, sans les données). */
  totalAvailable: number;
  config: BiaConfig;
  matiereNames: Record<string, string>;
}

type Phase = "intro" | "running" | "review";

export function BiaExamPlayer({
  poolUrl,
  totalAvailable,
  config,
  matiereNames,
}: BiaExamPlayerProps) {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const poolsCache = React.useRef<Record<string, BiaPlayerQuestion[]> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
  const [questions, setQuestions] = React.useState<BiaExamQuestion<BiaPlayerQuestion>[]>([]);
  const [shortagesCount, setShortagesCount] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number[]>>({});
  const [marked, setMarked] = React.useState<Set<string>>(new Set());
  const [remaining, setRemaining] = React.useState(config.examen.dureeSecondes);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [report, setReport] = React.useState<BiaExamReport | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [history, setHistory] = React.useState<ExamHistoryEntry[]>([]);

  // Chargé après l'hydratation (asynchrone : pas de rendu en cascade,
  // et le HTML serveur — sans historique — reste identique au premier
  // rendu client).
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHistory(readJson<ExamHistoryEntry[]>(HISTORY_STORAGE_KEY, []));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const start = async () => {
    let pools = poolsCache.current;
    if (!pools) {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch(poolUrl);
        if (!res.ok) throw new Error(String(res.status));
        pools = (await res.json()) as Record<string, BiaPlayerQuestion[]>;
        poolsCache.current = pools;
      } catch {
        setLoading(false);
        setLoadError(true);
        return;
      }
      setLoading(false);
    }
    const seenIds = new Set(readJson<string[]>(SEEN_STORAGE_KEY, []));
    const byMatiere = new Map(Object.entries(pools));
    const exam = composeBiaExam({
      pools: { byMatiere },
      config,
      seed: Date.now() % 2147483647,
      seenIds,
    });
    setQuestions(exam.questions);
    setShortagesCount(exam.shortages.reduce((sum, s) => sum + (s.requested - s.provided), 0));
    setAnswers({});
    setMarked(new Set());
    setIndex(0);
    setRemaining(config.examen.dureeSecondes);
    setStartedAt(Date.now());
    setReport(null);
    setPhase("running");
  };

  const finish = React.useCallback(() => {
    if (phase !== "running") {
      return;
    }
    const graded = gradeComposedExam(
      { questions },
      (question) => {
        const given = answers[question.id];
        if (!given || given.length === 0) {
          return undefined;
        }
        const expected = new Set(question.correctChoices);
        return given.length === expected.size && given.every((c) => expected.has(c));
      },
      config
    );
    const spent = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    const entry: ExamHistoryEntry = {
      finishedAt: new Date().toISOString(),
      noteGlobale20: graded.noteGlobale20,
      admis: graded.admis,
      dureeSecondes: spent,
    };
    const nextHistory = [entry, ...history].slice(0, 20);
    writeJson(HISTORY_STORAGE_KEY, nextHistory);
    const seen = new Set(readJson<string[]>(SEEN_STORAGE_KEY, []));
    for (const { question } of questions) {
      seen.add(question.id);
    }
    writeJson(SEEN_STORAGE_KEY, [...seen].slice(-2000));

    setReport(graded);
    setElapsed(spent);
    setHistory(nextHistory);
    setPhase("review");
  }, [phase, questions, answers, config, startedAt, history]);

  // Chronomètre global : à zéro, l'examen est remis tel quel.
  React.useEffect(() => {
    if (phase !== "running") {
      return;
    }
    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, finish]);

  if (phase === "intro") {
    return (
      <ExamIntro
        config={config}
        history={history}
        totalAvailable={totalAvailable}
        onStart={start}
        loading={loading}
        loadError={loadError}
      />
    );
  }

  if (phase === "review" && report) {
    return (
      <ExamReview
        questions={questions}
        answers={answers}
        report={report}
        matiereNames={matiereNames}
        elapsedSeconds={elapsed}
        onRestart={() => setPhase("intro")}
      />
    );
  }

  const current = questions[index];
  if (!current) {
    return null;
  }
  const answered = Object.keys(answers).filter((id) => answers[id].length > 0).length;
  const isMultiple = current.question.correctChoices.length > 1;
  const selected = answers[current.question.id] ?? [];

  const toggle = (choiceIndex: number) => {
    setAnswers((previous) => {
      const before = previous[current.question.id] ?? [];
      const next = isMultiple
        ? before.includes(choiceIndex)
          ? before.filter((v) => v !== choiceIndex)
          : [...before, choiceIndex]
        : [choiceIndex];
      return { ...previous, [current.question.id]: next };
    });
  };

  const toggleMark = () => {
    setMarked((previous) => {
      const next = new Set(previous);
      if (next.has(current.question.id)) {
        next.delete(current.question.id);
      } else {
        next.add(current.question.id);
      }
      return next;
    });
  };

  return (
    <section aria-label="Examen blanc en cours" className="space-y-6">
      <div className="space-y-2">
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            Question {index + 1} / {questions.length} ·{" "}
            {matiereNames[current.matiere] ?? current.matiere}
          </span>
          <span className="flex items-center gap-3">
            <span>{answered} répondues</span>
            <span
              className={cn(
                "flex items-center gap-1 tabular-nums",
                remaining < 300 && "text-destructive font-medium"
              )}
            >
              <ClockIcon aria-hidden className="size-4" />
              {formatDuration(remaining)}
            </span>
          </span>
        </div>
        <Progress value={(answered / questions.length) * 100} />
      </div>

      {shortagesCount > 0 && index === 0 ? (
        <Alert>
          <AlertTitle>Examen légèrement réduit</AlertTitle>
          <AlertDescription>
            La banque ne permet pas encore de servir {shortagesCount} question
            {shortagesCount > 1 ? "s" : ""} sur ce tirage — l&apos;examen reste noté sur les
            questions présentes.
          </AlertDescription>
        </Alert>
      ) : null}

      <h2 className="text-xl font-semibold">{current.question.statement}</h2>
      {isMultiple ? (
        <p className="text-muted-foreground text-sm">Plusieurs réponses possibles.</p>
      ) : null}

      <ul className="space-y-2" role="list">
        {current.question.choices.map((choice, choiceIndex) => {
          const isSelected = selected.includes(choiceIndex);
          return (
            <li key={choiceIndex}>
              <button
                type="button"
                onClick={() => toggle(choiceIndex)}
                aria-pressed={isSelected}
                className={cn(
                  "focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isSelected ? "border-primary bg-accent" : "hover:bg-accent/50"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 rounded-full border",
                    isSelected && "border-primary bg-primary"
                  )}
                />
                <span className="flex-1">{choice.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          Précédente
        </Button>
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
        >
          Suivante
        </Button>
        <Button
          variant={marked.has(current.question.id) ? "secondary" : "ghost"}
          onClick={toggleMark}
          aria-pressed={marked.has(current.question.id)}
        >
          <BookmarkIcon aria-hidden className="size-4" />
          {marked.has(current.question.id) ? "Marquée" : "Marquer"}
        </Button>
        <span className="flex-1" />
        <Button variant="destructive" onClick={finish}>
          <FlagIcon aria-hidden className="size-4" />
          Terminer l&apos;examen
        </Button>
      </div>

      <nav aria-label="Navigation entre les questions" className="bg-card rounded-xl border p-4">
        <ol className="flex flex-wrap gap-1.5">
          {questions.map(({ question }, i) => {
            const hasAnswer = (answers[question.id] ?? []).length > 0;
            const isMarked = marked.has(question.id);
            return (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Question ${i + 1}${hasAnswer ? ", répondue" : ""}${isMarked ? ", marquée" : ""}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "focus-visible:ring-ring size-8 rounded-md border text-xs tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    i === index && "ring-primary ring-2",
                    hasAnswer && "bg-primary/15 border-primary/40",
                    isMarked && "border-warning bg-warning/15"
                  )}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Écran d'introduction
// ---------------------------------------------------------------------------

function ExamIntro({
  config,
  history,
  totalAvailable,
  onStart,
  loading,
  loadError,
}: {
  config: BiaConfig;
  history: ExamHistoryEntry[];
  totalAvailable: number;
  onStart: () => void;
  loading: boolean;
  loadError: boolean;
}) {
  const total = config.matieres.length * config.examen.questionsParMatiere;
  return (
    <section aria-label="Présentation de l'examen blanc" className="space-y-6">
      <div className="bg-card space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Les conditions de l&apos;épreuve</h2>
        <ul className="space-y-2 text-sm leading-6">
          <li>
            <strong>{total} questions</strong> — {config.examen.questionsParMatiere} par matière,
            dans l&apos;ordre officiel des cinq matières.
          </li>
          <li>
            <strong>{formatDuration(config.examen.dureeSecondes)}</strong> de chronomètre global —
            comme à l&apos;épreuve réelle. À zéro, la copie est relevée en l&apos;état.
          </li>
          <li>
            Navigation <strong>libre</strong> entre les questions, marquage « à revoir », validation
            finale quand vous le décidez.
          </li>
          <li>
            Admission à <strong>{config.examen.seuilAdmission}/20</strong> de moyenne — mentions
            comme au vrai BIA. Chaque tirage privilégie les questions que vous n&apos;avez pas
            encore rencontrées ({totalAvailable} questions au total dans les viviers).
          </li>
        </ul>
        <Button size="lg" onClick={onStart} disabled={loading}>
          <PlayIcon aria-hidden className="size-4" />
          {loading ? "Préparation…" : "Commencer l'examen"}
        </Button>
        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Chargement impossible</AlertTitle>
            <AlertDescription>
              Le vivier de questions n&apos;a pas pu être récupéré. Vérifiez votre connexion et
              réessayez.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {history.length > 0 ? (
        <div className="bg-card space-y-3 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Vos examens précédents</h2>
          <ul className="space-y-1 text-sm">
            {history.slice(0, 5).map((entry) => (
              <li key={entry.finishedAt} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {new Date(entry.finishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  {entry.noteGlobale20}/20
                  <Badge variant={entry.admis ? "default" : "outline"} className="font-normal">
                    {entry.admis ? "Admis" : "Non admis"}
                  </Badge>
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
}

// ---------------------------------------------------------------------------
// Correction et synthèse
// ---------------------------------------------------------------------------

function ExamReview({
  questions,
  answers,
  report,
  matiereNames,
  elapsedSeconds,
  onRestart,
}: {
  questions: BiaExamQuestion<BiaPlayerQuestion>[];
  answers: Record<string, number[]>;
  report: BiaExamReport;
  matiereNames: Record<string, string>;
  elapsedSeconds: number;
  onRestart: () => void;
}) {
  const [filter, setFilter] = React.useState<"erreurs" | "toutes">("erreurs");
  const erreurs = new Set(report.erreurs);
  const shown =
    filter === "erreurs" ? questions.filter((q) => erreurs.has(q.question.id)) : questions;

  const forces = report.parMatiere.filter((m) => m.note20 >= 14);
  const faiblesses = report.parMatiere.filter((m) => m.note20 < 10);

  return (
    <section aria-label="Correction de l'examen blanc" className="space-y-8">
      <div className="bg-card space-y-2 rounded-xl border p-6 text-center">
        <p className="text-muted-foreground text-sm tracking-wide uppercase">Résultat</p>
        <p className="text-4xl font-bold tracking-tight">{report.noteGlobale20}/20</p>
        <p className="text-lg font-medium">
          {report.admis
            ? `Admis${report.mention ? ` — mention ${report.mention}` : ""}`
            : "Non admis"}
        </p>
        <p className="text-muted-foreground text-sm">
          {formatDuration(elapsedSeconds)} passées · {report.sansReponse.length} question
          {report.sansReponse.length > 1 ? "s" : ""} sans réponse
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {report.parMatiere.map((score) => (
          <div key={score.matiere} className="bg-card rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">{matiereNames[score.matiere]}</p>
            <p className="text-2xl font-semibold tabular-nums">{score.note20}/20</p>
            <p className="text-muted-foreground text-xs">
              {score.correct}/{score.total} bonnes réponses
            </p>
          </div>
        ))}
      </div>

      {(forces.length > 0 || faiblesses.length > 0) && (
        <div className="bg-card space-y-2 rounded-xl border p-6 text-sm leading-6">
          <h2 className="font-semibold">Synthèse</h2>
          {forces.length > 0 ? (
            <p>
              <strong>Points forts</strong> —{" "}
              {forces.map((m) => matiereNames[m.matiere]).join(", ")}.
            </p>
          ) : null}
          {faiblesses.length > 0 ? (
            <p>
              <strong>À travailler en priorité</strong> —{" "}
              {faiblesses.map((m) => matiereNames[m.matiere]).join(", ")} : reprenez les fiches
              liées aux questions ratées ci-dessous.
            </p>
          ) : (
            <p>Aucune matière sous la moyenne — continuez à creuser vos erreurs restantes.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === "erreurs" ? "default" : "outline"}
          onClick={() => setFilter("erreurs")}
        >
          Mes erreurs ({report.erreurs.length})
        </Button>
        <Button
          variant={filter === "toutes" ? "default" : "outline"}
          onClick={() => setFilter("toutes")}
        >
          Toutes les questions
        </Button>
        <span className="flex-1" />
        <Button variant="outline" onClick={onRestart}>
          Nouvel examen
        </Button>
      </div>

      <ol className="space-y-4">
        {shown.map(({ question, matiere }) => {
          const given = answers[question.id] ?? [];
          const expected = new Set(question.correctChoices);
          const wasCorrect = given.length === expected.size && given.every((c) => expected.has(c));
          return (
            <li key={question.id} className="bg-card space-y-3 rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{question.statement}</p>
                {wasCorrect ? (
                  <CircleCheckIcon aria-hidden className="text-success mt-1 size-5 shrink-0" />
                ) : (
                  <CircleXIcon aria-hidden className="text-destructive mt-1 size-5 shrink-0" />
                )}
              </div>
              <p className="text-muted-foreground text-xs">{matiereNames[matiere]}</p>
              <ul className="space-y-1 text-sm">
                {question.choices.map((choice, i) => (
                  <li
                    key={i}
                    className={cn(
                      "rounded-md border px-3 py-1.5",
                      expected.has(i) && "border-success bg-success/10",
                      given.includes(i) &&
                        !expected.has(i) &&
                        "border-destructive bg-destructive/10"
                    )}
                  >
                    {choice.label}
                    {expected.has(i) ? " ✓" : given.includes(i) ? " — votre réponse" : ""}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-6">{question.explanation}</p>
              {question.furtherReading.length > 0 ? (
                <p className="text-muted-foreground text-sm">
                  À réviser :{" "}
                  {question.furtherReading.map((fiche, i) => (
                    <React.Fragment key={fiche.href}>
                      {i > 0 ? ", " : ""}
                      <Link
                        href={fiche.href}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {fiche.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }
  if (minutes > 0) {
    return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
  }
  return `${seconds} s`;
}
