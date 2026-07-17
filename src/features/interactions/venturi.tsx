"use client";

import * as React from "react";
import { Interactive } from "./interactive";
import {
  CONSTRICTION_LABELS,
  CONSTRICTIONS,
  describeVenturi,
  INITIAL_VENTURI,
  V1,
  venturiMetrics,
  type Constriction,
  type VenturiState,
} from "./venturi-model";

/**
 * Interaction « Effet Venturi » (cours 3). On choisit un niveau de
 * rétrécissement du conduit et l'on observe, au col, la vitesse qui augmente et
 * la pression statique qui chute — pression totale conservée (Bernoulli).
 * Pas de simulateur : trois états parlants, calculés par le modèle pur.
 */
export function Venturi({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<VenturiState>(INITIAL_VENTURI);

  function setConstriction(constriction: Constriction) {
    setState({ constriction });
    onInteract?.();
  }
  function reset() {
    setState(INITIAL_VENTURI);
  }

  const m = venturiMetrics(state.constriction);
  // Géométrie du conduit : demi-hauteur large 45 px, col = 45·ratio.
  const half = 45;
  const throat = half * m.ratio;
  const top = 120 - throat;
  const bottom = 120 + throat;
  // Longueur des flèches de vitesse (px), proportionnelle au facteur.
  const v1Len = 28;
  const v2Len = Math.round(28 * m.speedFactor);
  // Barres de pression statique (schématiques) : plus le col est étroit,
  // plus la pression y est basse.
  const p1Bar = 56;
  const p2Bar = Math.round(56 * m.ratio);

  const controls = (
    <fieldset className="flex flex-wrap items-center gap-3 border-0 p-0">
      <legend className="text-muted-foreground mr-1 text-sm">Rétrécissement du conduit :</legend>
      {CONSTRICTIONS.map((c) => (
        <label key={c} className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="venturi-constriction"
            checked={state.constriction === c}
            onChange={() => setConstriction(c)}
          />
          {CONSTRICTION_LABELS[c]}
        </label>
      ))}
    </fieldset>
  );

  const legend = (
    <p>
      Au col, la vitesse passe de <strong>{V1} m/s</strong> à{" "}
      <strong>{Math.round(m.v2)} m/s</strong> (×{Math.round(m.speedFactor)}) ; la pression statique{" "}
      {state.constriction === "aucun" ? (
        "ne change pas"
      ) : (
        <>
          <strong>chute d’environ {Math.round(m.deltaP)} Pa</strong>
        </>
      )}
      . La <strong>pression totale</strong> (statique + dynamique) reste conservée — c’est le
      théorème de <strong>Bernoulli</strong>.
    </p>
  );

  return (
    <Interactive
      title="Effet Venturi : vitesse et pression"
      consigne="Choisissez le rétrécissement du conduit et observez, au col, la vitesse et la pression."
      textAlternative={describeVenturi(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 240"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={describeVenturi(state)}
      >
        <defs>
          <marker
            id="vt-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="fill-primary" />
          </marker>
        </defs>

        {/* Parois du conduit (col variable) */}
        <g className="stroke-foreground fill-none" strokeWidth={2}>
          <polyline
            points={`30,${120 - half} 150,${120 - half} 200,${top} 240,${top} 290,${120 - half} 390,${120 - half}`}
          />
          <polyline
            points={`30,${120 + half} 150,${120 + half} 200,${bottom} 240,${bottom} 290,${120 + half} 390,${120 + half}`}
          />
        </g>

        {/* Flèche de vitesse à l'entrée */}
        <line
          className="stroke-primary"
          strokeWidth={3}
          x1="60"
          y1="120"
          x2={60 + v1Len}
          y2="120"
          markerEnd="url(#vt-arrow)"
        />
        <text x="60" y={120 - half - 8} className="fill-foreground text-xs">
          entrée · V₁ = {V1} m/s
        </text>

        {/* Flèche de vitesse au col */}
        <line
          className="stroke-primary"
          strokeWidth={3}
          x1="188"
          y1="120"
          x2={188 + v2Len}
          y2="120"
          markerEnd="url(#vt-arrow)"
        />
        <text x="220" y={top - 8} textAnchor="middle" className="fill-primary text-xs">
          col · V₂ = {Math.round(m.v2)} m/s
        </text>

        {/* Indicateurs de pression statique (schématiques) */}
        <g>
          <rect x="96" y={210 - p1Bar} width="14" height={p1Bar} className="fill-foreground/70" />
          <text x="103" y="228" textAnchor="middle" className="fill-foreground text-xs">
            p₁
          </text>
          <rect x="213" y={210 - p2Bar} width="14" height={p2Bar} className="fill-primary/70" />
          <text x="220" y="228" textAnchor="middle" className="fill-primary text-xs">
            p₂
          </text>
        </g>
      </svg>
    </Interactive>
  );
}
