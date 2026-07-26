import * as React from "react";

import { cn } from "@/lib/utils";
import type { Domino, DominoPuzzle } from "@/lib/psychotech/dominos";

/**
 * Rendu des dominos — SVG maison, sur les tokens du design system.
 *
 * Une tuile est un rectangle vertical partagé en deux carrés ; les points
 * suivent la disposition d'un dé, et le **blanc (0) est une moitié vide**,
 * jamais un « 0 » écrit. Ce composant sert aussi bien au test dédié qu'à la
 * famille « Dominos » de l'entraînement chronométré : un seul rendu, donc
 * aucune divergence possible entre les deux.
 */

/** Positions des points d'une moitié, en repère unitaire (0 → 1). */
const PIPS: Record<number, [number, number][]> = {
  0: [],
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.26, 0.26],
    [0.5, 0.5],
    [0.74, 0.74],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.26, 0.26],
    [0.74, 0.26],
    [0.5, 0.5],
    [0.26, 0.74],
    [0.74, 0.74],
  ],
  6: [
    [0.28, 0.22],
    [0.72, 0.22],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.78],
    [0.72, 0.78],
  ],
};

/** Une moitié fait un carré de 100 ; une tuile mesure donc 100 × 200. */
const HALF = 100;
const PIP_R = 9;

function Half({
  value,
  y,
  tone,
}: {
  value: number | null;
  y: number;
  tone: "normal" | "missing" | "correct" | "wrong";
}) {
  const pipClass =
    tone === "wrong" ? "fill-destructive" : tone === "correct" ? "fill-success" : "fill-foreground";
  return (
    <g>
      <rect
        x={0}
        y={y}
        width={HALF}
        height={HALF}
        className={cn(
          "fill-none",
          tone === "missing"
            ? "stroke-primary"
            : tone === "wrong"
              ? "stroke-destructive"
              : tone === "correct"
                ? "stroke-success"
                : "stroke-foreground/70"
        )}
        strokeWidth={4}
      />
      {value === null ? (
        <text
          x={HALF / 2}
          y={y + HALF / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-primary font-bold"
          fontSize={52}
        >
          ?
        </text>
      ) : (
        PIPS[value].map(([px, py], i) => (
          <circle key={i} cx={px * HALF} cy={y + py * HALF} r={PIP_R} className={pipClass} />
        ))
      )}
    </g>
  );
}

export type DominoTone = "normal" | "missing" | "correct" | "wrong";

/**
 * Une **moitié** seule, pour le pavé de saisie : on y choisit une valeur en
 * reconnaissant des points, pas en lisant un chiffre — c'est l'exercice.
 */
export function DominoHalfTile({
  value,
  size = 30,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={`-4 -4 ${HALF + 8} ${HALF + 8}`}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <Half value={value} y={0} tone="normal" />
    </svg>
  );
}

/**
 * Une tuile isolée. `size` est la largeur en pixels ; la hauteur en découle
 * (une tuile est deux fois plus haute que large).
 */
export function DominoTile({
  domino,
  size = 44,
  tone = "normal",
  label,
  className,
}: {
  /** `null` pour une moitié inconnue (affichée « ? »). */
  domino: { top: number | null; bottom: number | null };
  size?: number;
  tone?: DominoTone;
  /** Description accessible ; sinon la tuile est décorative. */
  label?: string;
  className?: string;
}) {
  const describe = (value: number | null) => (value === null ? "inconnue" : `${value}`);
  return (
    <svg
      viewBox={`-4 -4 ${HALF + 8} ${HALF * 2 + 8}`}
      width={size}
      height={size * 2}
      className={cn("shrink-0", className)}
      role={label ? "img" : "presentation"}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
    >
      <title>{label ?? `Domino ${describe(domino.top)} sur ${describe(domino.bottom)}`}</title>
      <Half value={domino.top} y={0} tone={tone} />
      <Half value={domino.bottom} y={HALF} tone={tone} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Série complète
// ---------------------------------------------------------------------------

/** Écartement entre deux tuiles voisines, en unités de largeur de tuile. */
const GAP_X = 1.5;
const GAP_Y = 2.5;

/**
 * La série d'une question : les tuiles à leur place, la tuile masquée en
 * évidence, et les liens de lecture quand la disposition n'est pas
 * conventionnelle.
 */
export function DominoSeries({
  puzzle,
  answer,
  tileSize = 46,
  revealed,
}: {
  puzzle: DominoPuzzle;
  /** Réponse en cours, affichée dans la case masquée. */
  answer?: { top: number | null; bottom: number | null };
  tileSize?: number;
  /** À la correction : la bonne tuile, teintée selon la justesse. */
  revealed?: { domino: Domino; tone: DominoTone };
}) {
  const xs = puzzle.places.map((p) => p.x);
  const ys = puzzle.places.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  // Repère : une tuile occupe 1 × 2 unités, écartée de GAP_X / GAP_Y.
  const cellW = tileSize * GAP_X;
  const cellH = tileSize * GAP_Y;
  const width = (maxX - minX) * cellW + tileSize;
  const height = (maxY - minY) * cellH + tileSize * 2;

  const at = (i: number) => ({
    left: (puzzle.places[i].x - minX) * cellW,
    top: (puzzle.places[i].y - minY) * cellH,
  });
  const centre = (i: number) => {
    const p = at(i);
    return { x: p.left + tileSize / 2, y: p.top + tileSize };
  };

  return (
    <div className="flex w-full justify-center overflow-x-auto">
      <div className="relative shrink-0" style={{ width, height }}>
        {puzzle.edges.length > 0 ? (
          <svg
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
            aria-hidden
          >
            {puzzle.edges.map(([a, b], i) => {
              const from = centre(a);
              const to = centre(b);
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="stroke-muted-foreground/35"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>
        ) : null}

        {puzzle.tiles.map((tile, i) => {
          const position = at(i);
          const missing = i === puzzle.missingIndex;
          const shown = missing
            ? (revealed?.domino ?? { top: answer?.top ?? null, bottom: answer?.bottom ?? null })
            : tile;
          const tone: DominoTone = missing ? (revealed?.tone ?? "missing") : "normal";
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: position.left, top: position.top }}
              data-missing={missing ? "" : undefined}
            >
              <DominoTile
                domino={shown}
                size={tileSize}
                tone={tone}
                label={
                  missing
                    ? "Domino à trouver"
                    : `Domino ${tile.top} sur ${tile.bottom}, position ${i + 1}`
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
