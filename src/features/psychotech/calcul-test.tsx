"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalculatorIcon,
  DivideIcon,
  Grid3x3Icon,
  InfinityIcon,
  PercentIcon,
  PlaneIcon,
  PlusIcon,
  ScalingIcon,
  ShuffleIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CALC_FORMAT_LIST,
  CALC_FORMATS,
  CALC_THEMES,
  fmt,
  generateCalcQuestion,
  questionAt,
  scoreCalcSession,
  type CalcFormatKey,
  type CalcGrid,
  type CalcLevelChoice,
  type CalcQuestion,
  type CalcTheme,
} from "@/lib/psychotech/calcul";
import { cn } from "@/lib/utils";

/**
 * Calcul mental — thèmes, niveaux, longueurs, et un format sans fin.
 *
 * Les questions ne sont **jamais stockées** : elles se recalculent à partir de
 * la graine de session et de leur rang. C'est ce qui permet au format sans fin
 * d'enchaîner deux cents calculs sans rien accumuler en mémoire, et à la
 * correction finale de les retrouver toutes.
 *
 * Toute la génération et la notation vivent dans `src/lib/psychotech/calcul.ts`.
 */

type Phase = "intro" | "playing" | "done";

const HISTORY_KEY = "pp.calcul.history.v1";
const HISTORY_LIMIT = 12;

