"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  accuracyFromError,
  checkpointTimes,
  expectedSumAt,
  levelInfo,
  mancheTarget,
  modeTasks,
  numberCountForSession,
  numberSequence,
  palonnierTargetAt,
  SECPIL_LEVELS,
  SECPIL_MODES,
  SECPIL_NUMBER_CYCLE_MS,
  SECPIL_NUMBER_ON_MS,
  sessionDurationMs,
  sessionOverall,
  type SecpilMode,
  type SecpilNumberStep,
  type SecpilScore,
  type SecpilTask,
} from "@/lib/psychotech/secpil";

/**
 * SECPIL — entraîneur psychomoteur temps réel (reconstitution accessible).
 *
 * Écran unique immersif : bande palonnier en haut, « 8 » au centre, nombre du calcul
 * en gros dans le coin. On choisit un mode (progression) et un niveau (1-5), puis on
 * joue une session ; à chaque point de contrôle le jeu **se met en pause** et un pavé
 * numérique demande la somme courante. Le rendu 60 i/s est piloté impérativement (SVG
 * mis à jour via refs) ; l'état React ne porte que le HUD, le nombre affiché et les
 * écrans. Logique pure et testée dans `src/lib/psychotech/secpil.ts`.
 */

// Écran unique (viewBox 320×180).
const PAL_Y = 26;
const PAL_CX = 160;
const PAL_R = 132;
const MANCHE_CX = 160;
const MANCHE_CY = 116;
const MANCHE_RX = 82;
const MANCHE_RY = 54;

const PALONNIER_SPEED = 1.7;
const SMOOTH_TAU = 0.09;

type Screen = "select" | "running" | "done";

function projMancheX(x: number): number {
  return MANCHE_CX + x * MANCHE_RX;
}
function projMancheY(y: number): number {
  return MANCHE_CY - y * MANCHE_RY;
}
function projPalX(x: number): number {
  return PAL_CX + x * PAL_R;
}

/** Tracé pointillé du « 8 ». */
const MANCHE_PATH = (() => {
  const pts: string[] = [];
  const N = 140;
  for (let i = 0; i <= N; i += 1) {
    const t = (i / N) * Math.PI * 2;
    pts.push(
      `${projMancheX(0.72 * Math.sin(2 * t)).toFixed(1)},${projMancheY(Math.sin(t)).toFixed(1)}`
    );
  }
  return "M" + pts.join(" L");
})();

