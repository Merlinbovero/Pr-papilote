"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SITE_3D_MODELS, type ModelKey } from "@/lib/models-3d";
import {
  composeOrientationSession,
  ORIENTATION_FORMATS,
  scoreOrientation,
  type Attitude,
  type OrientationAnswer,
  type OrientationFormatKey,
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

/**
 * Calibration par modèle — rotation de base amenant le modèle dans le repère
 * canonique NEZ = +Z, HAUT = +Y. Ces valeurs sont MESURÉES (rendu de chaque
 * modèle selon les six directions canoniques), pas estimées :
 *  - `jet`     : le modèle est déjà nez = +Z, haut = +Y → aucune rotation ;
 *  - `biplane` : le modèle a le nez sur +X → rotation de −90° autour de Y.
 * Un modèle ajouté plus tard doit être mesuré de la même façon.
 */
const CALIBRATION: Record<ModelKey, { base: [number, number, number] }> = {
  jet: { base: [0, 0, 0] },
  biplane: { base: [0, -Math.PI / 2, 0] },
};

/**
 * Part de la hauteur visible occupée par la sphère englobante de l'appareil.
 * Cadrer sur la SPHÈRE (et non sur la plus grande dimension de la boîte)
 * garantit deux choses : l'appareil n'est jamais rogné, quelle que soit son
 * attitude, et sa taille apparente reste constante — la taille ne doit pas
 * devenir un indice pour répondre.
 */
const FIT_MARGIN = 0.95;

/**
 * Signes des rotations, démontrés dans le repère canonique (nez = +Z,
 * haut = +Y, donc aile droite = nez × haut = −X) et vérifiés visuellement :
 *  - cabré (assiette > 0) = rotation NÉGATIVE autour de X ;
 *  - cap croissant (vers l'est) = rotation NÉGATIVE autour de Y ;
 *  - virage à droite (inclinaison > 0, aile droite basse) = rotation POSITIVE
 *    autour de Z.
 * L'ordre d'Euler « YXZ » applique l'inclinaison, puis l'assiette, puis le cap
 * — c'est la convention aéronautique.
 */
const YAW_SIGN = -1;
const PITCH_SIGN = -1;
const ROLL_SIGN = +1;

const DEG = Math.PI / 180;
const HISTORY_KEY = "pp.orientation.history.v1";

type ThreeMod = typeof import("three");

interface SessionHistoryEntry {
  date: string;
  total: number;
  answered: number;
  correct: number;
  precision: number;
  durationSeconds: number;
  training: boolean;
  /** Absent des sessions enregistrées avant l'ajout du format court. */
  format?: OrientationFormatKey;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
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
    // Caméra DERRIÈRE l'appareil (vue de poursuite), légèrement au-dessus :
    // l'aile droite de l'appareil tombe alors à droite de l'écran, ce qui rend
    // l'inclinaison lisible exactement comme sur l'instrument.
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 1.1, -4.4);
    camera.up.set(0, 1, 0);
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

    // Rayon utile à la distance de l'appareil : au-delà, il serait rogné.
    const camDistance = camera.position.length();
    const visibleRadius = camDistance * Math.tan((camera.fov / 2) * DEG) * FIT_MARGIN;

    const pivots: Partial<Record<ModelKey, import("three").Group>> = {};
    for (const keyName of Object.keys(SITE_3D_MODELS) as ModelKey[]) {
      const raw = await load(SITE_3D_MODELS[keyName].src);
      raw.updateMatrixWorld(true);
      const center = new THREE.Box3().setFromObject(raw).getCenter(new THREE.Vector3());

      // Rayon réel = distance maximale d'un sommet au centre de rotation. Bien
      // plus serré que la diagonale de la boîte englobante : l'appareil occupe
      // donc le cadre au maximum, sans jamais en sortir.
      const vertex = new THREE.Vector3();
      let radius = 0;
      raw.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (!mesh.isMesh) return;
        const position = mesh.geometry.getAttribute("position");
        for (let i = 0; i < position.count; i += 1) {
          vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
          radius = Math.max(radius, vertex.distanceTo(center));
        }
      });

      // Deux groupes imbriqués : on recentre d'abord, on met à l'échelle
      // ensuite. Faire l'inverse décalerait l'appareil (la position d'un objet
      // s'exprime dans le repère du parent, donc hors de sa propre échelle).
      const centered = new THREE.Group();
      centered.position.copy(center).multiplyScalar(-1);
      centered.add(raw);

      const fitted = new THREE.Group();
      fitted.scale.setScalar(visibleRadius / (radius || 1));
      fitted.add(centered);

      const base = new THREE.Group();
      base.rotation.set(...CALIBRATION[keyName].base);
      base.add(fitted);

      const pivot = new THREE.Group();
      pivot.rotation.order = "YXZ"; // inclinaison, puis assiette, puis cap
      pivot.add(base);
      pivot.visible = false;
      scene.add(pivot);
      pivots[keyName] = pivot;
    }

    const render = (model: ModelKey, attitude: Attitude): string => {
      const pivot = pivots[model];
      if (!pivot) return "";
      // Les deux appareils vivent dans la scène ; on n'affiche que le bon.
      for (const p of Object.values(pivots)) p.visible = false;
      pivot.visible = true;
      pivot.rotation.set(
        PITCH_SIGN * attitude.pitch * DEG,
        YAW_SIGN * attitude.cap * DEG,
        ROLL_SIGN * attitude.roll * DEG
      );
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

function Instrument({ attitude, size = 200 }: { attitude: Attitude; size?: number }) {
  // Identifiant unique : plusieurs instruments coexistent sur l'écran d'accueil
  // (le tutoriel), et deux `clipPath` de même id se télescoperaient.
  const clipId = React.useId();
  const S = size;
  const c = S / 2;
  const R = S * 0.44;
  const { cap, pitch, roll } = attitude;
  const horizonShift = Math.max(-R, Math.min(R, pitch * (R / 58)));
  const letters: [string, number][] = [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["O", 270],
  ];
  // Graduations tous les 45°, solidaires de la rose (donc du cap).
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - cap - 90) * DEG;
    const r1 = R - S * 0.02;
    const r2 = R - S * 0.06;
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
        <clipPath id={clipId}>
          <circle cx={c} cy={c} r={R} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={R} fill={SKY} />
      <g clipPath={`url(#${clipId})`}>
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
        {/* Rose des caps — peinte sur la boule, elle s'incline donc avec elle.
            Ailes à plat, la lettre du cap suivi est en haut. */}
        <g transform={`rotate(${-roll} ${c} ${c})`}>
          {ticks}
          {letters.map(([ch, ang]) => {
            const a = (ang - cap - 90) * DEG;
            const rr = R - S * 0.11;
            const x = c + rr * Math.cos(a);
            const y = c + rr * Math.sin(a);
            return (
              <text
                key={ch}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={S * 0.085}
                fontWeight={700}
                fill="rgba(255,255,255,0.96)"
              >
                {ch}
              </text>
            );
          })}
        </g>
      </g>
      <circle cx={c} cy={c} r={R} fill="none" stroke="var(--border)" strokeWidth={S * 0.015} />
      {/* Avion fixe de référence, au centre */}
      <g stroke="#111" strokeWidth={S * 0.015} strokeLinecap="round" fill="none">
        <line x1={c - S * 0.11} y1={c} x2={c - S * 0.035} y2={c} />
        <line x1={c + S * 0.035} y1={c} x2={c + S * 0.11} y2={c} />
        <circle cx={c} cy={c} r={S * 0.0125} fill="#111" stroke="none" />
      </g>
    </svg>
  );
}

