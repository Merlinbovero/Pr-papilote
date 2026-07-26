"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SITE_3D_MODELS, type ModelKey } from "@/lib/models-3d";
import {
  composeOrientationSession,
  ORIENTATION_DURATION_SECONDS,
  ORIENTATION_SESSION_SIZE,
  scoreOrientation,
  type Attitude,
  type OrientationAnswer,
  type OrientationQuestion,
} from "@/lib/psychotech/orientation";

/**
 * Test d'orientation spatiale (rendu). La logique pure vit dans
 * `src/lib/psychotech/orientation.ts`. Ici : le rendu 3D des attitudes via
 * Three.js (importé dynamiquement — chargé sur cette seule page), l'instrument
 * SVG (horizon + compas), le chronomètre, la navigation et les résultats.
 */

// Couleurs intrinsèques à l'instrument (horizon artificiel), pas des couleurs
// d'interface : le ciel est bleu, le sol est brun — comme sur l'appareil réel.
const SKY = "#4f93d9";
const GROUND = "#6f4d2e";

const THUMB = 260; // taille de rendu d'une vignette d'appareil (px)

// Calibration par modèle : rotation de base amenant le nez vers +Z, le haut
// vers +Y (repère canonique), et échelle de cadrage. Ajustée visuellement.
const CALIBRATION: Record<ModelKey, { base: [number, number, number]; fit: number }> = {
  jet: { base: [0, Math.PI, 0], fit: 2.6 },
  biplane: { base: [0, Math.PI, 0], fit: 2.4 },
};

// Signe des axes (calibrés pour coller à la lecture de l'instrument).
const YAW_SIGN = -1; // cap
const PITCH_SIGN = -1; // + = montée (nez haut)
const ROLL_SIGN = -1; // + = virage à droite

const DEG = Math.PI / 180;
const HISTORY_KEY = "pp.orientation.history.v1";

type ThreeMod = typeof import("three");

interface SessionHistoryEntry {
  date: string;
  total: number;
  answered: number;
  correct: number;
  precision: number;
  training: boolean;
}

// --------------------------------------------------------------------------
// Moteur de rendu 3D (singleton client)
// --------------------------------------------------------------------------

interface Renderer3D {
  render: (model: ModelKey, attitude: Attitude) => string;
}

let rendererPromise: Promise<Renderer3D> | null = null;

async function getRenderer(): Promise<Renderer3D> {
  if (rendererPromise) return rendererPromise;
  rendererPromise = (async () => {
    const THREE: ThreeMod = await import("three");
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");

    const canvas = document.createElement("canvas");
    canvas.width = THUMB;
    canvas.height = THUMB;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(THUMB, THUMB, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 1.1, -4.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5568, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(-3, 5, -4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(4, 1, 3);
    scene.add(fill);

    const loader = new GLTFLoader();
    const load = (url: string) =>
      new Promise<import("three").Group>((resolve, reject) => {
        loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
      });

    const pivots: Partial<Record<ModelKey, import("three").Group>> = {};
    for (const keyName of Object.keys(SITE_3D_MODELS) as ModelKey[]) {
      const raw = await load(SITE_3D_MODELS[keyName].src);
      raw.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(raw);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      raw.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      raw.scale.setScalar(CALIBRATION[keyName].fit / maxDim);

      const base = new THREE.Group();
      base.rotation.set(...CALIBRATION[keyName].base);
      base.add(raw);

      const pivot = new THREE.Group();
      pivot.rotation.order = "YXZ";
      pivot.add(base);
      pivots[keyName] = pivot;
    }

    const render = (model: ModelKey, attitude: Attitude): string => {
      const pivot = pivots[model];
      if (!pivot) return "";
      scene.clear();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5568, 1.15));
      const k = new THREE.DirectionalLight(0xffffff, 2.1);
      k.position.set(-3, 5, -4);
      scene.add(k);
      const f = new THREE.DirectionalLight(0xffffff, 0.5);
      f.position.set(4, 1, 3);
      scene.add(f);
      pivot.rotation.set(
        PITCH_SIGN * attitude.pitch * DEG,
        YAW_SIGN * attitude.cap * DEG,
        ROLL_SIGN * attitude.roll * DEG
      );
      scene.add(pivot);
      renderer.render(scene, camera);
      return canvas.toDataURL("image/png");
    };

    return { render };
  })();
  return rendererPromise;
}

// --------------------------------------------------------------------------
// Instrument (horizon artificiel + compas), SVG
// --------------------------------------------------------------------------