export function SecpilSimulator() {
  const [screen, setScreen] = React.useState<Screen>("select");
  const [mode, setMode] = React.useState<SecpilMode>("tout");
  const [level, setLevel] = React.useState(1);
  const [hud, setHud] = React.useState({ remainingS: 0, accuracy: 100 });
  const [currentNumber, setCurrentNumber] = React.useState<number | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [keypad, setKeypad] = React.useState("");
  const [results, setResults] = React.useState<SecpilScore | null>(null);

  // Chemin chaud (refs, sans re-render).
  const rafRef = React.useRef<number | null>(null);
  const frameRef = React.useRef<(now: number) => void>(() => {});
  const gameStartRef = React.useRef(0);
  const pausedTotalRef = React.useRef(0);
  const pauseStartRef = React.useRef(0);
  const lastFrameRef = React.useRef(0);
  const hudTickRef = React.useRef(0);

  const tasksRef = React.useRef<SecpilTask[]>([]);
  const sessionMsRef = React.useRef(0);
  const checkpointsRef = React.useRef<number[]>([]);
  const nextCpRef = React.useRef(0);
  const numbersRef = React.useRef<SecpilNumberStep[]>([]);
  const expectedSumRef = React.useRef(0);
  const correctRef = React.useRef(0);
  const curNumRef = React.useRef<number | null>(null);

  const accRef = React.useRef({ mancheErr: 0, mancheN: 0, palErr: 0, palN: 0 });
  const mancheCtrl = React.useRef({ x: 0, y: 0 });
  const mouseTarget = React.useRef({ x: 0, y: 0 });
  const palCtrl = React.useRef({ x: 0 });
  const palSeedRef = React.useRef(1);
  const keys = React.useRef({ left: false, right: false });

  const mancheTargetEl = React.useRef<SVGCircleElement | null>(null);
  const mancheCtrlEl = React.useRef<SVGGElement | null>(null);
  const palTargetEl = React.useRef<SVGCircleElement | null>(null);
  const palCtrlEl = React.useRef<SVGGElement | null>(null);
  const zoneRef = React.useRef<SVGSVGElement | null>(null);

  const stopRaf = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const finalize = React.useCallback(() => {
    const tasks = tasksRef.current;
    const acc = accRef.current;
    const score: SecpilScore = {
      manche: tasks.includes("manche")
        ? accuracyFromError(acc.mancheN ? acc.mancheErr / acc.mancheN : 0)
        : null,
      palonnier: tasks.includes("palonnier")
        ? accuracyFromError(acc.palN ? acc.palErr / acc.palN : 0)
        : null,
      calcul: tasks.includes("calcul")
        ? Math.round((correctRef.current / Math.max(1, checkpointsRef.current.length)) * 100)
        : null,
    };
    setResults(score);
    setScreen("done");
    stopRaf();
  }, [stopRaf]);

  const frame = React.useCallback(
    (now: number) => {
      const dt = Math.min(64, now - lastFrameRef.current || 16) / 1000;
      lastFrameRef.current = now;
      const tasks = tasksRef.current;
      const elapsed = now - gameStartRef.current - pausedTotalRef.current;

      // Point de contrôle : on met le jeu en pause et on demande la somme.
      if (
        tasks.includes("calcul") &&
        nextCpRef.current < checkpointsRef.current.length &&
        elapsed >= checkpointsRef.current[nextCpRef.current]
      ) {
        expectedSumRef.current = expectedSumAt(
          numbersRef.current,
          checkpointsRef.current[nextCpRef.current]
        );
        pauseStartRef.current = now;
        setKeypad("");
        setPaused(true);
        return; // on ne replanifie pas : le jeu est figé
      }

      // Fin de session.
      if (elapsed >= sessionMsRef.current) {
        finalize();
        return;
      }

      // Manche.
      if (tasks.includes("manche")) {
        const k = 1 - Math.exp(-dt / SMOOTH_TAU);
        mancheCtrl.current.x += (mouseTarget.current.x - mancheCtrl.current.x) * k;
        mancheCtrl.current.y += (mouseTarget.current.y - mancheCtrl.current.y) * k;
        const tgt = mancheTarget(elapsed);
        accRef.current.mancheErr += Math.hypot(
          mancheCtrl.current.x - tgt.x,
          mancheCtrl.current.y - tgt.y
        );
        accRef.current.mancheN += 1;
        mancheTargetEl.current?.setAttribute("cx", String(projMancheX(tgt.x)));
        mancheTargetEl.current?.setAttribute("cy", String(projMancheY(tgt.y)));
        mancheCtrlEl.current?.setAttribute(
          "transform",
          `translate(${projMancheX(mancheCtrl.current.x)} ${projMancheY(mancheCtrl.current.y)})`
        );
      }

      // Palonnier.
      if (tasks.includes("palonnier")) {
        const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
        palCtrl.current.x = Math.max(
          -1,
          Math.min(1, palCtrl.current.x + dir * PALONNIER_SPEED * dt)
        );
        const tgt = palonnierTargetAt(elapsed, palSeedRef.current);
        accRef.current.palErr += Math.abs(palCtrl.current.x - tgt);
        accRef.current.palN += 1;
        palTargetEl.current?.setAttribute("cx", String(projPalX(tgt)));
        palCtrlEl.current?.setAttribute(
          "transform",
          `translate(${projPalX(palCtrl.current.x)} ${PAL_Y})`
        );
      }

      // Calcul : nombre affiché 3 s, puis 3 s de repos.
      if (tasks.includes("calcul")) {
        const idx = Math.floor(elapsed / SECPIL_NUMBER_CYCLE_MS);
        const inOn = elapsed % SECPIL_NUMBER_CYCLE_MS < SECPIL_NUMBER_ON_MS;
        const val = inOn ? (numbersRef.current[idx]?.value ?? null) : null;
        if (val !== curNumRef.current) {
          curNumRef.current = val;
          setCurrentNumber(val);
        }
      }

      // HUD (~5×/s).
      if (now - hudTickRef.current >= 200) {
        hudTickRef.current = now;
        const acc = accRef.current;
        const parts: number[] = [];
        if (tasks.includes("manche") && acc.mancheN)
          parts.push(accuracyFromError(acc.mancheErr / acc.mancheN));
        if (tasks.includes("palonnier") && acc.palN)
          parts.push(accuracyFromError(acc.palErr / acc.palN));
        setHud({
          remainingS: Math.max(0, Math.ceil((sessionMsRef.current - elapsed) / 1000)),
          accuracy: parts.length
            ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
            : 100,
        });
      }

      rafRef.current = requestAnimationFrame(frameRef.current);
    },
    [finalize]
  );

  React.useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const start = React.useCallback((m: SecpilMode, lvl: number) => {
    const tasks = modeTasks(m);
    tasksRef.current = tasks;
    sessionMsRef.current = sessionDurationMs(m);
    checkpointsRef.current = checkpointTimes(m, lvl);
    nextCpRef.current = 0;
    correctRef.current = 0;
    numbersRef.current = tasks.includes("calcul")
      ? numberSequence(
          Math.floor(Math.random() * 1_000_000_000),
          numberCountForSession(m),
          levelInfo(lvl).numberMax
        )
      : [];
    accRef.current = { mancheErr: 0, mancheN: 0, palErr: 0, palN: 0 };
    mancheCtrl.current = { x: 0, y: 0 };
    mouseTarget.current = { x: 0, y: 0 };
    palCtrl.current = { x: 0 };
    palSeedRef.current = Math.floor(Math.random() * 1_000_000_000) + 1;
    curNumRef.current = null;
    setCurrentNumber(null);
    setResults(null);
    setPaused(false);
    setHud({ remainingS: Math.ceil(sessionMsRef.current / 1000), accuracy: 100 });
    setScreen("running");
    const now = performance.now();
    gameStartRef.current = now;
    pausedTotalRef.current = 0;
    lastFrameRef.current = now;
    hudTickRef.current = now;
    rafRef.current = requestAnimationFrame(frameRef.current);
  }, []);

  const submitKeypad = React.useCallback(() => {
    if (keypad !== "" && Number(keypad) === expectedSumRef.current) correctRef.current += 1;
    nextCpRef.current += 1;
    const now = performance.now();
    pausedTotalRef.current += now - pauseStartRef.current;
    lastFrameRef.current = now;
    hudTickRef.current = now;
    setKeypad("");
    setPaused(false);
    // Fin de session juste après le dernier point de contrôle ?
    const elapsed = now - gameStartRef.current - pausedTotalRef.current;
    if (elapsed >= sessionMsRef.current) {
      finalize();
      return;
    }
    rafRef.current = requestAnimationFrame(frameRef.current);
  }, [keypad, finalize]);

  const abort = React.useCallback(() => {
    stopRaf();
    setPaused(false);
    setScreen("select");
  }, [stopRaf]);

  // Flèches (palonnier) — actives seulement en jeu, hors pause.
  React.useEffect(() => {
    if (screen !== "running" || paused) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        keys.current.left = true;
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        keys.current.right = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [screen, paused]);

  // Clavier du pavé numérique pendant la pause.
  React.useEffect(() => {
    if (!paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") setKeypad((v) => (v.length < 6 ? v + e.key : v));
      else if (e.key === "Backspace") setKeypad((v) => v.slice(0, -1));
      else if (e.key === "Enter") submitKeypad();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, submitKeypad]);

  React.useEffect(() => () => stopRaf(), [stopRaf]);

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const svg = zoneRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    mouseTarget.current = {
      x: Math.max(-1, Math.min(1, (p.x - MANCHE_CX) / MANCHE_RX)),
      y: Math.max(-1, Math.min(1, -(p.y - MANCHE_CY) / MANCHE_RY)),
    };
  }

  if (screen === "select") {
    return (
      <SecpilSelect
        mode={mode}
        level={level}
        onMode={setMode}
        onLevel={setLevel}
        onStart={() => start(mode, level)}
      />
    );
  }

  if (screen === "done" && results) {
    return (
      <SecpilResults
        results={results}
        onReplay={() => start(mode, level)}
        onMenu={() => setScreen("select")}
      />
    );
  }

  // Dérivé de l'état `mode` (pas du ref) : identique aux tâches de la session en cours.
  const tasks = modeTasks(mode);
  const showManche = tasks.includes("manche");
  const showPalonnier = tasks.includes("palonnier");
  const showCalcul = tasks.includes("calcul");
  const modeLabel = SECPIL_MODES.find((m) => m.mode === mode)?.label ?? "";
  const fillTone =
    hud.accuracy >= 80 ? "fill-success" : hud.accuracy >= 55 ? "fill-warning" : "fill-destructive";

  return (
    <div className="space-y-3">
      <div className="dark relative overflow-hidden rounded-lg border">
        <svg
          ref={zoneRef}
          viewBox="0 0 320 180"
          onPointerMove={handlePointer}
          className="bg-background block w-full touch-none"
          style={{ aspectRatio: "16 / 9", cursor: showManche && !paused ? "none" : "default" }}
          role="img"
          aria-label="Écran SECPIL : bande palonnier en haut, « 8 » au centre, nombre du calcul en bas à droite."
        >
          <line
            x1={28}
            y1={PAL_Y}
            x2={292}
            y2={PAL_Y}
            className="stroke-muted-foreground/25"
            strokeWidth={1}
          />
          {showPalonnier && (
            <>
              <circle
                ref={palTargetEl}
                cx={projPalX(0)}
                cy={PAL_Y}
                r={4}
                className="fill-foreground"
              />
              <g ref={palCtrlEl} transform={`translate(${projPalX(0)} ${PAL_Y})`}>
                <rect
                  x={-7}
                  y={-7}
                  width={14}
                  height={14}
                  className="stroke-destructive fill-none"
                  strokeWidth={1.5}
                />
                <line x1={0} y1={-7} x2={0} y2={7} className="stroke-destructive" strokeWidth={1} />
                <line x1={-7} y1={0} x2={7} y2={0} className="stroke-destructive" strokeWidth={1} />
              </g>
            </>
          )}

          <line
            x1={0}
            y1={44}
            x2={320}
            y2={44}
            className="stroke-foreground/30"
            strokeWidth={0.75}
          />
          <text x={10} y={57} className="fill-muted-foreground" fontSize={9}>
            {modeLabel}
          </text>
          <text x={310} y={57} textAnchor="end" className="fill-foreground" fontSize={11}>
            {hud.remainingS}
          </text>
          {(showManche || showPalonnier) && (
            <text x={10} y={173} className={fillTone} fontSize={8}>
              Précision {hud.accuracy}%
            </text>
          )}

          {showManche && (
            <>
              <path
                d={MANCHE_PATH}
                className="stroke-muted-foreground/50 fill-none"
                strokeWidth={1}
                strokeDasharray="0.5 3.5"
                strokeLinecap="round"
              />
              <circle
                ref={mancheTargetEl}
                cx={projMancheX(0)}
                cy={projMancheY(0)}
                r={4.5}
                className="fill-destructive"
              />
              <g ref={mancheCtrlEl} transform={`translate(${projMancheX(0)} ${projMancheY(0)})`}>
                <circle r={3} className="stroke-foreground fill-none" strokeWidth={1.2} />
                <line x1={-8} y1={0} x2={8} y2={0} className="stroke-foreground" strokeWidth={1} />
                <line x1={0} y1={-8} x2={0} y2={8} className="stroke-foreground" strokeWidth={1} />
              </g>
            </>
          )}

          {showCalcul && currentNumber !== null && (
            <text x={306} y={168} textAnchor="end" className="fill-warning font-bold" fontSize={38}>
              {currentNumber}
            </text>
          )}
        </svg>

        <button
          type="button"
          onClick={abort}
          className="border-border/50 bg-background/60 text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5 rounded-md border px-2 py-1 text-xs backdrop-blur"
        >
          Quitter
        </button>

        {showPalonnier && !paused && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-3 lg:hidden">
            {(["left", "right"] as const).map((side) => (
              <button
                key={side}
                type="button"
                aria-label={side === "left" ? "Palonnier à gauche" : "Palonnier à droite"}
                className="border-border/50 bg-background/70 text-foreground active:bg-primary active:text-primary-foreground pointer-events-auto flex h-12 w-16 items-center justify-center rounded-lg border text-xl select-none"
                onPointerDown={() => (keys.current[side] = true)}
                onPointerUp={() => (keys.current[side] = false)}
                onPointerLeave={() => (keys.current[side] = false)}
              >
                {side === "left" ? "◀" : "▶"}
              </button>
            ))}
          </div>
        )}

        {paused && <SecpilKeypad value={keypad} onChange={setKeypad} onSubmit={submitKeypad} />}
      </div>

      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">{modeLabel}</span>
        {showCalcul ? ` · niveau ${level} — ${levelInfo(level).label}.` : "."} Additionnez les
        nombres ; la somme vous sera demandée aux moments clés.
      </p>
    </div>
  );
}

