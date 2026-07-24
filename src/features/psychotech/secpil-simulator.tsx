"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  accuracyFromError,
  digitCountForPhase,
  globalScore,
  improvementTrend,
  mancheTarget,
  mathSequence,
  palonnierTarget,
  phaseOverall,
  SECPIL_DIGIT_INTERVAL_MS,
  SECPIL_PHASE_MS,
  SECPIL_PHASES,
  type SecpilMathStep,
  type SecpilPhaseScore,
} from "@/lib/psychotech/secpil";

/**
 * SECPIL — entraîneur psychomoteur temps réel (reconstitution accessible).
 *
 * Le rendu à 60 images/s est piloté impérativement (mise à jour directe des
 * attributs SVG via des refs) pour éviter un re-render React par image ; l'état
 * React ne porte que le bandeau (phase, décompte, précision) rafraîchi ~5×/s et
 * les écrans (intro / en cours / bilan). Toute la logique pure et testée vit dans
 * `src/lib/psychotech/secpil.ts`.
 *
 * Commandes accessibles : souris/doigt pour le manche (le « 8 »), flèches ◀ ▶ ou
 * boutons tactiles pour le palonnier (cible horizontale), clavier numérique pour
 * le calcul mental. Sans lien avec le logiciel officiel des armées.
 */

// Écran unique (viewBox 320×180). Tout est disposé dans un seul cadre immersif :
// bande palonnier en haut, zone manche au centre, calcul en bas à droite.
const PAL_Y = 26; // ligne de la bande palonnier (haut)
const PAL_CX = 160;
const PAL_R = 132;
const MANCHE_CX = 160; // centre de la zone manche
const MANCHE_CY = 116;
const MANCHE_RX = 82;
const MANCHE_RY = 54;

const PALONNIER_SPEED = 1.7; // unités normalisées par seconde (vitesse au clavier)
const SMOOTH_TAU = 0.09; // constante de temps du lissage du manche (s)

type Screen = "intro" | "running" | "done";

interface PhaseAccumulator {
  mancheErr: number;
  mancheN: number;
  palErr: number;
  palN: number;
}

function projMancheX(x: number): number {
  return MANCHE_CX + x * MANCHE_RX;
}
function projMancheY(y: number): number {
  return MANCHE_CY - y * MANCHE_RY; // y vers le haut
}
function projPalX(x: number): number {
  return PAL_CX + x * PAL_R;
}

/** Tracé pointillé du « 8 » que parcourt la cible du manche (Lissajous 1:2). */
const MANCHE_PATH = (() => {
  const pts: string[] = [];
  const N = 140;
  for (let i = 0; i <= N; i += 1) {
    const t = (i / N) * Math.PI * 2;
    const x = 0.72 * Math.sin(2 * t);
    const y = Math.sin(t);
    pts.push(`${projMancheX(x).toFixed(1)},${projMancheY(y).toFixed(1)}`);
  }
  return "M" + pts.join(" L");
})();

