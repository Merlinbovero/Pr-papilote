"use client";

import * as React from "react";
import { Interactive } from "./interactive";
import {
  ALPHA_MAX,
  ALPHA_MIN,
  describePolaire,
  INITIAL_POLAIRE,
  polaireCurve,
  polaireMetrics,
  REMARQUABLE_LABELS,
  type PolaireState,
} from "./polaire-model";

/**
 * Interaction « Polaire d'Eiffel » (cours 8). On déplace l'angle d'incidence et
 * un point parcourt la courbe Cz–Cx : on lit le Cz, le Cx, la finesse (Cz/Cx),
 * et l'on repère les points remarquables (portance nulle, finesse maximale,
 * Cz maximal, décrochage). Modèle pur, courbe pédagogique.
 */
const PLOT = { x0: 60, x1: 384, y0: 200, yTop: 28, cxMax: 0.28, czMax: 1.7 };

function sx(cx: number): number {
  return PLOT.x0 + (cx / PLOT.cxMax) * (PLOT.x1 - PLOT.x0);
}
function sy(cz: number): number {
  return PLOT.y0 - (Math.max(cz, 0) / PLOT.czMax) * (PLOT.y0 - PLOT.yTop);
}

export function Polaire({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<PolaireState>(INITIAL_POLAIRE);

  function setAlpha(alpha: number) {
    setState({ alpha });
    onInteract?.();
  }
  function reset() {
    setState(INITIAL_POLAIRE);
  }

  const m = polaireMetrics(state.alpha);
  const curve = React.useMemo(() => polaireCurve(1).filter((p) => p.cz >= 0), []);
  const path = curve.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.cx)},${sy(p.cz)}`).join(" ");

  const controls = (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor="polaire-alpha" className="text-muted-foreground text-sm">
        Angle d’incidence : <strong className="text-foreground">{m.alpha}°</strong>
      </label>
      <input
        id="polaire-alpha"
        type="range"
        min={ALPHA_MIN}
        max={ALPHA_MAX}
        step={1}
        value={m.alpha}
        onChange={(e) => setAlpha(Number(e.target.value))}
        className="w-full max-w-sm"
      />
    </div>
  );

  const legend = (
    <p>
      <strong>Cz ≈ {m.cz.toFixed(2)}</strong> · <strong>Cx ≈ {m.cx.toFixed(3)}</strong> ·{" "}
      <strong>finesse ≈ {m.finesse.toFixed(1)}</strong> — {REMARQUABLE_LABELS[m.remarquable]}.
    </p>
  );

  return (
    <Interactive
      title="La polaire d’Eiffel"
      consigne="Déplacez l’angle d’incidence et suivez le point sur la courbe Cz–Cx."
      textAlternative={describePolaire(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 240"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={describePolaire(state)}
      >
        {/* Axes */}
        <g className="stroke-foreground/60" strokeWidth={1.5}>
          <line x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x1} y2={PLOT.y0} />
          <line x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x0} y2={PLOT.yTop} />
        </g>
        <text x={PLOT.x1} y={PLOT.y0 + 16} textAnchor="end" className="fill-foreground text-xs">
          Cx (traînée)
        </text>
        <text
          x={PLOT.x0 - 6}
          y={PLOT.yTop + 2}
          textAnchor="end"
          className="fill-foreground text-xs"
        >
          Cz
        </text>

        {/* Tangente de finesse maximale (depuis l'origine) */}
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(m.remarquable === "finesse-max" ? m.cx : polaireMetrics(6).cx)}
          y2={sy(m.remarquable === "finesse-max" ? m.cz : polaireMetrics(6).cz)}
          className="stroke-foreground/30"
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {/* Courbe polaire */}
        <path d={path} className="stroke-primary" strokeWidth={2.5} fill="none" />

        {/* Point courant */}
        <circle cx={sx(m.cx)} cy={sy(m.cz)} r={5} className="fill-primary" />
        <text x={sx(m.cx) + 8} y={sy(m.cz) - 6} className="fill-primary text-xs">
          {m.alpha}°
        </text>

        {m.remarquable === "decrochage" ? (
          <text x="210" y="230" textAnchor="middle" className="fill-primary text-xs font-semibold">
            décrochage — la portance chute
          </text>
        ) : null}
      </svg>
    </Interactive>
  );
}
