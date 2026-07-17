"use client";

import * as React from "react";
import { Interactive } from "./interactive";
import {
  CENTRAGE_LABELS,
  centrageMetrics,
  CG_MAX,
  CG_MIN,
  describeCentrage,
  FOYER,
  INITIAL_CENTRAGE,
  LIMITE_ARRIERE,
  LIMITE_AVANT,
  type CentrageState,
} from "./centrage-model";

/**
 * Interaction « Simulateur de centrage » (cours 14). On déplace le centre de
 * gravité le long de la corde et l'on lit la marge statique par rapport au
 * foyer, ainsi que la qualification du centrage (avant, arrière, hors plage,
 * instable). Modèle pur, valeurs pédagogiques.
 */
const AX = { x0: 60, x1: 384 };

function px(pct: number): number {
  return AX.x0 + ((pct - CG_MIN) / (CG_MAX - CG_MIN)) * (AX.x1 - AX.x0);
}

export function Centrage({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<CentrageState>(INITIAL_CENTRAGE);

  function setCg(cg: number) {
    setState({ cg });
    onInteract?.();
  }
  function reset() {
    setState(INITIAL_CENTRAGE);
  }

  const m = centrageMetrics(state.cg);

  const controls = (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor="centrage-cg" className="text-muted-foreground text-sm">
        Centre de gravité : <strong className="text-foreground">{m.cg} %</strong> de la corde
      </label>
      <input
        id="centrage-cg"
        type="range"
        min={CG_MIN}
        max={CG_MAX}
        step={1}
        value={m.cg}
        onChange={(e) => setCg(Number(e.target.value))}
        className="w-full max-w-sm"
      />
    </div>
  );

  const legend = (
    <p>
      Marge statique <strong>{m.margeStatique.toFixed(0)} points</strong> —{" "}
      {CENTRAGE_LABELS[m.statut]}.
      {m.dansLaPlage
        ? " Le centre de gravité est dans la plage admise."
        : " Attention : centrage hors plage."}
    </p>
  );

  return (
    <Interactive
      title="Simulateur de centrage"
      consigne="Déplacez le centre de gravité et observez la marge statique et la plage de centrage."
      textAlternative={describeCentrage(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 180"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={describeCentrage(state)}
      >
        {/* Corde (axe) */}
        <line
          x1={AX.x0}
          y1="96"
          x2={AX.x1}
          y2="96"
          className="stroke-foreground/60"
          strokeWidth={2}
        />
        <text x={AX.x0} y="150" className="fill-foreground text-xs">
          bord d’attaque
        </text>
        <text x={AX.x1} y="150" textAnchor="end" className="fill-foreground text-xs">
          bord de fuite
        </text>

        {/* Plage de centrage admise */}
        <rect
          x={px(LIMITE_AVANT)}
          y="84"
          width={px(LIMITE_ARRIERE) - px(LIMITE_AVANT)}
          height="24"
          className="fill-success/20 stroke-success"
          strokeWidth={1}
        />
        <text
          x={(px(LIMITE_AVANT) + px(LIMITE_ARRIERE)) / 2}
          y="76"
          textAnchor="middle"
          className="fill-foreground text-xs"
        >
          plage de centrage
        </text>

        {/* Foyer */}
        <line
          x1={px(FOYER)}
          y1="70"
          x2={px(FOYER)}
          y2="122"
          className="stroke-foreground"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text x={px(FOYER)} y="136" textAnchor="middle" className="fill-foreground text-xs">
          foyer ({FOYER} %)
        </text>

        {/* Marqueur du centre de gravité */}
        <g>
          <circle
            cx={px(m.cg)}
            cy="96"
            r="8"
            className={m.dansLaPlage ? "fill-primary" : "fill-destructive"}
          />
          <text
            x={px(m.cg)}
            y="60"
            textAnchor="middle"
            className={
              m.dansLaPlage ? "fill-primary text-xs" : "fill-destructive text-xs font-semibold"
            }
          >
            CG {m.cg} %
          </text>
        </g>
      </svg>
    </Interactive>
  );
}
