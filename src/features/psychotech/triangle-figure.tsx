import * as React from "react";

import { cn } from "@/lib/utils";
import {
  key,
  pointsUp,
  type CellContent,
  type CellRef,
  type TrianglePiece,
  type TrianglePuzzle,
} from "@/lib/psychotech/triangles";

/**
 * Rendu du test des triangles — SVG, calculé, sans dépendance.
 *
 * La même fonction de géométrie sert à dessiner la figure **et** les losanges
 * proposés : une pièce apparaît donc exactement dans l'orientation du trou
 * qu'elle doit combler, comme à l'épreuve. Deux géométries séparées auraient
 * fini par diverger, et la question serait devenue injuste.
 */

/**
 * Teintes des cases. Volontairement **hors palette sémantique** : sur ce site
 * le vert signale la validation et le rouge l'erreur, or la correction cercle
 * la bonne pièce en vert et la mauvaise en rouge. Les couleurs des cases ne
 * doivent pas pouvoir se confondre avec ce code — elles ne disent rien d'autre
 * que « cette case n'est pas celle-là ».
 */
const TILE_COLORS = [
  "#4f46e5", // indigo
  "#0d9488", // sarcelle
  "#d97706", // ambre
  "#c026d3", // magenta
  "#0284c7", // azur
  "#78716c", // pierre
];

const SIDE = 100;
const HEIGHT = (SIDE * Math.sqrt(3)) / 2;

type Point = readonly [number, number];

/**
 * Les trois sommets d'une case, dans un repère où le sommet de la figure est
 * en haut au milieu.
 */
export function cellPolygon(row: number, col: number, size: number): Point[] {
  const width = size * SIDE;
  const topX = (i: number) => width / 2 - (row * SIDE) / 2 + i * SIDE;
  const bottomX = (j: number) => width / 2 - ((row + 1) * SIDE) / 2 + j * SIDE;
  const topY = row * HEIGHT;
  const bottomY = (row + 1) * HEIGHT;

  if (pointsUp(col)) {
    const k = col / 2;
    return [
      [topX(k), topY],
      [bottomX(k), bottomY],
      [bottomX(k + 1), bottomY],
    ];
  }
  const j = (col - 1) / 2;
  return [
    [topX(j), topY],
    [topX(j + 1), topY],
    [bottomX(j + 1), bottomY],
  ];
}

function centroid(points: readonly Point[]): Point {
  return [
    points.reduce((sum, p) => sum + p[0], 0) / points.length,
    points.reduce((sum, p) => sum + p[1], 0) / points.length,
  ];
}

function pathOf(points: readonly Point[]): string {
  return `${points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")}`;
}

/** Une case : son fond, son contour, et les marques qu'elle porte. */
function Cell({
  points,
  content,
  blank,
}: {
  points: Point[];
  content?: CellContent;
  blank?: boolean;
}) {
  const [cx, cy] = centroid(points);
  // Les marques se posent près du centre de gravité, dans le sens de la
  // pointe : un triangle renversé n'a pas de place au même endroit.
  const up = points[1][1] > points[0][1] && points.length === 3 && points[1][1] === points[2][1];
  const marks = content?.decor ?? 0;
  return (
    <g>
      <polygon
        points={pathOf(points)}
        fill={
          blank || !content
            ? "var(--color-background)"
            : TILE_COLORS[content.color % TILE_COLORS.length]
        }
        stroke="var(--color-foreground)"
        strokeWidth={blank ? 3 : 1.5}
        strokeDasharray={blank ? "8 6" : undefined}
        strokeLinejoin="round"
      />
      {Array.from({ length: marks }, (_, i) => (
        <circle
          key={i}
          cx={cx + (marks === 1 ? 0 : i === 0 ? -13 : 13)}
          cy={cy + (up ? 6 : -6)}
          r={7}
          fill="#ffffff"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={1.5}
        />
      ))}
    </g>
  );
}

/**
 * La figure entière, avec son trou. `filled` remplace le contenu du trou —
 * c'est ce qui permet de montrer la figure complétée à la correction.
 */
export function TriangleFigure({
  puzzle,
  filled,
  className,
}: {
  puzzle: TrianglePuzzle;
  filled?: TrianglePiece;
  className?: string;
}) {
  const width = puzzle.size * SIDE;
  const height = puzzle.size * HEIGHT;
  const isHole = (cell: CellRef) =>
    puzzle.hole.findIndex((h) => h.row === cell.row && h.col === cell.col);

  return (
    <svg
      viewBox={`-6 -6 ${width + 12} ${height + 12}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={
        filled
          ? "La figure complétée par la bonne pièce."
          : "La figure, avec deux triangles laissés blancs à compléter."
      }
    >
      {Object.keys(puzzle.grid).map((cellKey) => {
        const [row, col] = cellKey.split(":").map(Number);
        const points = cellPolygon(row, col, puzzle.size);
        const holeIndex = isHole({ row, col });
        if (holeIndex >= 0) {
          return (
            <Cell
              key={cellKey}
              points={points}
              content={filled?.contents[holeIndex]}
              blank={!filled}
            />
          );
        }
        return <Cell key={cellKey} points={points} content={puzzle.grid[key(row, col)]} />;
      })}
    </svg>
  );
}

/**
 * Un losange proposé, dessiné avec **la géométrie de la figure** puis recadré :
 * il se présente donc dans l'orientation exacte du trou.
 */
export function TrianglePieceView({
  piece,
  size,
  className,
}: {
  piece: TrianglePiece;
  size: number;
  className?: string;
}) {
  const polygons = piece.cells.map((cell) => cellPolygon(cell.row, cell.col, size));
  const all = polygons.flat();
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const pad = 8;

  return (
    <svg
      viewBox={`${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Un losange de deux triangles."
    >
      {polygons.map((points, i) => (
        <Cell key={i} points={points} content={piece.contents[i]} />
      ))}
    </svg>
  );
}