function SecpilKeypad({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const keysGrid = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  return (
    <div className="dark bg-background/95 absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 backdrop-blur">
      <p className="text-muted-foreground text-sm">Entrez le résultat des nombres</p>
      <div className="bg-card min-w-[8rem] rounded-md border px-6 py-3 text-center text-3xl font-bold tabular-nums">
        {value || "—"}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {keysGrid.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(value.length < 6 ? value + k : value)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-11 w-11 items-center justify-center rounded-md border text-lg font-medium"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          aria-label="Effacer"
          onClick={() => onChange(value.slice(0, -1))}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-11 w-11 items-center justify-center rounded-md border text-lg"
        >
          ⌫
        </button>
        <button
          type="button"
          aria-label="Valider"
          onClick={onSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90 col-span-4 flex h-11 items-center justify-center rounded-md text-lg font-semibold"
        >
          Valider
        </button>
      </div>
    </div>
  );
}

function SecpilSelect({
  mode,
  level,
  onMode,
  onLevel,
  onStart,
}: {
  mode: SecpilMode;
  level: number;
  onMode: (m: SecpilMode) => void;
  onLevel: (l: number) => void;
  onStart: () => void;
}) {
  const withCalcul = modeTasks(mode).includes("calcul");
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Choisissez un mode (progression)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECPIL_MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => onMode(m.mode)}
              aria-pressed={mode === m.mode}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                mode === m.mode
                  ? "border-primary bg-primary/5 ring-primary/30 ring-2"
                  : "hover:border-primary/50"
              )}
            >
              <p className="font-medium">{m.label}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{m.hint}</p>
            </button>
          ))}
        </div>
      </section>

      <section className={cn("space-y-3", !withCalcul && "opacity-40")}>
        <h2 className="text-lg font-semibold">2. Niveau de difficulté du calcul</h2>
        {withCalcul ? (
          <div className="flex flex-wrap gap-2">
            {SECPIL_LEVELS.map((l) => (
              <button
                key={l.level}
                type="button"
                onClick={() => onLevel(l.level)}
                aria-pressed={level === l.level}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  level === l.level
                    ? "border-primary bg-primary/5 ring-primary/30 ring-2"
                    : "hover:border-primary/50"
                )}
              >
                <span className="font-semibold">Niveau {l.level}</span>
                <span className="text-muted-foreground ml-2">{l.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Ce mode n&apos;inclut pas le calcul — le niveau s&apos;applique dès que les nombres sont
            présents.
          </p>
        )}
      </section>

      <div className="border-warning/40 bg-warning/5 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">Reconstitution pédagogique.</strong> Cet entraîneur
          reproduit le <em>principe</em> du SECPIL (attention partagée) avec des commandes
          accessibles — souris et flèches. Sans lien avec le logiciel officiel des armées.
        </p>
      </div>

      <Button size="lg" onClick={onStart}>
        Démarrer la session
      </Button>
    </div>
  );
}