export function SecpilSimulator() {
  const [screen, setScreen] = React.useState<Screen>("intro");
  const [hud, setHud] = React.useState({ phaseIndex: 0, remainingS: 0, accuracy: 100 });
  const [digit, setDigit] = React.useState<number | null>(null);
  const [mathInput, setMathInput] = React.useState("");
  const [mathTally, setMathTally] = React.useState({ ok: 0, total: 0 });
  const [results, setResults] = React.useState<SecpilPhaseScore[]>([]);

  // --- Références du chemin chaud (aucune ne déclenche de re-render) ---
  const rafRef = React.useRef<number | null>(null);
  const frameRef = React.useRef<(now: number) => void>(() => {});
  const phaseIdxRef = React.useRef(0);
  const phaseStartRef = React.useRef(0);
  const lastFrameRef = React.useRef(0);
  const accRef = React.useRef<PhaseAccumulator>({ mancheErr: 0, mancheN: 0, palErr: 0, palN: 0 });
  const scoresRef = React.useRef<SecpilPhaseScore[]>([]);

  const mancheCtrl = React.useRef({ x: 0, y: 0 });
  const mouseTarget = React.useRef({ x: 0, y: 0 });
  const palCtrl = React.useRef({ x: 0 });
  const keys = React.useRef({ left: false, right: false });

  // Calcul mental
  const mathStepsRef = React.useRef<SecpilMathStep[]>([]);
  const mathIdxRef = React.useRef(0);
  const mathTickRef = React.useRef(0);
  const mathDoneRef = React.useRef<Set<number>>(new Set());
  const mathInputRef = React.useRef("");
  const hudTickRef = React.useRef(0);

  // Refs des éléments SVG mis à jour image par image.
  const mancheTargetEl = React.useRef<SVGCircleElement | null>(null);
  const mancheCtrlEl = React.useRef<SVGGElement | null>(null);
  const palTargetEl = React.useRef<SVGCircleElement | null>(null);
  const palCtrlEl = React.useRef<SVGGElement | null>(null);
  const zoneRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    mathInputRef.current = mathInput;
  }, [mathInput]);

  const stopRaf = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const finalizePhase = React.useCallback((): SecpilPhaseScore => {
    const phase = SECPIL_PHASES[phaseIdxRef.current];
    const acc = accRef.current;
    const manche = phase.tasks.includes("manche")
      ? accuracyFromError(acc.mancheN ? acc.mancheErr / acc.mancheN : 0)
      : null;
    const palonnier = phase.tasks.includes("palonnier")
      ? accuracyFromError(acc.palN ? acc.palErr / acc.palN : 0)
      : null;
    const doneSet = mathDoneRef.current;
    const calcul = phase.tasks.includes("calcul")
      ? Math.round((doneSet.size / Math.max(1, mathStepsRef.current.length)) * 100)
      : null;
    return { phaseId: phase.id, manche, palonnier, calcul };
  }, []);

  const startPhase = React.useCallback((index: number, now: number) => {
    phaseIdxRef.current = index;
    phaseStartRef.current = now;
    accRef.current = { mancheErr: 0, mancheN: 0, palErr: 0, palN: 0 };
    // Recentrer les commandes au début de chaque phase.
    mancheCtrl.current = { x: 0, y: 0 };
    mouseTarget.current = { x: 0, y: 0 };
    palCtrl.current = { x: 0 };
    // Calcul mental (uniquement quand la tâche est active).
    const phase = SECPIL_PHASES[index];
    if (phase.tasks.includes("calcul")) {
      mathStepsRef.current = mathSequence(
        Math.floor(Math.random() * 1_000_000_000),
        digitCountForPhase(SECPIL_PHASE_MS)
      );
      mathIdxRef.current = 0;
      mathTickRef.current = now;
      mathDoneRef.current = new Set();
      setDigit(mathStepsRef.current[0]?.digit ?? null);
      setMathInput("");
      setMathTally({ ok: 0, total: mathStepsRef.current.length });
    } else {
      mathStepsRef.current = [];
      setDigit(null);
      setMathTally({ ok: 0, total: 0 });
    }
    setHud({ phaseIndex: index, remainingS: Math.ceil(SECPIL_PHASE_MS / 1000), accuracy: 100 });
  }, []);

  const frame = React.useCallback(
    (now: number) => {
      const dtMs = Math.min(64, now - lastFrameRef.current || 16);
      lastFrameRef.current = now;
      const dt = dtMs / 1000;
      const phase = SECPIL_PHASES[phaseIdxRef.current];
      const elapsed = now - phaseStartRef.current;

      // --- Manche : lissage vers la position visée, erreur de suivi ---
      if (phase.tasks.includes("manche")) {
        const k = 1 - Math.exp(-dt / SMOOTH_TAU);
        mancheCtrl.current.x += (mouseTarget.current.x - mancheCtrl.current.x) * k;
        mancheCtrl.current.y += (mouseTarget.current.y - mancheCtrl.current.y) * k;
        const tgt = mancheTarget(elapsed);
        const dx = mancheCtrl.current.x - tgt.x;
        const dy = mancheCtrl.current.y - tgt.y;
        accRef.current.mancheErr += Math.hypot(dx, dy);
        accRef.current.mancheN += 1;
        if (mancheTargetEl.current) {
          mancheTargetEl.current.setAttribute("cx", String(projMancheX(tgt.x)));
          mancheTargetEl.current.setAttribute("cy", String(projMancheY(tgt.y)));
        }
        if (mancheCtrlEl.current) {
          mancheCtrlEl.current.setAttribute(
            "transform",
            `translate(${projMancheX(mancheCtrl.current.x)} ${projMancheY(mancheCtrl.current.y)})`
          );
        }
      }

      // --- Palonnier : vitesse au clavier, erreur horizontale ---
      if (phase.tasks.includes("palonnier")) {
        const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
        palCtrl.current.x = Math.max(
          -1,
          Math.min(1, palCtrl.current.x + dir * PALONNIER_SPEED * dt)
        );
        const tgt = palonnierTarget(elapsed);
        accRef.current.palErr += Math.abs(palCtrl.current.x - tgt);
        accRef.current.palN += 1;
        if (palTargetEl.current) {
          palTargetEl.current.setAttribute("cx", String(projPalX(tgt)));
        }
        if (palCtrlEl.current) {
          palCtrlEl.current.setAttribute(
            "transform",
            `translate(${projPalX(palCtrl.current.x)} ${PAL_Y})`
          );
        }
      }

      // --- Calcul mental : nouveau chiffre toutes les 3 s ---
      if (phase.tasks.includes("calcul")) {
        if (now - mathTickRef.current >= SECPIL_DIGIT_INTERVAL_MS) {
          mathTickRef.current += SECPIL_DIGIT_INTERVAL_MS;
          mathIdxRef.current += 1;
          const step = mathStepsRef.current[mathIdxRef.current];
          if (step) setDigit(step.digit);
        }
        // Validation : la valeur saisie atteint la somme courante attendue.
        const cur = mathStepsRef.current[mathIdxRef.current];
        if (cur && !mathDoneRef.current.has(mathIdxRef.current)) {
          if (Number(mathInputRef.current) === cur.sum) {
            mathDoneRef.current.add(mathIdxRef.current);
            setMathTally((t) => ({ ...t, ok: mathDoneRef.current.size }));
          }
        }
      }

      // --- Bandeau (rafraîchi ~5×/s) ---
      if (now - hudTickRef.current >= 200) {
        hudTickRef.current = now;
        const acc = accRef.current;
        const liveParts: number[] = [];
        if (phase.tasks.includes("manche") && acc.mancheN)
          liveParts.push(accuracyFromError(acc.mancheErr / acc.mancheN));
        if (phase.tasks.includes("palonnier") && acc.palN)
          liveParts.push(accuracyFromError(acc.palErr / acc.palN));
        const accuracy = liveParts.length
          ? Math.round(liveParts.reduce((a, b) => a + b, 0) / liveParts.length)
          : 100;
        setHud({
          phaseIndex: phaseIdxRef.current,
          remainingS: Math.max(0, Math.ceil((SECPIL_PHASE_MS - elapsed) / 1000)),
          accuracy,
        });
      }

      // --- Fin de phase ---
      if (elapsed >= SECPIL_PHASE_MS) {
        scoresRef.current = [...scoresRef.current, finalizePhase()];
        const next = phaseIdxRef.current + 1;
        if (next >= SECPIL_PHASES.length) {
          setResults(scoresRef.current);
          setScreen("done");
          stopRaf();
          return;
        }
        startPhase(next, now);
      }

      rafRef.current = requestAnimationFrame(frameRef.current);
    },
    [finalizePhase, startPhase, stopRaf]
  );

  // La boucle se replanifie via une ref pour éviter l'auto-référence de `frame`.
  React.useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const start = React.useCallback(() => {
    scoresRef.current = [];
    setResults([]);
    setScreen("running");
    const now = performance.now();
    lastFrameRef.current = now;
    hudTickRef.current = now;
    startPhase(0, now);
    rafRef.current = requestAnimationFrame(frameRef.current);
  }, [startPhase]);

  const abort = React.useCallback(() => {
    stopRaf();
    setScreen("intro");
    setDigit(null);
  }, [stopRaf]);

  // Clavier : flèches (palonnier) — actif seulement en cours de session.
  React.useEffect(() => {
    if (screen !== "running") return;
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
  }, [screen]);

  React.useEffect(() => () => stopRaf(), [stopRaf]);

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const svg = zoneRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    // Position du pointeur dans le repère du viewBox, puis normalisation sur la zone manche.
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    const nx = (p.x - MANCHE_CX) / MANCHE_RX;
    const ny = -(p.y - MANCHE_CY) / MANCHE_RY;
    mouseTarget.current = {
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    };
  }

  const phase = SECPIL_PHASES[hud.phaseIndex];
  const showManche = screen === "running" && phase.tasks.includes("manche");
  const showPalonnier = screen === "running" && phase.tasks.includes("palonnier");
  const showCalcul = screen === "running" && phase.tasks.includes("calcul");

  if (screen === "intro") {
    return <SecpilIntro onStart={start} />;
  }

  if (screen === "done") {
    return <SecpilResults results={results} onReplay={start} />;
  }

  const fillTone =
    hud.accuracy >= 80 ? "fill-success" : hud.accuracy >= 55 ? "fill-warning" : "fill-destructive";

  return (
    <div className="space-y-3">
      {/* Écran unique et immersif (toujours en thème sombre, façon cockpit) */}
      <div className="dark relative overflow-hidden rounded-lg border">
        <svg
          ref={zoneRef}
          viewBox="0 0 320 180"
          onPointerMove={handlePointer}
          className="bg-background block w-full touch-none"
          style={{ aspectRatio: "16 / 9", cursor: showManche ? "none" : "default" }}
          role="img"
          aria-label="Écran SECPIL : bande palonnier en haut, trajectoire du manche au centre, calcul mental en bas à droite."
        >
          {/* --- Bande palonnier (haut) --- */}
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

          {/* --- Séparateur --- */}
          <line
            x1={0}
            y1={44}
            x2={320}
            y2={44}
            className="stroke-foreground/30"
            strokeWidth={0.75}
          />

          {/* --- HUD --- */}
          <text x={10} y={57} className="fill-muted-foreground" fontSize={9}>
            Étape {phase.id}
          </text>
          <text x={310} y={57} textAnchor="end" className="fill-foreground" fontSize={11}>
            {hud.remainingS}
          </text>
          <text x={10} y={173} className={fillTone} fontSize={8}>
            Précision {hud.accuracy}%
          </text>

          {/* --- Zone manche : le « 8 » --- */}
          <path
            d={MANCHE_PATH}
            className={cn(
              "fill-none",
              showManche ? "stroke-muted-foreground/60" : "stroke-muted-foreground/20"
            )}
            strokeWidth={1}
            strokeDasharray="0.5 3.5"
            strokeLinecap="round"
          />
          {showManche && (
            <>
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

          {/* --- Calcul mental (gros chiffre, bas droite) --- */}
          {showCalcul && (
            <>
              <text x={306} y={112} textAnchor="end" className="fill-muted-foreground" fontSize={7}>
                additionnez →
              </text>
              <text
                x={306}
                y={168}
                textAnchor="end"
                className="fill-warning font-bold"
                fontSize={38}
              >
                {digit ?? ""}
              </text>
            </>
          )}
        </svg>

        {/* Bouton d'arrêt (coin haut droit) */}
        <button
          type="button"
          onClick={abort}
          className="border-border/50 bg-background/60 text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5 rounded-md border px-2 py-1 text-xs backdrop-blur"
        >
          Arrêter
        </button>

        {/* Saisie du calcul mental (superposée, même fenêtre) */}
        {showCalcul && (
          <div className="absolute right-2 bottom-2 w-28 text-right">
            <input
              type="number"
              inputMode="numeric"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              aria-label="Somme courante"
              className="border-input bg-background/80 text-foreground focus-visible:ring-ring w-full rounded-md border px-2 py-1 text-right text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
            />
            <p className="text-muted-foreground mt-0.5 text-[10px] tabular-nums">
              {mathTally.ok}/{mathTally.total} justes
            </p>
          </div>
        )}

        {/* Boutons tactiles palonnier (mobile) — dans la même fenêtre */}
        {showPalonnier && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-3 lg:hidden">
            <button
              type="button"
              aria-label="Palonnier à gauche"
              className="border-border/50 bg-background/70 text-foreground active:bg-primary active:text-primary-foreground pointer-events-auto flex h-12 w-16 items-center justify-center rounded-lg border text-xl select-none"
              onPointerDown={() => (keys.current.left = true)}
              onPointerUp={() => (keys.current.left = false)}
              onPointerLeave={() => (keys.current.left = false)}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Palonnier à droite"
              className="border-border/50 bg-background/70 text-foreground active:bg-primary active:text-primary-foreground pointer-events-auto flex h-12 w-16 items-center justify-center rounded-lg border text-xl select-none"
              onPointerDown={() => (keys.current.right = true)}
              onPointerUp={() => (keys.current.right = false)}
              onPointerLeave={() => (keys.current.right = false)}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">
          Phase {phase.id}/4 — {phase.label}.
        </span>{" "}
        {phase.consigne}
      </p>
    </div>
  );
}

function SecpilIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-card space-y-3 rounded-lg border p-5">
        <h2 className="text-xl font-semibold">Comment ça marche</h2>
        <ol className="text-muted-foreground list-decimal space-y-1.5 pl-5 text-sm">
          <li>
            <strong className="text-foreground">Phase 1 — palonnier seul.</strong> Gardez le
            réticule vertical sur la cible qui glisse, avec les flèches ◀ ▶.
          </li>
          <li>
            <strong className="text-foreground">Phase 2 — manche seul.</strong> Suivez le point qui
            parcourt le « 8 » avec la souris (ou le doigt).
          </li>
          <li>
            <strong className="text-foreground">Phase 3 — les deux à la fois.</strong> Souris et
            flèches en même temps.
          </li>
          <li>
            <strong className="text-foreground">Phase 4 — + calcul mental.</strong> On garde les
            deux commandes et on additionne les chiffres (somme courante) au fur et à mesure.
          </li>
        </ol>
        <p className="text-muted-foreground text-sm">
          Quatre phases de ~52 s, en continu. La note tient compte de la précision de suivi
          <em> et</em> de la progression au fil des phases.
        </p>
      </div>
      <div className="border-warning/40 bg-warning/5 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">Reconstitution pédagogique.</strong> Cet entraîneur
          reproduit le <em>principe</em> du SECPIL (attention partagée sur plusieurs tâches) avec
          des commandes accessibles — souris et flèches au lieu du manche et du palonnier. Il
          n&apos;est pas affilié aux armées et ne reproduit pas le logiciel officiel.
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
}: {
  results: SecpilPhaseScore[];
  onReplay: () => void;
}) {
  const global = globalScore(results);
  const trend = improvementTrend(results);
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-lg border p-5 text-center">
        <p className="text-muted-foreground text-sm">Score global</p>
        <p className={cn("text-5xl font-bold tabular-nums", scoreTone(global))}>{global}</p>
        {trend !== null && (
          <p className="text-muted-foreground mt-1 text-sm">
            Progression motrice{" "}
            <strong className={trend >= 0 ? "text-success" : "text-destructive"}>
              {trend >= 0 ? "+" : ""}
              {trend} pts
            </strong>{" "}
            entre la première et la dernière phase.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-2 text-left font-medium">Phase</th>
              <th className="p-2 text-right font-medium">Manche</th>
              <th className="p-2 text-right font-medium">Palonnier</th>
              <th className="p-2 text-right font-medium">Calcul</th>
              <th className="p-2 text-right font-medium">Global</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.phaseId} className="border-t">
                <td className="p-2">
                  {r.phaseId}. {SECPIL_PHASES[r.phaseId - 1].label}
                </td>
                <td className="p-2 text-right tabular-nums">{r.manche ?? "—"}</td>
                <td className="p-2 text-right tabular-nums">{r.palonnier ?? "—"}</td>
                <td className="p-2 text-right tabular-nums">{r.calcul ?? "—"}</td>
                <td
                  className={cn(
                    "p-2 text-right font-semibold tabular-nums",
                    scoreTone(phaseOverall(r))
                  )}
                >
                  {phaseOverall(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onReplay}>Rejouer</Button>
        <Button variant="outline" asChild>
          <Link href="/psychotechnique/exercices/le-secpil">Lire la méthode</Link>
        </Button>
      </div>
    </div>
  );
}