// --------------------------------------------------------------------------
// Tutoriel — comment lire l'instrument
// --------------------------------------------------------------------------

/**
 * Exemples du tutoriel. Ils sont rendus par le MÊME moteur que le test : ils
 * ne peuvent donc pas se désynchroniser du jeu réel.
 */
const TUTORIAL_EXAMPLES: {
  attitude: Attitude;
  model: ModelKey;
  title: string;
  body: string;
}[] = [
  {
    attitude: { cap: 0, pitch: 30, roll: 0 },
    model: "biplane",
    title: "L'assiette : monte ou descend ?",
    body: "Beaucoup de ciel, l'horizon est bas : l'appareil monte. Beaucoup de sol : il descend. Ici, nez en l'air, ailes à plat.",
  },
  {
    attitude: { cap: 0, pitch: 0, roll: 45 },
    model: "biplane",
    title: "L'inclinaison : de quel côté penche-t-il ?",
    body: "L'horizon bascule. Le côté vers lequel le sol remonte est celui de l'aile basse. Ici, l'aile droite est basse : virage à droite.",
  },
  {
    attitude: { cap: 90, pitch: 0, roll: 0 },
    model: "biplane",
    title: "Le cap : vers où pointe le nez ?",
    body: "La lettre en haut de la boule donne le cap suivi. Ici « E » : l'appareil file plein est, donc son nez part vers la droite de l'écran.",
  },
];