function Instrument({ attitude }: { attitude: Attitude }) {
  const S = 200;
  const c = S / 2;
  const R = 88;
  const { cap, pitch, roll } = attitude;
  const horizonShift = Math.max(-R, Math.min(R, pitch * 1.5));
  const letters: [string, number][] = [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["O", 270],
  ];
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - roll - 90) * DEG;
    const r1 = R - 4;
    const r2 = R - 12;
    return (
      <line
        key={i}
        x1={c + r1 * Math.cos(a)}
        y1={c + r1 * Math.sin(a)}
        x2={c + r2 * Math.cos(a)}
        y2={c + r2 * Math.sin(a)}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth={2}
      />
    );
  });

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      role="img"
      aria-label={`Instrument : cap ${cap} degrés, assiette ${pitch} degrés, inclinaison ${roll} degrés`}
    >
      <defs>
        <clipPath id="orientation-ball">
          <circle cx={c} cy={c} r={R} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={R} fill={SKY} />
      <g clipPath="url(#orientation-ball)">
        <g transform={`rotate(${-roll} ${c} ${c}) translate(0 ${horizonShift})`}>
          <rect x={c - R - 50} y={c - R - 80} width={(R + 50) * 2} height={R + 80} fill={SKY} />
          <rect x={c - R - 50} y={c} width={(R + 50) * 2} height={R + 80} fill={GROUND} />
          <line
            x1={c - R - 50}
            y1={c}
            x2={c + R + 50}
            y2={c}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={2}
          />
        </g>
        {ticks}
        {letters.map(([ch, ang]) => {
          const a = (ang - cap - 90) * DEG;
          const rr = R - 22;
          const x = c + rr * Math.cos(a);
          const y = c + rr * Math.sin(a);
          return (
            <text
              key={ch}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
              fontWeight={700}
              fill="rgba(255,255,255,0.96)"
              transform={`rotate(${-roll} ${x} ${y})`}
            >
              {ch}
            </text>
          );
        })}
      </g>
      <circle cx={c} cy={c} r={R} fill="none" stroke="var(--border)" strokeWidth={3} />
      {/* Avion fixe de référence, au centre */}
      <g stroke="#111" strokeWidth={3} strokeLinecap="round" fill="none">
        <line x1={c - 22} y1={c} x2={c - 7} y2={c} />
        <line x1={c + 7} y1={c} x2={c + 22} y2={c} />
        <circle cx={c} cy={c} r={2.5} fill="#111" stroke="none" />
      </g>
    </svg>
  );
}

// --------------------------------------------------------------------------
// Historique local
// --------------------------------------------------------------------------

function loadHistory(): SessionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SessionHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: SessionHistoryEntry[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 10)));
  } catch {
    /* quota / mode privé : on ignore silencieusement */
  }
}

// --------------------------------------------------------------------------
// Composant principal
// --------------------------------------------------------------------------

type Phase = "intro" | "playing" | "done";

