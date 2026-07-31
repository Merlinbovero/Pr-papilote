"use client";

import * as React from "react";
import { PlancheChoix } from "@/components/planche/planche-commandes";
import { Interactive } from "./interactive";
import {
  AXE_INFO,
  AXE_LABELS,
  AXES,
  describeAxe,
  INITIAL_AXES,
  type Axe,
  type AxesState,
} from "./axes-model";

/**
 * Interaction « Les trois axes et les gouvernes » (cours 11). On choisit un axe
 * (tangage, roulis, lacet) et l'on voit, sur une vue de dessus de l'avion, l'axe
 * de rotation, la gouverne concernée et le mouvement produit. Modèle pur.
 */
export function AxesGouvernes({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<AxesState>(INITIAL_AXES);

  function setAxe(axe: Axe) {
    setState({ axe });
    onInteract?.();
  }
  function reset() {
    setState(INITIAL_AXES);
  }

  const info = AXE_INFO[state.axe];
  const isTangage = state.axe === "tangage";
  const isRoulis = state.axe === "roulis";
  const isLacet = state.axe === "lacet";

  const controls = (
    <PlancheChoix
      legende="Axe de rotation"
      nom="axe-rotation"
      options={AXES.map((a) => ({ valeur: a, libelle: AXE_LABELS[a] }))}
      valeur={state.axe}
      onChange={setAxe}
    />
  );

  const legend = (
    <p>
      <strong>{AXE_LABELS[state.axe]}</strong> — gouverne : {info.gouverne} ; commande :{" "}
      {info.commande}. Effet : {info.mouvement}.
    </p>
  );

  return (
    <Interactive
      title="Les trois axes et les gouvernes"
      consigne="Choisissez un axe et repérez la gouverne concernée et le mouvement produit."
      textAlternative={describeAxe(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 260"
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label={describeAxe(state)}
      >
        <defs>
          <marker
            id="ax-a"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="pl-f-mod" />
          </marker>
        </defs>

        {/* Avion vu de dessus (nez en haut) */}
        <g className="pl-t-encre pl-f-creux" strokeWidth={2}>
          {/* Fuselage */}
          <path d="M204,40 q6,-8 12,0 v150 q-6,10 -12,0 z" />
          {/* Ailes */}
          <path d="M90,120 h330 v14 h-330 z" transform="translate(-90,0)" />
          {/* Empennage horizontal */}
          <path d="M165,188 h90 v10 h-90 z" />
        </g>

        {/* Axe longitudinal (roulis) */}
        <line
          x1="210"
          y1="30"
          x2="210"
          y2="210"
          className={isRoulis ? "pl-t-mod" : "pl-t-mince"}
          strokeWidth={isRoulis ? 2.5 : 1.5}
          strokeDasharray="6 4"
        />
        {/* Axe transversal (tangage) */}
        <line
          x1="70"
          y1="127"
          x2="350"
          y2="127"
          className={isTangage ? "pl-t-mod" : "pl-t-mince"}
          strokeWidth={isTangage ? 2.5 : 1.5}
          strokeDasharray="6 4"
        />
        {/* Axe vertical (lacet) — perpendiculaire à l'écran, au centre de gravité */}
        <circle
          cx="210"
          cy="127"
          r={isLacet ? 7 : 4}
          className={isLacet ? "pl-f-mod" : "pl-f-creux"}
        />

        {/* Gouvernes surlignées selon l'axe */}
        {/* Ailerons (roulis) — bouts d'ailes */}
        <rect
          x="40"
          y="128"
          width="34"
          height="8"
          className={isRoulis ? "pl-f-mod" : "pl-f-creux"}
        />
        <rect
          x="346"
          y="128"
          width="34"
          height="8"
          className={isRoulis ? "pl-f-mod" : "pl-f-creux"}
        />
        {/* Gouverne de profondeur (tangage) — bord de fuite empennage */}
        <rect
          x="165"
          y="196"
          width="90"
          height="7"
          className={isTangage ? "pl-f-mod" : "pl-f-creux"}
        />
        {/* Gouverne de direction (lacet) — au tail sur l'axe */}
        <rect
          x="206"
          y="188"
          width="8"
          height="26"
          className={isLacet ? "pl-f-mod" : "pl-f-creux"}
        />

        {/* Flèche de rotation selon l'axe */}
        {isTangage ? (
          <path
            d="M232,64 a26,26 0 0 1 0,44"
            className="pl-t-mod"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#ax-a)"
          />
        ) : null}
        {isRoulis ? (
          <path
            d="M300,150 a30,18 0 0 1 -60,0"
            className="pl-t-mod"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#ax-a)"
          />
        ) : null}
        {isLacet ? (
          <path
            d="M182,58 a30,30 0 0 1 56,0"
            className="pl-t-mod"
            strokeWidth={2.5}
            fill="none"
            markerEnd="url(#ax-a)"
          />
        ) : null}

        <text x="210" y="240" textAnchor="middle" className="pl-f-encre">
          {info.axeGeometrique}
        </text>
      </svg>
    </Interactive>
  );
}
