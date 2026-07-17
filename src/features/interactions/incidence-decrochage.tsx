"use client";

import * as React from "react";
import { Interactive } from "./interactive";
import {
  describeIncidence,
  incidenceMetrics,
  INCIDENCE_LABELS,
  INCIDENCE_LEVELS,
  INITIAL_INCIDENCE,
  type IncidenceLevel,
  type IncidenceState,
} from "./incidence-model";

/**
 * Interaction « Incidence et décrochage » (cours 7). On augmente l'incidence et
 * l'on observe l'écoulement rester collé, puis atteindre l'incidence critique,
 * puis décoller de l'extrados — la portance chute : c'est le décrochage.
 * Pas de simulateur : quatre états parlants, calculés par le modèle pur.
 */
export function IncidenceDecrochage({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<IncidenceState>(INITIAL_INCIDENCE);

  function setLevel(level: IncidenceLevel) {
    setState({ level });
    onInteract?.();
  }
  function reset() {
    setState(INITIAL_INCIDENCE);
  }

  const m = incidenceMetrics(state.level);
  // Barre de Cz (0 à 1,5 → 0 à 120 px).
  const czBar = Math.round((m.cz / 1.5) * 120);

  const controls = (
    <fieldset className="flex flex-wrap items-center gap-3 border-0 p-0">
      <legend className="text-muted-foreground mr-1 text-sm">Angle d’incidence :</legend>
      {INCIDENCE_LEVELS.map((lvl) => (
        <label key={lvl} className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="incidence-level"
            checked={state.level === lvl}
            onChange={() => setLevel(lvl)}
          />
          {INCIDENCE_LABELS[lvl]}
        </label>
      ))}
    </fieldset>
  );

  const legend = (
    <p>
      Coefficient de portance <strong>Cz ≈ {m.cz.toFixed(2)}</strong>.{" "}
      {m.flow === "colle" ? (
        <>L’écoulement suit le profil : la portance croît avec l’incidence.</>
      ) : m.flow === "limite" ? (
        <>
          <strong>Incidence critique</strong> : Cz maximal, l’écoulement est à la limite du
          décollement.
        </>
      ) : (
        <>
          <strong>Décrochage</strong> : l’écoulement décolle de l’extrados, la portance s’effondre.
        </>
      )}
    </p>
  );

  return (
    <Interactive
      title="Incidence et décrochage"
      consigne="Augmentez l’angle d’incidence et observez l’écoulement puis la portance."
      textAlternative={describeIncidence(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 260"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={describeIncidence(state)}
      >
        <defs>
          <marker
            id="id-arrow"
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

        {/* Vent relatif */}
        <line
          className="stroke-foreground"
          strokeWidth={2}
          x1="20"
          y1="150"
          x2="70"
          y2="150"
          markerEnd="url(#id-arrow)"
        />
        <text x="20" y="142" className="fill-foreground text-xs">
          vent relatif
        </text>

        {/* Profil incliné selon l'incidence (rotation autour du 1/4 avant) */}
        <g transform={`rotate(${-m.angle} 150 150)`}>
          <path
            d="M100,150 q60,-22 130,-4 q-60,16 -130,4 z"
            className="stroke-foreground fill-foreground/10"
            strokeWidth={2}
          />
        </g>

        {/* Filets d'air sur l'extrados : collés, ou décollés (sillage turbulent) */}
        {m.flow !== "decolle" ? (
          <g className="stroke-primary" strokeWidth={2} fill="none">
            <path d="M95,120 q60,-30 135,-18" markerEnd="url(#id-arrow)" />
            <path d="M95,132 q60,-24 135,-12" markerEnd="url(#id-arrow)" />
            {m.flow === "limite" ? (
              <path
                d="M95,144 q55,-16 110,-6 q15,2 28,10"
                markerEnd="url(#id-arrow)"
                strokeDasharray="4 3"
              />
            ) : (
              <path d="M95,144 q60,-16 135,-6" markerEnd="url(#id-arrow)" />
            )}
          </g>
        ) : (
          <g className="stroke-primary" strokeWidth={2} fill="none">
            {/* Le filet décolle tôt puis part en tourbillons (sillage) */}
            <path d="M95,120 q30,-18 60,-16" markerEnd="url(#id-arrow)" />
            <path d="M158,100 a10,10 0 1 0 10,10 a6,6 0 1 1 -6,-6" strokeDasharray="3 3" />
            <path d="M186,104 a11,11 0 1 1 -11,11 a6,6 0 1 0 6,-6" strokeDasharray="3 3" />
            <path d="M214,108 a10,10 0 1 0 10,10 a6,6 0 1 1 -6,-6" strokeDasharray="3 3" />
            <text x="210" y="86" textAnchor="middle" className="fill-primary text-xs">
              décollement
            </text>
          </g>
        )}

        {/* Jauge de Cz */}
        <text x="300" y="196" className="fill-foreground text-xs">
          Cz
        </text>
        <rect x="318" y="180" width="80" height="14" className="fill-foreground/10" />
        <rect x="318" y="180" width={Math.min(czBar, 80)} height="14" className="fill-primary" />
        <text x="358" y="216" textAnchor="middle" className="fill-foreground text-xs">
          {m.cz.toFixed(2)}
        </text>
        {m.stalled ? (
          <text x="200" y="240" textAnchor="middle" className="fill-primary text-xs font-semibold">
            décrochage — la portance chute
          </text>
        ) : null}
      </svg>
    </Interactive>
  );
}