export function OrientationTest() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [training, setTraining] = React.useState(false);
  const [questions, setQuestions] = React.useState<OrientationQuestion[]>([]);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<OrientationAnswer[]>([]);
  const [chosen, setChosen] = React.useState<number | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(ORIENTATION_DURATION_SECONDS);
  const [thumbs, setThumbs] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<SessionHistoryEntry[]>([]);

  const answersRef = React.useRef<OrientationAnswer[]>([]);
  const endRef = React.useRef<number>(0);
  const finishRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setHistory(loadHistory()));
    return () => cancelAnimationFrame(id);
  }, []);

  const current = questions[index];

  const finish = React.useCallback(
    (finalAnswers: OrientationAnswer[]) => {
      const score = scoreOrientation(finalAnswers);
      const entry: SessionHistoryEntry = {
        date: new Date().toISOString(),
        total: score.total,
        answered: score.answered,
        correct: score.correct,
        precision: score.precision,
        training,
      };
      const next = [entry, ...loadHistory()].slice(0, 10);
      saveHistory(next);
      setHistory(next);
      setPhase("done");
    },
    [training]
  );

  // Refs tenus à jour pour le minuteur (évite les setState synchrones en effet).
  React.useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  React.useEffect(() => {
    finishRef.current = () => finish(answersRef.current);
  }, [finish]);

  // Chronomètre : décompte basé sur une échéance ; la fin est déclenchée dans
  // le callback d'intervalle (pas de setState synchrone dans le corps d'effet).
  React.useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        finishRef.current();
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [phase]);

  // Rendu des 5 vignettes de la question courante (setState uniquement dans le
  // callback asynchrone ; la réinitialisation se fait dans les gestionnaires).
  React.useEffect(() => {
    if (phase !== "playing" || !current) return;
    let cancelled = false;
    getRenderer()
      .then((r) => {
        if (cancelled) return;
        setThumbs(current.choices.map((att) => r.render(current.model, att)));
      })
      .catch(() => {
        /* échec du moteur 3D : les cartes restent vides */
      });
    return () => {
      cancelled = true;
    };
  }, [phase, current]);

  function start() {
    const seed = Date.now();
    setQuestions(composeOrientationSession(ORIENTATION_SESSION_SIZE, seed));
    setIndex(0);
    setAnswers([]);
    answersRef.current = [];
    setChosen(null);
    setRevealed(false);
    setThumbs([]);
    setTimeLeft(ORIENTATION_DURATION_SECONDS);
    endRef.current = Date.now() + ORIENTATION_DURATION_SECONDS * 1000;
    setPhase("playing");
  }

  function choose(i: number) {
    if (revealed) return;
    setChosen(i);
    if (training) setRevealed(true);
  }

  function next() {
    if (!current) return;
    const answer: OrientationAnswer = {
      questionId: current.id,
      chosenIndex: chosen,
      correctIndex: current.correctIndex,
    };
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setChosen(null);
    setRevealed(false);
    setThumbs([]);
    if (index + 1 >= questions.length) {
      finish(nextAnswers);
    } else {
      setIndex((n) => n + 1);
    }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = questions.length ? (index / questions.length) * 100 : 0;

  // ---- Intro ----
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="bg-card rounded-2xl border p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Orientation</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
            Vous avez 7 minutes pour répondre à {ORIENTATION_SESSION_SIZE} questions. Pour chaque
            question, observez l&apos;instrument de bord (horizon et compas) et sélectionnez
            l&apos;aéronef dans la position correspondante.
          </p>
          <label className="mt-6 flex items-center justify-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={training}
              onChange={(e) => setTraining(e.target.checked)}
              className="border-input size-4 rounded"
            />
            Mode entraînement (correction immédiate, sans pression du temps utile)
          </label>
          <div className="mt-6">
            <Button size="lg" onClick={start}>
              Commencer le test →
            </Button>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Dernières sessions
            </h2>
            <ul className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <li
                  key={i}
                  className="bg-card flex items-center justify-between rounded-lg border px-4 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(h.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {h.training ? " · entraînement" : ""}
                  </span>
                  <span className="font-medium tabular-nums">
                    {h.correct}/{h.total} · {Math.round(h.precision * 100)} %
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  // ---- Résultats ----
  if (phase === "done") {
    const score = scoreOrientation(answers);
    return (
      <div className="mx-auto max-w-xl">
        <div className="bg-card rounded-2xl border p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Résultat</h1>
          <p className="mt-4 text-5xl font-bold tabular-nums">
            {score.correct}
            <span className="text-muted-foreground text-2xl">/{score.total}</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {score.answered} question{score.answered > 1 ? "s" : ""} traitée
            {score.answered > 1 ? "s" : ""} · précision {Math.round(score.precision * 100)} %
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={start}>Recommencer</Button>
            <Button variant="outline" onClick={() => setPhase("intro")}>
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Player ----
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Orientation</h1>
        <span
          className={`rounded-md border px-2.5 py-1 text-sm font-medium tabular-nums ${
            timeLeft <= 30 ? "text-destructive border-destructive/40" : "text-muted-foreground"
          }`}
        >
          {minutes}m {String(seconds).padStart(2, "0")}s
        </span>
      </div>

      <div className="bg-muted mb-5 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-success h-full rounded-full transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-7">
        <p className="text-muted-foreground text-sm">
          Question {index + 1} sur {questions.length}
        </p>

        <div className="mt-4 flex justify-center">
          {current ? <Instrument attitude={current.target} /> : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {current?.choices.map((_, i) => {
            const isChosen = chosen === i;
            const isCorrect = current.correctIndex === i;
            let ring = "border-border hover:border-primary/60";
            if (revealed) {
              if (isCorrect) ring = "border-success ring-2 ring-success/40";
              else if (isChosen) ring = "border-destructive ring-2 ring-destructive/40";
            } else if (isChosen) {
              ring = "border-primary ring-2 ring-primary/40";
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={isChosen}
                aria-label={`Proposition ${i + 1}`}
                className={`bg-muted/40 focus-visible:ring-ring aspect-square overflow-hidden rounded-xl border transition focus-visible:ring-2 focus-visible:outline-none ${ring}`}
              >
                {thumbs[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbs[i]}
                    alt={`Aéronef, proposition ${i + 1}`}
                    className="size-full object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground flex size-full items-center justify-center text-xs">
                    …
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => finish([...answers])}>
            Terminer
          </Button>
          <Button onClick={next} disabled={chosen === null && !training}>
            {index + 1 >= questions.length ? "Voir le résultat" : "Suivant →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
