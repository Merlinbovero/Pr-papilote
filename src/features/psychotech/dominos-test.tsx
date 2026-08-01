"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ModeSeance } from "@/features/banc/mode-seance";
import { DominoHalfTile, DominoSeries, DominoTile } from "@/features/psychotech/domino-tile";
import {
  buildDominoSession,
  DOMINO_LEVEL_LIST,
  DOMINO_LEVELS,
  EMPTY_ANSWER,
  isComplete,
  scoreDominoSession,
  verdictFor,
  type DominoAnswer,
  type DominoLevel,
  type DominoPuzzle,
} from "@/lib/psychotech/dominos";
import { cn } from "@/lib/utils";

/**
 * Test de dominos — écran d’intro et tutoriel, dix séries, bilan.
 *
 * La réponse se **compose** sur un pavé (une rangée pour le haut, une pour le
 * bas) : aucune proposition à éliminer, donc aucune bonne réponse trouvée par
 * hasard, exactement comme sur la feuille du test papier. Toute la logique
 * (génération, règles, notation) vit dans `src/lib/psychotech/dominos.ts`.
 */

type Phase = "intro" | "playing" | "done";

const HISTORY_KEY = "pp.dominos.history.v1";
const HISTORY_LIMIT = 10;

interface HistoryEntry {
  date: string;
  level: DominoLevel;
  correct: number;
  total: number;
  training: boolean;
  secondsUsed: number;
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

// ---------------------------------------------------------------------------
// Pavé de saisie
// ---------------------------------------------------------------------------

/** Une touche du pavé : la moitié de domino dessinée, pas un chiffre écrit. */
function PadKey({
  value,
  selected,
  onSelect,
  half,
}: {
  value: number;
  selected: boolean;
  onSelect: (value: number) => void;
  half: "haut" | "bas";
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      aria-label={`${value} en ${half}`}
      className={cn(
        "focus-visible:ring-ring rounded-md border p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none",
        selected ? "border-primary bg-primary/10 ring-primary/30 ring-2" : "hover:border-primary/50"
      )}
    >
      <DominoHalfTile value={value} size={30} />
    </button>
  );
}

function AnswerPad({
  answer,
  onChange,
  disabled,
}: {
  answer: DominoAnswer;
  onChange: (next: DominoAnswer) => void;
  disabled: boolean;
}) {
  const values = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className={cn("space-y-3", disabled && "pointer-events-none opacity-50")}>
      <div>
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
          Moitié du haut
        </p>
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <PadKey
              key={v}
              value={v}
              half="haut"
              selected={answer.top === v}
              onSelect={(value) => onChange({ ...answer, top: value })}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
          Moitié du bas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <PadKey
              key={v}
              value={v}
              half="bas"
              selected={answer.bottom === v}
              onSelect={(value) => onChange({ ...answer, bottom: value })}
            />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        La moitié vide vaut <strong>0</strong> — c’est le blanc du domino, et il suit le 6.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comparatif de correction
// ---------------------------------------------------------------------------

/**
 * Ce que l’on a répondu, face à ce qu’il fallait.
 *
 * Sans ce bloc, la tuile révélée dans la série — la **bonne** réponse — était
 * teintée en rouge quand on s’était trompé : on croyait lire son erreur alors
 * qu’on lisait la solution. La série montre désormais toujours la bonne tuile
 * en vert, et l’erreur est mise en regard, nommée.
 */
function AnswerComparison({
  answer,
  solution,
}: {
  answer: DominoAnswer | undefined;
  solution: { top: number; bottom: number };
}) {
  const given = answer && isComplete(answer) ? answer : null;
  return (
    <div className="bg-muted/20 mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Votre réponse
        </span>
        {given ? (
          <DominoTile
            domino={given}
            size={34}
            tone="wrong"
            label={`Votre réponse : ${given.top} sur ${given.bottom}`}
          />
        ) : (
          <span className="text-muted-foreground text-sm italic">non traité</span>
        )}
      </div>
      <span aria-hidden className="text-muted-foreground text-lg">
        →
      </span>
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          La bonne réponse
        </span>
        <DominoTile
          domino={solution}
          size={34}
          tone="correct"
          label={`La bonne réponse : ${solution.top} sur ${solution.bottom}`}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tutoriel
// ---------------------------------------------------------------------------

/** Exemple commenté, tracé par le même moteur que le test. */
const TUTORIAL_PUZZLE: DominoPuzzle = {
  level: 1,
  layout: "ligne",
  tiles: [
    { top: 1, bottom: 6 },
    { top: 2, bottom: 5 },
    { top: 3, bottom: 4 },
    { top: 4, bottom: 3 },
  ],
  places: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ],
  edges: [],
  missingIndex: 3,
  solution: { top: 4, bottom: 3 },
  rule: "Le haut monte de 1, le bas descend de 1.",
};

function DominosTutorial() {
  return (
    <section className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Comment ça marche</h2>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">
        Une série de dominos suit une règle. Une tuile est masquée : à vous de la reconstituer. La
        règle la plus fréquente traite <strong>les deux moitiés séparément</strong> — commencez donc
        toujours par lire la ligne du haut seule, puis celle du bas seule.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="bg-muted/30 rounded-lg border p-4">
          <DominoSeries puzzle={TUTORIAL_PUZZLE} tileSize={42} />
        </div>
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-foreground font-semibold">Les hauts</span> :{" "}
            <span className="tabular-nums">1 · 2 · 3 · ?</span> — ils montent de 1, le haut manquant
            vaut donc <strong>4</strong>.
          </p>
          <p>
            <span className="text-foreground font-semibold">Les bas</span> :{" "}
            <span className="tabular-nums">6 · 5 · 4 · ?</span> — ils descendent de 1, le bas vaut{" "}
            <strong>3</strong>.
          </p>
          <p className="text-muted-foreground">
            On compose alors <strong>4 sur 3</strong> au pavé. Une tuile n’est comptée juste que si{" "}
            <strong>ses deux moitiés</strong> le sont.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold">Le blanc vaut 0</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Une moitié vide n’est pas une case vide : elle vaut <strong>zéro</strong>. Et
            l’arithmétique boucle — après 6 vient 0, avant 0 vient 6.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Suivez les liens</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            En ligne ou en grille, on lit de gauche à droite puis de haut en bas. Dès que la
            disposition sort de l’ordinaire, un <strong>trait pointillé</strong> donne l’ordre de
            lecture : la règle peut être retorse, jamais le chemin.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Quand rien ne marche</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Si aucune moitié ne progresse seule, cherchez la relation <strong>entre</strong> les
            deux : leur somme, leur écart, ou le fait qu’une moitié reprenne celle de la tuile
            précédente.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export interface DominosTestProps {
  /**
   * En-tête de page — titre, chapeau et fiche MÉTHODE — confié à la séance
   * pour qu'il **se replie au lancement**. Mesuré avant migration, le premier
   * contrôle de réponse tombait à 1 004 px sur un écran de 900 et à 962 px sur
   * un écran de 844.
   */
  entete?: React.ReactNode;
}

export function DominosTest({ entete }: DominosTestProps = {}) {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [level, setLevel] = React.useState<DominoLevel>(1);
  const [training, setTraining] = React.useState(false);
  const [puzzles, setPuzzles] = React.useState<DominoPuzzle[]>([]);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<DominoAnswer[]>([]);
  const [checked, setChecked] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const deadlineRef = React.useRef(0);
  const startedAtRef = React.useRef(0);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  // La session en cours, lisible depuis le chronomètre sans le faire dépendre
  // de l'état React (et donc sans le relancer à chaque réponse saisie).
  const sessionRef = React.useRef<{
    puzzles: DominoPuzzle[];
    answers: DominoAnswer[];
    level: DominoLevel;
    training: boolean;
  }>({ puzzles: [], answers: [], level: 1, training: false });

  React.useEffect(() => {
    sessionRef.current = { puzzles, answers, level, training };
  }, [puzzles, answers, level, training]);

  const finish = React.useCallback(() => {
    const {
      puzzles: played,
      answers: given,
      level: playedLevel,
      training: wasTraining,
    } = sessionRef.current;
    const score = scoreDominoSession(played, given);
    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      level: playedLevel,
      correct: score.correct,
      total: score.total,
      training: wasTraining,
      secondsUsed: Math.round((Date.now() - startedAtRef.current) / 1000),
    };
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, HISTORY_LIMIT);
      saveHistory(next);
      return next;
    });
    setPhase("done");
  }, []);

  // Chronomètre de session : une échéance, un intervalle, et l'état ne change
  // que dans la callback.
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

  const start = React.useCallback((playedLevel: DominoLevel, isTraining: boolean) => {
    const session = buildDominoSession(Math.floor(Math.random() * 1_000_000_000), playedLevel);
    setLevel(playedLevel);
    setTraining(isTraining);
    setPuzzles(session);
    setAnswers(session.map(() => ({ ...EMPTY_ANSWER })));
    setIndex(0);
    setChecked(false);
    startedAtRef.current = Date.now();
    deadlineRef.current = Date.now() + DOMINO_LEVELS[playedLevel].durationSeconds * 1000;
    setRemaining(DOMINO_LEVELS[playedLevel].durationSeconds);
    setPhase("playing");
  }, []);

  const current = puzzles[index];
  const answer = answers[index] ?? EMPTY_ANSWER;

  function setAnswer(next: DominoAnswer) {
    setAnswers((previous) => previous.map((a, i) => (i === index ? next : a)));
  }

  function goNext() {
    if (index + 1 >= puzzles.length) {
      finish();
      return;
    }
    setIndex(index + 1);
    setChecked(false);
  }

  /*
    Les trois écrans sont calculés en toutes phases — lot F7b. `ModeSeance` ne
    démonte pas l'introduction, il la masque : « Revoir les consignes » doit
    pouvoir la ramener sans rien reconstruire.
  */
  const bestByLevel = new Map<DominoLevel, number>();
  for (const entry of history) {
    if (entry.training) continue;
    bestByLevel.set(entry.level, Math.max(bestByLevel.get(entry.level) ?? 0, entry.correct));
  }
  const ecranIntro = (
    <div className="space-y-6">
      {entete}
      <DominosTutorial />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Choisissez un niveau</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {DOMINO_LEVEL_LIST.map((info) => {
            const best = bestByLevel.get(info.level);
            return (
              <div key={info.level} className="bg-card flex flex-col rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Niveau {info.level}
                </p>
                <p className="mt-0.5 text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 flex-1 text-sm">{info.hint}</p>
                <p className="text-muted-foreground mt-3 text-sm tabular-nums">
                  {info.size} dominos · {formatDuration(info.durationSeconds)}
                </p>
                {best !== undefined ? (
                  <p className="text-success mt-1 text-sm font-semibold tabular-nums">
                    Record : {best}/{info.size}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => start(info.level, false)}>
                    Lancer le test
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => start(info.level, true)}>
                    Entraînement
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground text-sm">
          En <strong>mode entraînement</strong>, pas de chronomètre : la règle vous est expliquée
          après chaque domino.
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
                      Niveau {entry.level} · {DOMINO_LEVELS[entry.level].label}
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
          <strong className="text-foreground">Reconstitution pédagogique.</strong> Les dominos ont
          été <strong>retirés de la sélection EOPAN en 2025</strong> mais restent au programme
          d’autres sélections et concourent à la même aptitude — le raisonnement logique sur deux
          variables simultanées.
        </p>
      </div>
    </div>
  );

  // --- Bilan ---------------------------------------------------------------
  const score = scoreDominoSession(puzzles, answers);
  const info = DOMINO_LEVELS[level];
  const ecranBilan = (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-5 text-center">
        <p className="text-muted-foreground text-sm">
          Niveau {info.level} · {info.label}
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
          {score.halvesCorrect} moitiés justes sur {score.total * 2} — une tuile ne compte que si
          les deux le sont.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Correction</h2>
        {puzzles.map((puzzle, i) => {
          const verdict = verdictFor(answers[i] ?? EMPTY_ANSWER, puzzle.solution);
          return (
            <div key={i} className="bg-card rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Domino {i + 1}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    verdict.correct
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {verdict.correct ? "Juste" : "Faux"}
                </span>
              </div>
              <div className="mt-3">
                <DominoSeries
                  puzzle={puzzle}
                  tileSize={38}
                  revealed={{ domino: puzzle.solution, tone: "correct" }}
                />
              </div>
              {!verdict.correct ? (
                <AnswerComparison answer={answers[i]} solution={puzzle.solution} />
              ) : null}
              <p className="text-muted-foreground mt-2 text-sm">
                <strong className="text-foreground">La règle :</strong> {puzzle.rule}
              </p>
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => start(level, training)}>Refaire ce niveau</Button>
        <Button variant="outline" onClick={() => setPhase("intro")}>
          Changer de niveau
        </Button>
        <Button variant="outline" asChild>
          <Link href="/psychotechnique/exercices/les-dominos">Lire la méthode</Link>
        </Button>
      </div>
    </div>
  );

  /*
    GARDE EXPLICITE : hors séance, `puzzles` est vide et `current` vaut
    `undefined`. Les sorties anticipées protégeaient ce code ; calculés en
    toutes phases, ces écrans perdent cette protection.
  */
  const verdict = checked && current ? verdictFor(answer, current.solution) : null;
  const ecranSession = !current ? null : (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Domino {index + 1}
          <span className="text-muted-foreground font-normal"> / {puzzles.length}</span>
          <span className="text-muted-foreground font-normal">
            {" "}
            · niveau {level} · {DOMINO_LEVELS[level].label}
          </span>
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

      <div className="bg-muted/20 rounded-2xl border p-4 sm:p-6">
        <DominoSeries
          puzzle={current}
          answer={answer}
          tileSize={52}
          revealed={verdict ? { domino: current.solution, tone: "correct" } : undefined}
        />
      </div>

      <AnswerPad answer={answer} onChange={setAnswer} disabled={checked} />

      {verdict ? (
        <div
          className={cn(
            "rounded-lg border p-4",
            verdict.correct
              ? "border-success/40 bg-success/5"
              : "border-destructive/40 bg-destructive/5"
          )}
        >
          <p className="text-sm font-semibold">{verdict.correct ? "Juste." : "Faux."}</p>
          {!verdict.correct ? (
            <AnswerComparison answer={answer} solution={current.solution} />
          ) : null}
          <p className="text-muted-foreground mt-2 text-sm">{current.rule}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {training && !checked ? (
          <Button onClick={() => setChecked(true)} disabled={!isComplete(answer)}>
            Valider
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!training && !isComplete(answer)}>
            {index + 1 >= puzzles.length ? "Terminer" : "Domino suivant"}
          </Button>
        )}
      </div>
    </div>
  );

  /*
    Mode séance CONTRÔLÉ : l'épreuve se lance par l'un des trois boutons de
    niveau de sa présentation. « Abandonner » cède la place à « Quitter la
    séance », au même endroit sur toutes les routes du Banc.
  */
  return (
    <ModeSeance
      enSeance={phase !== "intro"}
      labelSeance="Test de dominos"
      onSortie={() => setPhase("intro")}
      introduction={ecranIntro}
    >
      {phase === "done" ? ecranBilan : ecranSession}
    </ModeSeance>
  );
}
