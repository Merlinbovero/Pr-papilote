"use client";

import * as React from "react";
import { Interactive } from "./interactive";
import {
  describeSoufflerie,
  INITIAL_SOUFFLERIE,
  ZONE_LABELS,
  ZONE_ROLES,
  ZONES,
  type SoufflerieState,
  type Zone,
} from "./soufflerie-model";

/**
 * Interaction « Soufflerie à zones » (cours 4). On sélectionne une zone de la
 * soufflerie (collecteur, veine d'essai, diffuseur, ventilateur) et l'on en lit
 * le rôle, la zone étant surlignée sur le schéma. Modèle pur, accessible au
 * clavier via des boutons radio.
 */
export function SoufflerieZones({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<SoufflerieState>(INITIAL_SOUFFLERIE);

  function setZone(zone: Zone) {
    setState({ zone });
    onInteract?.();
  }
  function reset() {
    setState(INITIAL_SOUFFLERIE);
  }

  const active = (zone: Zone) =>
    state.zone === zone
      ? "fill-primary/25 stroke-primary"
      : "fill-foreground/5 stroke-foreground/40";

  const controls = (
    <fieldset className="flex flex-wrap items-center gap-3 border-0 p-0">
      <legend className="text-muted-foreground mr-1 text-sm">Zone :</legend>
      {ZONES.map((z) => (
        <label key={z} className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name="soufflerie-zone"
            checked={state.zone === z}
            onChange={() => setZone(z)}
          />
          {ZONE_LABELS[z]}
        </label>
      ))}
    </fieldset>
  );

  const legend = (
    <p>
      <strong>{ZONE_LABELS[state.zone]}</strong> — {ZONE_ROLES[state.zone]}
    </p>
  );

  return (
    <Interactive
      title="La soufflerie à zones"
      consigne="Choisissez une zone de la soufflerie pour en découvrir le rôle."
      textAlternative={describeSoufflerie(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 180"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={describeSoufflerie(state)}
      >
        {/* Collecteur (convergent) */}
        <polygon
          points="20,40 130,66 130,114 20,140"
          className={active("collecteur")}
          strokeWidth={2}
        />
        {/* Veine d'essai */}
        <rect x="130" y="66" width="120" height="48" className={active("veine")} strokeWidth={2} />
        {/* Diffuseur (divergent) */}
        <polygon
          points="250,66 250,114 340,140 340,40"
          className={active("diffuseur")}
          strokeWidth={2}
        />
        {/* Ventilateur */}
        <g className={active("ventilateur")} strokeWidth={2}>
          <circle cx="372" cy="90" r="24" />
          <line x1="372" y1="66" x2="372" y2="114" className="stroke-foreground/60" />
          <line x1="348" y1="90" x2="396" y2="90" className="stroke-foreground/60" />
        </g>

        {/* Maquette dans la veine */}
        <path
          d="M170,90 q22,-8 44,0 q-22,8 -44,0 z"
          className="fill-foreground/40 stroke-foreground"
          strokeWidth={1}
        />

        <text x="75" y="162" textAnchor="middle" className="fill-foreground text-xs">
          collecteur
        </text>
        <text x="190" y="162" textAnchor="middle" className="fill-foreground text-xs">
          veine d’essai
        </text>
        <text x="295" y="162" textAnchor="middle" className="fill-foreground text-xs">
          diffuseur
        </text>
        <text x="372" y="162" textAnchor="middle" className="fill-foreground text-xs">
          ventilateur
        </text>
      </svg>
    </Interactive>
  );
}
