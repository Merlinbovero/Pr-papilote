"use client";

import * as React from "react";
import { PlancheChoix } from "@/components/planche/planche-commandes";
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
    state.zone === zone ? "pl-f-mod-clair pl-t-mod" : "pl-f-creux pl-t-filet";

  const controls = (
    <PlancheChoix
      legende="Zone"
      nom="soufflerie-zone"
      options={ZONES.map((z) => ({ valeur: z, libelle: ZONE_LABELS[z] }))}
      valeur={state.zone}
      onChange={setZone}
    />
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
          <line x1="372" y1="66" x2="372" y2="114" className="pl-t-filet" />
          <line x1="348" y1="90" x2="396" y2="90" className="pl-t-filet" />
        </g>

        {/* Maquette dans la veine */}
        <path
          d="M170,90 q22,-8 44,0 q-22,8 -44,0 z"
          className="pl-f-creux pl-t-encre"
          strokeWidth={1}
        />

        <text x="75" y="162" textAnchor="middle" className="pl-f-encre">
          collecteur
        </text>
        <text x="190" y="162" textAnchor="middle" className="pl-f-encre">
          veine d’essai
        </text>
        <text x="295" y="162" textAnchor="middle" className="pl-f-encre">
          diffuseur
        </text>
        <text x="372" y="162" textAnchor="middle" className="pl-f-encre">
          ventilateur
        </text>
      </svg>
    </Interactive>
  );
}
