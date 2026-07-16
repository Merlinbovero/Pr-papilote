"use client";

import * as React from "react";
import { Interactive } from "./interactive";
import {
  describeForces,
  FORCE_KEYS,
  FORCE_LABELS,
  INITIAL_STATE,
  resultante,
  type ForceKey,
  type ForcesState,
  type Scenario,
} from "./forces-model";

/**
 * Interaction « Forces et vecteurs sur un avion » (cours 1). Simple mais
 * réellement pédagogique : afficher/masquer chaque force, basculer entre une
 * situation équilibrée et une accélération, et lire à chaque fois la
 * résultante. Pas de simulateur physique — un premier pas concret.
 */
export function ForcesEtVecteurs({ onInteract }: { onInteract?: () => void }) {
  const [state, setState] = React.useState<ForcesState>(INITIAL_STATE);

  function update(next: ForcesState) {
    setState(next);
    onInteract?.();
  }

  function setScenario(scenario: Scenario) {
    update({ ...state, scenario });
  }
  function toggle(key: ForceKey) {
    update({ ...state, visible: { ...state.visible, [key]: !state.visible[key] } });
  }
  function reset() {
    setState(INITIAL_STATE);
  }

  const accel = state.scenario === "acceleration";
  // Longueurs des vecteurs (px). En accélération, traction > traînée.
  const tractionLen = accel ? 95 : 70;
  const traineeLen = 70;
  const res = resultante(state.scenario);

  const controls = (
    <>
      <fieldset className="flex items-center gap-3 border-0 p-0">
        <legend className="text-muted-foreground mr-1 text-sm">Situation :</legend>
        {(["equilibre", "acceleration"] as Scenario[]).map((s) => (
          <label key={s} className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="scenario-forces"
              checked={state.scenario === s}
              onChange={() => setScenario(s)}
            />
            {s === "equilibre" ? "Équilibre" : "Accélération"}
          </label>
        ))}
      </fieldset>
      <fieldset className="flex flex-wrap items-center gap-3 border-0 p-0">
        <legend className="text-muted-foreground mr-1 text-sm">Afficher :</legend>
        {FORCE_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-1.5 text-sm">
            <input type="checkbox" checked={state.visible[k]} onChange={() => toggle(k)} />
            {FORCE_LABELS[k]}
          </label>
        ))}
      </fieldset>
    </>
  );

  const legend = (
    <p>
      <strong>Résultante</strong> — {res.nulle ? "nulle (équilibre)" : "non nulle (vers l'avant)"}.
      Une force est un vecteur : direction, sens, intensité et point d’application (le centre de
      gravité, ici).
    </p>
  );

  return (
    <Interactive
      title="Forces et vecteurs sur un avion"
      consigne="Affichez ou masquez chaque force, changez de situation, et observez la résultante."
      textAlternative={describeForces(state)}
      controls={controls}
      legend={legend}
      onReset={reset}
    >
      <svg
        viewBox="0 0 420 300"
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label={describeForces(state)}
      >
        <defs>
          <marker
            id="fv-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
          </marker>
          <marker
            id="fv-arrow-accent"
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
        {/* Avion simplifié */}
        <g className="stroke-foreground fill-none" strokeWidth={2}>
          <path d="M120,150 q90,-26 200,0 q-90,26 -200,0 z" />
          <line x1="210" y1="132" x2="202" y2="104" />
          <line x1="210" y1="132" x2="218" y2="104" />
        </g>
        <circle cx="220" cy="150" r="4" className="fill-foreground" />
        {/* Portance (haut, accent) */}
        {state.visible.portance && (
          <g className="stroke-primary" strokeWidth={3}>
            <line x1="220" y1="142" x2="220" y2="70" markerEnd="url(#fv-arrow-accent)" />
            <text x="228" y="76" className="fill-primary text-xs">
              Portance
            </text>
          </g>
        )}
        {/* Poids (bas) */}
        {state.visible.poids && (
          <g className="stroke-foreground" strokeWidth={2}>
            <line x1="220" y1="158" x2="220" y2="250" markerEnd="url(#fv-arrow)" />
            <text x="228" y="240" className="fill-foreground text-xs">
              Poids
            </text>
          </g>
        )}
        {/* Traction (avant/droite, accent) */}
        {state.visible.traction && (
          <g className="stroke-primary" strokeWidth={3}>
            <line
              x1="300"
              y1="150"
              x2={300 + tractionLen}
              y2="150"
              markerEnd="url(#fv-arrow-accent)"
            />
            <text x="316" y="142" className="fill-primary text-xs">
              Traction
            </text>
          </g>
        )}
        {/* Traînée (arrière/gauche) */}
        {state.visible.trainee && (
          <g className="stroke-foreground" strokeWidth={2}>
            <line x1="140" y1="150" x2={140 - traineeLen} y2="150" markerEnd="url(#fv-arrow)" />
            <text x="30" y="142" className="fill-foreground text-xs">
              Traînée
            </text>
          </g>
        )}
      </svg>
    </Interactive>
  );
}
