import * as React from "react";
import type { MatrixCell, PsyMatrix } from "@/lib/psychotech/types";

/**
 * Rendu SVG des matrices logiques (famille « matrices »). Le générateur ne
 * produit que la description des cellules ; la géométrie est calculée ici.
 * Couleurs sur tokens (aucune couleur brute). Grille 3×3 avec case à trouver,
 * et figures-options rendues dans les boutons de réponse.
 */

/** Dessine les `count` formes d'une cellule, centrées sur (cx, cy). */
function shapes(cell: MatrixCell, cx: number, cy: number): React.ReactNode {
  const layout: { dx: number; s: number }[] =
    cell.count === 1
      ? [{ dx: 0, s: 13 }]
      : cell.count === 2
        ? [
            { dx: -13, s: 9 },
            { dx: 13, s: 9 },
          ]
        : [
            { dx: -16, s: 7 },
            { dx: 0, s: 7 },
            { dx: 16, s: 7 },
          ];
  const cls = cell.filled ? "fill-foreground stroke-foreground" : "fill-none stroke-foreground";
  return layout.map(({ dx, s }, i) => {
    const x = cx + dx;
    if (cell.shape === "circle") {
      return <circle key={i} cx={x} cy={cy} r={s} className={cls} strokeWidth={2} />;
    }
    if (cell.shape === "square") {
      return (
        <rect
          key={i}
          x={x - s}
          y={cy - s}
          width={s * 2}
          height={s * 2}
          className={cls}
          strokeWidth={2}
        />
      );
    }
    return (
      <polygon
        key={i}
        points={`${x},${cy - s} ${x - s},${cy + s} ${x + s},${cy + s}`}
        className={cls}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    );
  });
}

/** Une figure isolée (option de réponse). */
export function MatrixCellView({ cell }: { cell: MatrixCell }) {
  return (
    <svg viewBox="0 0 60 56" role="img" aria-label="Figure candidate" className="h-12 w-12">
      {shapes(cell, 30, 28)}
    </svg>
  );
}

/** La grille 3×3 avec sa case manquante. */
export function PsyMatrixGrid({ matrix }: { matrix: PsyMatrix }) {
  const cell = 62;
  const gap = 6;
  const step = cell + gap;
  const size = 3 * cell + 2 * gap;
  return (
    <div className="flex justify-center py-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Matrice logique 3×3 à compléter"
        className="text-foreground h-64 w-64 max-w-full"
      >
        {matrix.grid.map((c, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const ox = col * step;
          const oy = row * step;
          return (
            <g key={i}>
              <rect
                x={ox}
                y={oy}
                width={cell}
                height={cell}
                rx={6}
                className="fill-card stroke-border"
                strokeWidth={1.5}
              />
              {c ? (
                shapes(c, ox + cell / 2, oy + cell / 2)
              ) : (
                <text
                  x={ox + cell / 2}
                  y={oy + cell / 2}
                  className="fill-muted-foreground"
                  fontSize={30}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  ?
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
