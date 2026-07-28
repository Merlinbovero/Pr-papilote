"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScenePlan } from "@/features/psychotech/camera-plan";
import { SceneImage, usePreloadScene } from "@/features/psychotech/camera-scene";
import {
  buildCameraSession,
  CAMERA_FORMATS,
  generateCameraPuzzle,
  scoreCameraSession,
  type CameraFormatKey,
  type CameraPuzzle,
} from "@/lib/psychotech/cameras";
import { cn } from "@/lib/utils";

/**
 * Test des appareils photos — écran d’intro et tutoriel, session chronométrée,
 * bilan commenté.
 *
 * Toute la génération (scènes, appareils, garantie d’unicité de la réponse)
 * vit dans `src/lib/psychotech/cameras.ts` ; le rendu 3D dans `camera-scene`.
 * Ce fichier n’orchestre que l’enchaînement.
 */

type Phase = "intro" | "playing" | "done";

const HISTORY_KEY = "pp.appareils.history.v1";
const HISTORY_LIMIT = 10;

interface HistoryEntry {
  date: string;
  format: CameraFormatKey;
  correct: number;
  total: number;
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

// ---------------------------------------------------------------------------
// Tutoriel
// ---------------------------------------------------------------------------

/** Exemple fixe, produit par le même générateur que le test. */
const TUTORIAL_PUZZLE = generateCameraPuzzle(4242, 1);

function CamerasTutorial() {
  const answer = TUTORIAL_PUZZLE.cameras[TUTORIAL_PUZZLE.answerIndex].label;
  return (
    <section className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Comment ça marche</h2>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">
        À gauche, une scène et <strong>trois appareils numérotés</strong>, chacun à sa place et
        tourné dans sa direction. À droite, <strong>une seule photo</strong> de cette scène. Lequel
        des trois l’a prise ?
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            La scène et les trois appareils
          </p>
          <SceneImage
            puzzle={TUTORIAL_PUZZLE}
            kind={{ mode: "overview" }}
            alt="Exemple : la scène vue de biais, avec les trois appareils photo numérotés et leur cône de visée."
          />
        </div>
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            La photo à identifier
          </p>
          <SceneImage
            puzzle={TUTORIAL_PUZZLE}
            kind={{ mode: "view", cameraIndex: TUTORIAL_PUZZLE.answerIndex }}
            alt="Exemple : la vue prise par l’un des trois appareils."
          />
        </div>
      </div>

      <p className="text-muted-foreground mt-3 text-sm">
        Ici, c’est l’<strong>appareil {answer}</strong>. {TUTORIAL_PUZZLE.explanation}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold">Lisez l’ordre, pas les objets</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Ne cherchez pas à reconnaître chaque forme : regardez dans quel <strong>ordre</strong>{" "}
            elles se présentent de gauche à droite. Faire le tour de la scène par la pensée inverse
            cet ordre.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Ce qui masque quoi</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            C’est le piège classique de l’épreuve : un objet qu’on croyait caché apparaît, ou
            l’inverse. Une seule <strong>occultation</strong> suffit souvent à éliminer deux
            appareils d’un coup.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Éliminez, ne devinez pas</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Écartez d’abord l’appareil manifestement faux, puis départagez les deux restants sur un
            détail asymétrique. Vous avez <strong>16 secondes</strong> par vue : c’est court, mais
            suffisant pour deux éliminations.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export function CamerasTest() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [format, setFormat] = React.useState<CameraFormatKey>("officiel");
  const [training, setTraining] = React.useState(false);
  const [puzzles, setPuzzles] = React.useState<CameraPuzzle[]>([]);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [checked, setChecked] = React.useState(false);
  const [showPlan, setShowPlan] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const deadlineRef = React.useRef(0);

  usePreloadScene();

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  const sessionRef = React.useRef<{
    puzzles: CameraPuzzle[];
    answers: (number | null)[];
    format: CameraFormatKey;
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
    const score = scoreCameraSession(played, given);
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

  const start = React.useCallback((key: CameraFormatKey, isTraining: boolean) => {
    const session = buildCameraSession(Math.floor(Math.random() * 1_000_000_000), key);
    setFormat(key);
    setTraining(isTraining);
    setPuzzles(session);
    setAnswers(session.map(() => null));
    setIndex(0);
    setChecked(false);
    setShowPlan(false);
    deadlineRef.current = Date.now() + CAMERA_FORMATS[key].durationSeconds * 1000;
    setRemaining(CAMERA_FORMATS[key].durationSeconds);
    setPhase("playing");
  }, []);

  const current = puzzles[index];
  const answer = answers[index] ?? null;

  function choose(cameraIndex: number) {
    if (checked) return;
    setAnswers((previous) => previous.map((a, i) => (i === index ? cameraIndex : a)));
    if (training) setChecked(true);
  }

  function goNext() {
    if (index + 1 >= puzzles.length) {
      finish();
      return;
    }
    setIndex(index + 1);
    setChecked(false);
    setShowPlan(false);
  }

  // --- Intro ---------------------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <CamerasTutorial />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Lancer une session</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(CAMERA_FORMATS).map((info) => (
              <div key={info.key} className="bg-card flex flex-col rounded-lg border p-4">
                <p className="text-base font-semibold">{info.label}</p>
                <p className="text-muted-foreground mt-1 flex-1 text-sm">{info.hint}</p>
                <p className="text-muted-foreground mt-2 text-sm tabular-nums">
                  {info.size} vues · {formatDuration(info.durationSeconds)}
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
            après chaque vue, et le <strong>plan de la scène</strong> reste consultable. En test, il
            n’est disponible que sur le premier tiers — apprendre à s’en passer fait partie de
            l’exercice.
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
                        {CAMERA_FORMATS[entry.format].label}
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
            reproduit le <em>principe</em> du test des appareils photos (visualisation dans l’espace
            et projection en 3D) avec nos propres scènes. Sans lien avec le logiciel officiel des
            armées.
          </p>
        </div>
      </div>
    );
  }

  // --- Bilan ---------------------------------------------------------------
  if (phase === "done") {
    const score = scoreCameraSession(puzzles, answers);
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-5 text-center">
          <p className="text-muted-foreground text-sm">
            {CAMERA_FORMATS[format].label}
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
            {score.answered} vue{score.answered > 1 ? "s" : ""} traitée
            {score.answered > 1 ? "s" : ""} sur {score.total}.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Correction</h2>
          {puzzles.map((puzzle, i) => {
            const given = answers[i];
            const right = given === puzzle.answerIndex;
            const goodLabel = puzzle.cameras[puzzle.answerIndex].label;
            return (
              <div key={i} className="bg-card rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Vue {i + 1}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · niveau {puzzle.level}
                    </span>
                  </p>
                  {/* La bonne réponse est annoncée ici, en clair : elle ne doit
                      pas se chercher dans le paragraphe d’explication. */}
                  <span className="flex flex-wrap items-center gap-2">
                    {!right ? (
                      <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-semibold">
                        {given === null
                          ? "Non traité"
                          : `Vous aviez répondu appareil ${puzzle.cameras[given].label}`}
                      </span>
                    ) : null}
                    <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {right
                        ? `Juste — appareil ${goodLabel}`
                        : `Bonne réponse : appareil ${goodLabel}`}
                    </span>
                  </span>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                        La scène
                      </p>
                      <SceneImage
                        puzzle={puzzle}
                        kind={{ mode: "overview" }}
                        alt={`Vue ${i + 1} : la scène et les trois appareils.`}
                      />
                    </div>
                    <div>
                      <p className="text-success mb-1 text-xs font-semibold tracking-wide uppercase">
                        La photo — appareil {goodLabel}
                      </p>
                      <SceneImage
                        puzzle={puzzle}
                        kind={{ mode: "view", cameraIndex: puzzle.answerIndex }}
                        alt={`Vue ${i + 1} : la photo montrée, prise par l’appareil ${goodLabel}.`}
                        className="ring-success/60 ring-2"
                      />
                    </div>
                  </div>
                  <div className="lg:w-44">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                      Le plan
                    </p>
                    <ScenePlan
                      puzzle={puzzle}
                      correctLabel={goodLabel}
                      chosenLabel={given !== null ? puzzle.cameras[given].label : undefined}
                    />
                  </div>
                </div>

                {/* S’être trompé s’explique mieux en voyant ce que l’appareil
                    choisi aurait donné : la comparaison est plus parlante que
                    n’importe quelle phrase. */}
                {!right && given !== null ? (
                  <div className="mt-3">
                    <p className="text-destructive mb-1 text-xs font-semibold tracking-wide uppercase">
                      Ce qu’aurait donné l’appareil {puzzle.cameras[given].label}, votre réponse
                    </p>
                    <div className="sm:max-w-sm">
                      <SceneImage
                        puzzle={puzzle}
                        kind={{ mode: "view", cameraIndex: given }}
                        alt={`Ce que l’appareil ${puzzle.cameras[given].label} aurait photographié.`}
                        className="ring-destructive/50 ring-2"
                      />
                    </div>
                  </div>
                ) : null}

                <p className="text-muted-foreground mt-3 text-sm">
                  <strong className="text-foreground">Appareil {goodLabel}.</strong>{" "}
                  {puzzle.explanation}
                </p>
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
            <Link href="/psychotechnique/exercices/le-test-des-appareils-photos">
              Lire la méthode
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Session -------------------------------------------------------------
  const planAllowed = training || index < puzzles.length / 3;
  const right = checked && answer === current.answerIndex;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Vue {index + 1}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            La scène et les trois appareils
          </p>
          <SceneImage
            puzzle={current}
            kind={{ mode: "overview" }}
            alt="La scène vue de biais, avec les trois appareils photo numérotés et leur cône de visée."
          />
        </div>
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            La photo à identifier
          </p>
          <SceneImage
            puzzle={current}
            kind={{ mode: "view", cameraIndex: current.answerIndex }}
            alt="La photo prise par l’un des trois appareils."
          />
        </div>
      </div>

      {planAllowed ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setShowPlan((v) => !v)}>
            {showPlan ? "Masquer le plan" : "Voir le plan de dessus"}
          </Button>
          {showPlan ? (
            <div className="mt-2 max-w-xs">
              <ScenePlan puzzle={current} />
            </div>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-semibold">Quel appareil a pris cette photo ?</p>
        <div className="flex flex-wrap gap-2">
          {current.cameras.map((cam, i) => {
            const selected = answer === i;
            const isRight = checked && i === current.answerIndex;
            const isWrong = checked && selected && i !== current.answerIndex;
            return (
              <button
                key={cam.label}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={selected}
                className={cn(
                  "focus-visible:ring-ring rounded-lg border px-5 py-3 text-base font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  selected && !checked && "border-primary bg-primary/5 ring-primary/30 ring-2",
                  !selected && !checked && "hover:border-primary/50",
                  isRight && "border-success bg-success/10 text-success",
                  isWrong && "border-destructive bg-destructive/10 text-destructive"
                )}
              >
                Appareil {cam.label}
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
              ? `Juste — appareil ${current.cameras[current.answerIndex].label}.`
              : `Faux — la photo vient de l’appareil ${current.cameras[current.answerIndex].label}.`}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{current.explanation}</p>
          {!right && answer !== null ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-destructive mb-1 text-xs font-semibold tracking-wide uppercase">
                  Ce qu’aurait donné l’appareil {current.cameras[answer].label}
                </p>
                <SceneImage
                  puzzle={current}
                  kind={{ mode: "view", cameraIndex: answer }}
                  alt={`Ce que l’appareil ${current.cameras[answer].label} aurait photographié.`}
                  className="ring-destructive/50 ring-2"
                />
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                  Le plan — le bon appareil en vert
                </p>
                <div className="max-w-[15rem]">
                  <ScenePlan
                    puzzle={current}
                    correctLabel={current.cameras[current.answerIndex].label}
                    chosenLabel={current.cameras[answer].label}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={goNext} disabled={!training && answer === null}>
          {index + 1 >= puzzles.length ? "Terminer" : "Vue suivante"}
        </Button>
        <Button variant="ghost" onClick={() => setPhase("intro")}>
          Abandonner
        </Button>
      </div>
    </div>
  );
}