interface HistoryEntry {
  date: string;
  theme: CalcTheme;
  format: CalcFormatKey;
  correct: number;
  answered: number;
  training: boolean;
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: readonly HistoryEntry[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    /* quota / navigation privée : on ignore silencieusement */
  }
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m} min ${String(s).padStart(2, "0")}`;
}

const LEVEL_CHOICES: { value: CalcLevelChoice; label: string; hint: string }[] = [
  { value: 1, label: "Niveau 1", hint: "Entiers courts, opérations directes." },
  { value: 2, label: "Niveau 2", hint: "Nombres plus gros, raccourcis à connaître." },
  { value: 3, label: "Niveau 3", hint: "Décimaux, chaînes, pièges classiques." },
  {
    value: "progressif",
    label: "Progressif",
    hint: "Monte au fil de la session, comme à l’épreuve.",
  },
];

/** Une icône par thème — le rendu seul s'en occupe, jamais le moteur. */
const THEME_ICONS: Record<CalcTheme, LucideIcon> = {
  "addition-soustraction": PlusIcon,
  multiplication: XIcon,
  division: DivideIcon,
  "quatre-operations": CalculatorIcon,
  matrices: Grid3x3Icon,
  "ordres-de-grandeur": ScalingIcon,
  "fractions-pourcentages": PercentIcon,
  metier: PlaneIcon,
  melange: ShuffleIcon,
};

/**
 * Un calcul réel par thème, **produit par le générateur lui-même** : la vitrine
 * ne peut donc pas mentir sur ce qu'on va rencontrer. Les grilles font
 * exception — leur énoncé ne dit rien sans la grille, on la nomme donc.
 */
const THEME_EXAMPLES: Record<CalcTheme, string> = Object.fromEntries(
  CALC_THEMES.map((info) => [
    info.theme,
    info.theme === "matrices"
      ? "grille 3×3 à compléter"
      : generateCalcQuestion(2026, info.theme, 2).prompt.replace(" = ?", "").replace(" ≈ ?", " ≈"),
  ])
) as Record<CalcTheme, string>;

/** Titre de section : filet d'accent vertical, comme sur les pages de contenu. */
function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
        <span aria-hidden className="bg-primary h-5 w-1 rounded-full" />
        {children}
      </h2>
      {aside ? <span className="text-muted-foreground text-sm">{aside}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// La grille 3×3
// ---------------------------------------------------------------------------

/** Grille à trou avec totaux en marge — les totaux sont visuellement à part. */
function CalcGridView({ grid }: { grid: CalcGrid }) {
  return (
    <div className="flex justify-center">
      <table className="border-separate border-spacing-1 text-center tabular-nums">
        <tbody>
          {[0, 1, 2].map((r) => (
            <tr key={r}>
              {[0, 1, 2].map((c) => {
                const i = r * 3 + c;
                const value = grid.cells[i];
                return (
                  <td
                    key={c}
                    className={cn(
                      "h-12 w-16 rounded-md border text-base font-medium",
                      value === null && "border-primary text-primary bg-primary/5 font-bold"
                    )}
                  >
                    {value === null ? "?" : fmt(value)}
                  </td>
                );
              })}
              <td className="h-12 w-16 pl-2">
                <span
                  className={cn(
                    "text-muted-foreground block rounded-md border border-dashed py-2.5 text-sm",
                    grid.rowTotals[r] === null && "opacity-40"
                  )}
                >
                  {grid.rowTotals[r] === null ? "—" : fmt(grid.rowTotals[r] as number)}
                </span>
              </td>
            </tr>
          ))}
          <tr>
            {[0, 1, 2].map((c) => (
              <td key={c} className="pt-2">
                <span className="text-muted-foreground block rounded-md border border-dashed py-2.5 text-sm">
                  {grid.colTotals[c] === null ? "—" : fmt(grid.colTotals[c] as number)}
                </span>
              </td>
            ))}
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export function CalculTest() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [theme, setTheme] = React.useState<CalcTheme>("melange");
  const [levelChoice, setLevelChoice] = React.useState<CalcLevelChoice>("progressif");
  const [format, setFormat] = React.useState<CalcFormatKey>("officiel");
  const [training, setTraining] = React.useState(false);
  const [seed, setSeed] = React.useState(1);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [checked, setChecked] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const deadlineRef = React.useRef(0);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  const size = CALC_FORMATS[format].size;

  /** La question de rang `i` — recalculée, jamais stockée. */
  const questionFor = React.useCallback(
    (i: number): CalcQuestion => questionAt(seed, i, theme, levelChoice, size),
    [seed, theme, levelChoice, size]
  );

  const sessionRef = React.useRef<{
    answers: (number | null)[];
    theme: CalcTheme;
    format: CalcFormatKey;
    training: boolean;
    questionFor: (i: number) => CalcQuestion;
  }>({ answers: [], theme: "melange", format: "officiel", training: false, questionFor });

  React.useEffect(() => {
    sessionRef.current = { answers, theme, format, training, questionFor };
  }, [answers, theme, format, training, questionFor]);

  const finish = React.useCallback(() => {
    const current = sessionRef.current;
    const asked = current.answers.map((_, i) => current.questionFor(i));
    const score = scoreCalcSession(asked, current.answers);
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      theme: current.theme,
      format: current.format,
      correct: score.correct,
      answered: score.answered,
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
    if (phase !== "playing") return;
    const duration = CALC_FORMATS[format].durationSeconds;
    if (duration === null) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        finish();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, format, finish]);

  const start = React.useCallback(
    (
      chosenTheme: CalcTheme,
      chosenLevel: CalcLevelChoice,
      chosenFormat: CalcFormatKey,
      isTraining: boolean
    ) => {
      const chosenSize = CALC_FORMATS[chosenFormat].size;
      const duration = CALC_FORMATS[chosenFormat].durationSeconds;
      setTheme(chosenTheme);
      setLevelChoice(chosenLevel);
      setFormat(chosenFormat);
      setTraining(isTraining);
      setSeed(Math.floor(Math.random() * 1_000_000_000));
      setIndex(0);
      setAnswers(chosenSize === null ? [null] : Array.from({ length: chosenSize }, () => null));
      setChecked(false);
      if (duration !== null) {
        deadlineRef.current = Date.now() + duration * 1000;
        setRemaining(duration);
      }
      setPhase("playing");
    },
    []
  );

  const current = phase === "playing" ? questionFor(index) : null;
  const answer = answers[index] ?? null;

  function choose(choiceIndex: number) {
    if (checked) return;
    setAnswers((previous) => previous.map((a, i) => (i === index ? choiceIndex : a)));
    if (training) setChecked(true);
  }

  function goNext() {
    if (size !== null && index + 1 >= size) {
      finish();
      return;
    }
    // Sans fin : on allonge la liste des réponses au fur et à mesure.
    if (size === null) setAnswers((previous) => [...previous, null]);
    setIndex(index + 1);
    setChecked(false);
  }

  // --- Intro ---------------------------------------------------------------
  if (phase === "intro") {
    const themeInfo = CALC_THEMES.find((t) => t.theme === theme);
    const levelInfo = LEVEL_CHOICES.find((l) => l.value === levelChoice);
    const formatInfo = CALC_FORMATS[format];
    const others = CALC_THEMES.filter((t) => t.theme !== "melange");
    const mixed = CALC_THEMES.find((t) => t.theme === "melange");

    /** Une carte de thème : icône, nom, et un vrai calcul en guise de vitrine. */
    const themeCard = (info: (typeof CALC_THEMES)[number], featured = false) => {
      const Icon = THEME_ICONS[info.theme];
      const selected = theme === info.theme;
      return (
        <button
          key={info.theme}
          type="button"
          onClick={() => setTheme(info.theme)}
          aria-pressed={selected}
          className={cn(
            "focus-visible:ring-ring group rounded-xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:outline-none",
            selected
              ? "border-primary bg-primary/5 ring-primary/25 shadow-sm ring-2"
              : "hover:border-primary/50 hover:shadow-sm",
            featured && "sm:col-span-2 lg:col-span-3"
          )}
        >
          <span className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon aria-hidden className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{info.label}</span>
              <span className="text-muted-foreground mt-0.5 block text-sm">{info.hint}</span>
              <span
                className={cn(
                  "mt-2 inline-block rounded-md px-2 py-1 font-mono text-sm tabular-nums",
                  selected ? "bg-primary/10 text-primary" : "bg-muted/70 text-muted-foreground"
                )}
              >
                {THEME_EXAMPLES[info.theme]}
              </span>
            </span>
          </span>
        </button>
      );
    };

    return (
      <div className="space-y-8">
        <section className="space-y-3">
          <SectionTitle aside="Le calcul que vous rencontrerez">Le thème</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mixed ? themeCard(mixed, true) : null}
            {others.map((info) => themeCard(info))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-3">
            <SectionTitle>Le niveau</SectionTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEVEL_CHOICES.map((info) => (
                <button
                  key={String(info.value)}
                  type="button"
                  onClick={() => setLevelChoice(info.value)}
                  aria-pressed={levelChoice === info.value}
                  className={cn(
                    "focus-visible:ring-ring rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    levelChoice === info.value
                      ? "border-primary bg-primary/5 text-primary ring-primary/25 ring-2"
                      : "hover:border-primary/50"
                  )}
                >
                  {info.label}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">{levelInfo?.hint}</p>
          </section>

          <section className="space-y-3">
            <SectionTitle>La longueur</SectionTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CALC_FORMAT_LIST.map((info) => (
                <button
                  key={info.key}
                  type="button"
                  onClick={() => setFormat(info.key)}
                  aria-pressed={format === info.key}
                  className={cn(
                    "focus-visible:ring-ring rounded-lg border px-3 py-2.5 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    format === info.key
                      ? "border-primary bg-primary/5 text-primary ring-primary/25 ring-2"
                      : "hover:border-primary/50"
                  )}
                >
                  <span className="block text-sm font-semibold">{info.label}</span>
                  <span className="text-muted-foreground mt-0.5 flex items-center justify-center gap-1 text-xs tabular-nums">
                    {info.size === null ? (
                      <>
                        <InfinityIcon aria-hidden className="size-3.5" />
                        sans limite
                      </>
                    ) : (
                      `${info.size} questions`
                    )}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">{formatInfo.hint}</p>
          </section>
        </div>

        {/* Un seul point de départ. Le mode est une bascule, pas un doublement
            des boutons de lancement. */}
        <section className="border-primary/30 bg-primary/5 rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Votre session
              </p>
              <p className="mt-1 text-base font-semibold">
                {themeInfo?.label} · {levelInfo?.label} ·{" "}
                {formatInfo.size === null
                  ? "sans fin"
                  : `${formatInfo.size} questions${
                      formatInfo.durationSeconds !== null
                        ? ` en ${formatDuration(formatInfo.durationSeconds)}`
                        : ""
                    }`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Mode"
                className="bg-background flex rounded-lg border p-0.5"
              >
                {[
                  { value: false, label: "Test" },
                  { value: true, label: "Entraînement" },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setTraining(option.value)}
                    aria-pressed={training === option.value}
                    className={cn(
                      "focus-visible:ring-ring rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
                      training === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button size="lg" onClick={() => start(theme, levelChoice, format, training)}>
                Commencer
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            {training
              ? "La réponse et la méthode s’affichent après chaque question — le mode à prendre pour enchaîner sans fin."
              : "Aucune correction avant la fin, comme à l’épreuve. Le chronomètre tourne."}
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">Quatre propositions, aucun brouillon</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Comme à l’épreuve. Tout se fait de tête, y compris les décimaux.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Encadrer plutôt que calculer</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              La plupart des questions ne demandent <strong>pas le résultat exact</strong> : le bon
              ordre de grandeur suffit, et c’est ce qui fait gagner du temps.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Des faux plausibles</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Virgule décalée, retenue oubliée, opération inversée : aucune proposition ne s’élimine
              sans réfléchir.
            </p>
          </div>
        </section>

        {history.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Vos dernières sessions</SectionTitle>
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
                        {CALC_THEMES.find((t) => t.theme === entry.theme)?.label ?? entry.theme}
                        <span className="text-muted-foreground">
                          {" · "}
                          {CALC_FORMATS[entry.format].label}
                          {entry.training ? " · entraînement" : ""}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-semibold tabular-nums">
                        {entry.correct}/{entry.answered}
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
            <strong className="text-foreground">Reconstitution pédagogique.</strong> Les calculs
            sont générés par nos propres règles, au format de l’épreuve (24 questions en 8 minutes,
            quatre propositions). Sans lien avec le sujet officiel.
          </p>
        </div>
      </div>
    );
  }

  // --- Bilan ---------------------------------------------------------------
  if (phase === "done") {
    const asked = answers.map((_, i) => questionFor(i));
    const score = scoreCalcSession(asked, answers);
    // Sans fin, personne ne relit deux cents bonnes réponses : on ne montre
    // que ce qui a été manqué.
    const onlyMistakes = size === null || asked.length > 30;
    const reviewed = asked
      .map((question, i) => ({ question, i }))
      .filter(({ question, i }) => !onlyMistakes || answers[i] !== question.correctIndex);

    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-5 text-center">
          <p className="text-muted-foreground text-sm">
            {CALC_THEMES.find((t) => t.theme === theme)?.label} · {CALC_FORMATS[format].label}
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
            <span className="text-muted-foreground text-2xl">/{score.answered}</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {score.precision} % de réussite · meilleure série : {score.bestStreak}
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {onlyMistakes ? "Ce que vous avez manqué" : "Correction"}
          </h2>
          {reviewed.length === 0 ? (
            <p className="text-success text-sm font-semibold">
              Aucune erreur — rien à revoir sur cette session.
            </p>
          ) : null}
          {reviewed.map(({ question, i }) => {
            const given = answers[i];
            const right = given === question.correctIndex;
            return (
              <div key={i} className="bg-card rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Question {i + 1}
                    <span className="text-muted-foreground font-normal">
                      {" · "}
                      {CALC_THEMES.find((t) => t.theme === question.theme)?.label} · niveau{" "}
                      {question.level}
                    </span>
                  </p>
                  <span className="flex flex-wrap items-center gap-2">
                    {!right ? (
                      <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold">
                        {given === null
                          ? "Non traité"
                          : `Vous aviez répondu ${question.choices[given]}`}
                      </span>
                    ) : null}
                    <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {right
                        ? `Juste — ${question.choices[question.correctIndex]}`
                        : `Bonne réponse : ${question.choices[question.correctIndex]}`}
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-base font-medium">{question.prompt}</p>
                {question.grid ? (
                  <div className="mt-3">
                    <CalcGridView grid={question.grid} />
                  </div>
                ) : null}
                <p className="text-muted-foreground mt-2 text-sm">
                  <strong className="text-foreground">La méthode :</strong> {question.method}
                </p>
              </div>
            );
          })}
        </section>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => start(theme, levelChoice, format, training)}>Recommencer</Button>
          <Button variant="outline" onClick={() => setPhase("intro")}>
            Changer de réglages
          </Button>
          <Button variant="outline" asChild>
            <Link href="/psychotechnique/exercices/le-calcul-mental">Lire la méthode</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Session -------------------------------------------------------------
  if (!current) return null;
  const right = checked && answer === current.correctIndex;
  const doneSoFar = answers.filter((a) => a !== null).length;
  const correctSoFar = answers.filter(
    (a, i) => a !== null && a === questionFor(i).correctIndex
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Question {index + 1}
          {size !== null ? (
            <span className="text-muted-foreground font-normal"> / {size}</span>
          ) : null}
          <span className="text-muted-foreground font-normal">
            {" · "}
            {CALC_THEMES.find((t) => t.theme === current.theme)?.label} · niveau {current.level}
          </span>
        </p>
        {CALC_FORMATS[format].durationSeconds !== null ? (
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              remaining <= 30 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {formatDuration(remaining)}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm tabular-nums">
            {doneSoFar} traitée{doneSoFar > 1 ? "s" : ""}
            {doneSoFar > 0 ? ` · ${Math.round((correctSoFar / doneSoFar) * 100)} % de justes` : ""}
          </span>
        )}
      </div>

      <div className="bg-muted/20 rounded-2xl border p-5 sm:p-8">
        <p className="text-center text-2xl font-semibold tabular-nums sm:text-3xl">
          {current.prompt}
        </p>
        {current.grid ? (
          <div className="mt-5">
            <CalcGridView grid={current.grid} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {current.choices.map((choice, i) => {
          const selected = answer === i;
          const isRight = checked && i === current.correctIndex;
          const isWrong = checked && selected && i !== current.correctIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              aria-pressed={selected}
              className={cn(
                "focus-visible:ring-ring rounded-lg border px-4 py-3 text-lg font-semibold tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none",
                selected && !checked && "border-primary bg-primary/5 ring-primary/30 ring-2",
                !selected && !checked && "hover:border-primary/50",
                isRight && "border-success bg-success/10 text-success",
                isWrong && "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              {choice}
            </button>
          );
        })}
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
              ? `Juste — ${current.choices[current.correctIndex]}.`
              : `Faux — la réponse était ${current.choices[current.correctIndex]}.`}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{current.method}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={goNext} disabled={!training && answer === null}>
          {size !== null && index + 1 >= size ? "Terminer" : "Question suivante"}
        </Button>
        {size === null ? (
          <Button variant="outline" onClick={finish}>
            Arrêter et voir le bilan
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => setPhase("intro")}>
          Abandonner
        </Button>
      </div>
    </div>
  );
}