function TutorialRow({
  example,
  thumb,
}: {
  example: (typeof TUTORIAL_EXAMPLES)[number];
  thumb: string | undefined;
}) {
  return (
    <li className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex shrink-0 items-center gap-3">
        <Instrument attitude={example.attitude} size={116} />
        <span aria-hidden className="text-muted-foreground text-lg">
          →
        </span>
        <div className="bg-muted/40 size-[116px] overflow-hidden rounded-lg border">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="size-full object-contain" />
          ) : null}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{example.title}</p>
        <p className="text-muted-foreground text-sm">{example.body}</p>
      </div>
    </li>
  );
}

function OrientationTutorial() {
  const [thumbs, setThumbs] = React.useState<string[]>([]);

  // Le rendu 3D est chargé en tâche de fond : le tutoriel est lisible tout de
  // suite (l'instrument est du SVG) et le moteur est préchauffé pour le test.
  React.useEffect(() => {
    let cancelled = false;
    getRenderer()
      .then((r) => {
        if (cancelled) return;
        setThumbs(TUTORIAL_EXAMPLES.map((e) => r.render(e.model, e.attitude)));
      })
      .catch(() => {
        /* sans 3D, le tutoriel reste utile : instrument + explication */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-card mt-6 rounded-2xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Comment lire l’instrument</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Le disque montre ce que verrait le pilote : <strong>bleu = le ciel</strong>,{" "}
        <strong>brun = le sol</strong>, séparés par la ligne d’horizon. Le petit avion au centre ne
        bouge jamais — c’est le monde qui bascule autour de lui. Trois informations s’y lisent d’un
        coup d’œil.
      </p>
      <ul className="mt-5 space-y-5">
        {TUTORIAL_EXAMPLES.map((example, i) => (
          <TutorialRow key={example.title} example={example} thumb={thumbs[i]} />
        ))}
      </ul>
      <p className="text-muted-foreground mt-5 text-sm">
        Dans le test, la vue est toujours orientée <strong>vers le nord</strong> et l’appareil vu{" "}
        <strong>de derrière</strong> : sa droite est donc à votre droite. La difficulté monte comme
        à l’épreuve réelle — situations simples au début,{" "}
        <strong>fortes assiettes et vol sur le dos</strong> à la fin (le sol passe alors en haut de
        la boule). Le <strong>mode entraînement</strong> vous montre la bonne réponse après chaque
        question : commencez par là.
      </p>
    </section>
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
  const [format, setFormat] = React.useState<OrientationFormatKey>("officiel");
  const [timeLeft, setTimeLeft] = React.useState(ORIENTATION_FORMATS.officiel.durationSeconds);
  const [elapsed, setElapsed] = React.useState(0);
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
      const remaining = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      const elapsedSeconds = ORIENTATION_FORMATS[format].durationSeconds - remaining;
      setElapsed(elapsedSeconds);
      const entry: SessionHistoryEntry = {
        date: new Date().toISOString(),
        total: score.total,
        answered: score.answered,
        correct: score.correct,
        precision: score.precision,
        durationSeconds: elapsedSeconds,
        training,
        format,
      };
      const next = [entry, ...loadHistory()].slice(0, 10);
      saveHistory(next);
      setHistory(next);
      setPhase("done");
    },
    [training, format]
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

  const start = React.useCallback((formatKey: OrientationFormatKey) => {
    const chosenFormat = ORIENTATION_FORMATS[formatKey];
    const now = Date.now();
    setFormat(formatKey);
    setQuestions(composeOrientationSession(chosenFormat.size, now));
    setIndex(0);
    setAnswers([]);
    answersRef.current = [];
    setChosen(null);
    setRevealed(false);
    setThumbs([]);
    setTimeLeft(chosenFormat.durationSeconds);
    endRef.current = now + chosenFormat.durationSeconds * 1000;
    setPhase("playing");
  }, []);

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
        <div className="bg-card rounded-2xl border p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight">Orientation</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
            Observez l’instrument de bord (horizon et compas), puis désignez l’aéronef dans la
            position correspondante. Choisissez votre format.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(["officiel", "court"] as const).map((key) => {
              const f = ORIENTATION_FORMATS[key];
              const officiel = key === "officiel";
              return (
                <div key={key} className="bg-muted/30 flex flex-col rounded-xl border p-4">
                  <p className="text-base font-semibold">{f.label}</p>
                  <p className="text-primary mt-1 text-sm font-medium tabular-nums">
                    {f.size} questions · {formatDuration(f.durationSeconds)}
                  </p>
                  <p className="text-muted-foreground mt-1 mb-4 text-sm">{f.hint}</p>
                  <Button
                    className="mt-auto w-full"
                    variant={officiel ? "default" : "outline"}
                    onClick={() => start(key)}
                  >
                    Commencer →
                  </Button>
                </div>
              );
            })}
          </div>

          <label className="mt-5 flex items-center justify-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={training}
              onChange={(e) => setTraining(e.target.checked)}
              className="border-input size-4 rounded"
            />
            Mode entraînement (la bonne réponse est montrée après chaque question)
          </label>
        </div>

        <OrientationTutorial />

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
                    {h.format ? ` · ${ORIENTATION_FORMATS[h.format].label.toLowerCase()}` : ""}
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
    const totalQuestions = questions.length;
    const correct = answers.filter((a) => a.chosenIndex === a.correctIndex).length;
    const answered = answers.filter((a) => a.chosenIndex !== null).length;
    const reussite = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;

    // Réussite par niveau (données réelles de la session ; answers[i] ↔ questions[i]).
    const perDiff = ([1, 2, 3] as const).map((d) => {
      const label = d === 1 ? "Facile" : d === 2 ? "Moyen" : "Difficile";
      const total = questions.filter((q) => q.difficulty === d).length;
      const good = answers.filter(
        (a, i) => questions[i]?.difficulty === d && a.chosenIndex === a.correctIndex
      ).length;
      const pct = total ? good / total : 0;
      const tone = pct >= 0.7 ? "bg-success" : pct >= 0.4 ? "bg-primary" : "bg-destructive";
      return { d, label, total, good, pct, tone };
    });

    const tiles = [
      { label: "Score total", value: `${correct}/${totalQuestions}` },
      { label: "Temps écoulé", value: formatDuration(elapsed) },
      { label: "Répondues", value: `${answered}/${totalQuestions}` },
      { label: "Réussite", value: `${reussite} %` },
    ];

    return (
      <div className="mx-auto max-w-2xl">
        <div className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-2xl font-bold tracking-tight">Résultats</h1>

          <div
            className="mt-6 flex items-end justify-center gap-6 sm:gap-10"
            role="img"
            aria-label={`Réussite par niveau : ${perDiff
              .map((b) => `${b.label} ${b.good} sur ${b.total}`)
              .join(", ")}`}
          >
            {perDiff.map((b) => (
              <div key={b.d} className="flex w-16 flex-col items-center gap-2 sm:w-20">
                <span className="text-sm font-semibold tabular-nums">
                  {Math.round(b.pct * 100)} %
                </span>
                <div className="bg-muted/50 flex h-28 w-full items-end overflow-hidden rounded-md">
                  <div
                    className={`w-full rounded-md transition-[height] duration-500 ${b.tone}`}
                    style={{ height: `${Math.max(6, Math.round(b.pct * 100))}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{b.label}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {b.good}/{b.total}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="bg-muted/40 rounded-xl border p-4 text-center">
                <p className="text-muted-foreground text-xs">{t.label}</p>
                <p className="text-primary mt-1 text-2xl font-bold tabular-nums">{t.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setPhase("intro")}>
              ← Retour
            </Button>
            <Button onClick={() => start(format)}>Recommencer →</Button>
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

        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
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