function scoreTone(v: number): string {
  return v >= 80 ? "text-success" : v >= 55 ? "text-warning" : "text-destructive";
}

function SecpilResults({
  results,
  onReplay,
  onMenu,
}: {
  results: SecpilScore;
  onReplay: () => void;
  onMenu: () => void;
}) {
  const overall = sessionOverall(results);
  const rows: [string, number | null][] = [
    ["Manche (le « 8 »)", results.manche],
    ["Palonnier", results.palonnier],
    ["Calcul", results.calcul],
  ];
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-lg border p-5 text-center">
        <p className="text-muted-foreground text-sm">Score global</p>
        <p className={cn("text-5xl font-bold tabular-nums", scoreTone(overall))}>{overall}</p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, val]) => (
              <tr key={label} className="border-t first:border-t-0">
                <td className="p-2.5">{label}</td>
                <td
                  className={cn(
                    "p-2.5 text-right font-semibold tabular-nums",
                    val !== null ? scoreTone(val) : "text-muted-foreground"
                  )}
                >
                  {val !== null ? `${val} %` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onReplay}>Rejouer</Button>
        <Button variant="outline" onClick={onMenu}>
          Changer de mode
        </Button>
        <Button variant="outline" asChild>
          <Link href="/psychotechnique/exercices/le-secpil">Lire la méthode</Link>
        </Button>
      </div>
    </div>
  );
}
