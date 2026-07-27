import { createRng, seededShuffle } from "@/features/quiz/engine";

/**
 * Test des triangles — génération et notation, logique pure sans rendu.
 *
 * Format officiel des sélections EOPAN : **20 questions en 8 minutes**, quatre
 * propositions. Un grand triangle est découpé en petits triangles coloriés ;
 * **deux triangles adjacents sont laissés blancs** et il faut désigner, parmi
 * quatre losanges, celui qui complète la figure.
 *
 * Le point qui décide de tout : **la figure n'est pas coloriée au hasard**.
 * Elle obéit à une règle — alternance, répétition par lignes, symétrie,
 * diagonales, couronnes, sous-triangles — et c'est cette règle qui rend la
 * pièce manquante déductible. Le générateur part donc de la règle et en déduit
 * la figure, jamais l'inverse.
 *
 * D'où la garantie centrale : **le trou doit rester déductible**. Si la règle
 * est « une couleur par ligne » et que le trou emporte les deux seules cases
 * visibles de cette ligne, la question n'a plus de réponse — et le candidat a
 * raison de ne pas pouvoir trancher. Chaque case manquante doit avoir au moins
 * une sœur visible dans sa classe.
 */

export type Rng = () => number;

/** Une case de la grille triangulaire : ligne, rang dans la ligne. */
export interface CellRef {
  row: number;
  /** 0 à 2·row ; pair = pointe en haut, impair = pointe en bas. */
  col: number;
}

export interface CellContent {
  /** Index dans la palette du rendu. */
  color: number;
  /** Nombre de marques portées par la case, de 0 à 2. */
  decor: number;
}

export type TriangleLevel = 1 | 2 | 3;

export interface TrianglePiece {
  /** Les deux cases du losange, dans l'ordre où elles seront dessinées. */
  cells: [CellRef, CellRef];
  contents: [CellContent, CellContent];
}

export interface TrianglePuzzle {
  id: string;
  level: TriangleLevel;
  /** Côté de la figure, en petits triangles. */
  size: number;
  /** Le contenu de chaque case, indexé par `key(row, col)`. */
  grid: Record<string, CellContent>;
  /** Les deux cases laissées blanches. */
  hole: [CellRef, CellRef];
  /** Les quatre losanges proposés, dans l'ordre d'affichage. */
  options: TrianglePiece[];
  answerIndex: number;
  /** La règle qui gouverne la figure, en français. */
  rule: string;
  /** Ce qui cloche dans chaque mauvaise proposition. */
  differences: string[];
}

export function key(row: number, col: number): string {
  return `${row}:${col}`;
}

/** Une case pointe-t-elle vers le haut ? */
export function pointsUp(col: number): boolean {
  return col % 2 === 0;
}

/** Toutes les cases de la figure, dans l'ordre de lecture. */
export function allCells(size: number): CellRef[] {
  const cells: CellRef[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col <= 2 * row; col += 1) cells.push({ row, col });
  }
  return cells;
}

// ---------------------------------------------------------------------------
// Les règles
// ---------------------------------------------------------------------------

/**
 * Une règle est un **classement** : elle range les cases en classes, et toutes
 * les cases d'une même classe portent la même couleur (ou le même décor).
 *
 * Cette formulation unique couvre les six familles de motifs annoncées par
 * l'épreuve, et donne gratuitement les deux propriétés dont on a besoin : une
 * case est **déductible** dès qu'une autre case de sa classe est visible, et la
 * règle se **nomme** en français pour la correction.
 */
export interface TriangleRule {
  id: string;
  label: string;
  /** Classe d'une case — deux cases de même classe se ressemblent. */
  classOf: (row: number, col: number, size: number) => string;
  /** Taille minimale de figure pour que la règle ait du sens. */
  minSize?: number;
}

/** Indice de la diagonale issue du côté gauche. */
function leftDiagonal(col: number): number {
  return Math.floor(col / 2);
}

/** Distance au bord, en barycentrique : 0 sur le pourtour, plus au centre. */
function ringOf(row: number, col: number, size: number): number {
  const left = leftDiagonal(col);
  const right = row - left;
  return Math.min(size - 1 - row, left, right);
}

export const TRIANGLE_RULES: readonly TriangleRule[] = [
  {
    id: "lignes",
    label: "chaque ligne porte sa propre couleur",
    classOf: (row) => `L${row}`,
  },
  {
    id: "orientation",
    label: "les triangles pointe en haut sont d’une couleur, ceux pointe en bas d’une autre",
    classOf: (_row, col) => `O${col % 2}`,
  },
  {
    id: "symetrie",
    label: "la figure est symétrique par rapport à son axe vertical",
    classOf: (row, col) => `S${row}:${Math.min(col, 2 * row - col)}`,
  },
  {
    id: "diagonales",
    label: "les couleurs suivent les diagonales issues du côté gauche",
    classOf: (_row, col) => `D${leftDiagonal(col) % 4}`,
  },
  {
    id: "couronnes",
    label: "les couleurs forment des couronnes concentriques",
    classOf: (row, col, size) => `C${ringOf(row, col, size)}`,
  },
  {
    id: "alternance",
    label: "le long de chaque ligne, les couleurs se répètent une case sur trois",
    classOf: (_row, col) => `A${col % 3}`,
  },
  {
    id: "sous-triangles",
    label: "le motif d’un quart de la figure se répète dans les autres",
    classOf: (row, col, size) => {
      // La figure se coupe en quatre sous-triangles de côté size/2 : les trois
      // des coins portent le même motif, celui du centre est retourné.
      const half = size / 2;
      if (row < half) return `T${row}:${col}`;
      const left = leftDiagonal(col);
      if (left >= half) return `T${row - half}:${col - 2 * half}`;
      if (row - left >= half) return `T${row - half}:${col}`;
      return `Tc${row - half}:${col - half}`;
    },
    minSize: 4,
  },
];

// ---------------------------------------------------------------------------
// Niveaux
// ---------------------------------------------------------------------------

export interface TriangleLevelInfo {
  level: TriangleLevel;
  label: string;
  hint: string;
  /** Côté de la figure. */
  size: number;
  /** La figure porte-t-elle des décors, et suivent-ils leur propre règle ? */
  decor: boolean;
  /** Nombre de couleurs employées. */
  colors: number;
}

export const TRIANGLE_LEVELS: Record<TriangleLevel, TriangleLevelInfo> = {
  1: {
    level: 1,
    label: "Seize triangles",
    hint: "Le format de l’épreuve : une règle de couleur, sans décor.",
    size: 4,
    decor: false,
    colors: 4,
  },
  2: {
    level: 2,
    label: "Vingt-cinq triangles",
    hint: "Figure plus large, et les marques suivent leur propre règle.",
    size: 5,
    decor: true,
    colors: 5,
  },
  3: {
    level: 3,
    label: "Règles combinées",
    hint: "Couleurs et marques obéissent à deux règles différentes, distracteurs à un détail près.",
    size: 5,
    decor: true,
    colors: 6,
  },
};

export const TRIANGLE_LEVEL_LIST: readonly TriangleLevelInfo[] = [
  TRIANGLE_LEVELS[1],
  TRIANGLE_LEVELS[2],
  TRIANGLE_LEVELS[3],
];

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Les paires de cases qui partagent une arête — les losanges possibles. */
export function adjacentPairs(size: number): [CellRef, CellRef][] {
  const pairs: [CellRef, CellRef][] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col <= 2 * row; col += 1) {
      if (!pointsUp(col)) continue;
      // Voisin de droite, dans la même ligne.
      if (col + 1 <= 2 * row)
        pairs.push([
          { row, col },
          { row, col: col + 1 },
        ]);
      // Voisin de gauche, dans la même ligne.
      if (col - 1 >= 0)
        pairs.push([
          { row, col },
          { row, col: col - 1 },
        ]);
      // Voisin du dessous : le triangle pointe en bas de la ligne suivante.
      if (row + 1 < size)
        pairs.push([
          { row, col },
          { row: row + 1, col: col + 1 },
        ]);
    }
  }
  return pairs;
}

// ---------------------------------------------------------------------------
// Génération
// ---------------------------------------------------------------------------

/**
 * Attribue une valeur par classe.
 *
 * Les valeurs sont distribuées en **balayant une palette mélangée**, et non
 * tirées indépendamment : la règle doit se **voir**. Un tirage libre produit
 * régulièrement une figure quasi unie, où plus rien ne trahit le motif — la
 * question devient alors une devinette. Le mélange de la palette et celui de
 * l'ordre des classes suffisent à garder la variété d'une figure à l'autre.
 */
function assignByClass(
  rng: Rng,
  cells: readonly CellRef[],
  size: number,
  rule: TriangleRule,
  values: number
): Map<string, number> {
  const classes = [...new Set(cells.map((cell) => rule.classOf(cell.row, cell.col, size)))];
  const palette = seededShuffle(
    Array.from({ length: values }, (_, i) => i),
    Math.floor(rng() * 100000)
  );
  const order = seededShuffle(classes, Math.floor(rng() * 100000));
  const assignment = new Map<string, number>();
  order.forEach((name, i) => assignment.set(name, palette[i % values]));
  return assignment;
}

/**
 * Une case est-elle déductible ? Il faut qu'une autre case **visible** partage
 * sa classe — sinon rien dans la figure ne dit ce qu'elle contient.
 */
function isDeducible(
  cell: CellRef,
  hole: readonly CellRef[],
  size: number,
  rule: TriangleRule
): boolean {
  const target = rule.classOf(cell.row, cell.col, size);
  return allCells(size).some(
    (other) =>
      !hole.some((h) => h.row === other.row && h.col === other.col) &&
      rule.classOf(other.row, other.col, size) === target
  );
}

interface Mutation {
  piece: TrianglePiece;
  label: string;
}

/**
 * Les mauvaises pièces n'emploient que des **couleurs présentes dans la
 * figure**. Une couleur qu'on ne voit nulle part ailleurs s'écarterait sans
 * réfléchir, et la question perdrait un quart de sa difficulté.
 */
function mutations(
  truth: TrianglePiece,
  usedColors: readonly number[],
  decor: boolean
): Mutation[] {
  const [a, b] = truth.contents;
  const others = (color: number) => usedColors.filter((value) => value !== color);
  const out: Mutation[] = [];
  const withContents = (contents: [CellContent, CellContent]): TrianglePiece => ({
    cells: truth.cells,
    contents,
  });

  if (a.color !== b.color) {
    out.push({
      piece: withContents([
        { ...a, color: b.color },
        { ...b, color: a.color },
      ]),
      label: "les deux couleurs sont interverties",
    });
  }
  for (const color of others(a.color)) {
    out.push({
      piece: withContents([{ ...a, color }, b]),
      label: "la couleur de la première moitié ne suit pas la règle",
    });
  }
  for (const color of others(b.color)) {
    out.push({
      piece: withContents([a, { ...b, color }]),
      label: "la couleur de la seconde moitié ne suit pas la règle",
    });
  }
  if (decor) {
    out.push({
      piece: withContents([{ ...a, decor: (a.decor + 1) % 3 }, b]),
      label: "la première moitié ne porte pas les bonnes marques",
    });
    out.push({
      piece: withContents([a, { ...b, decor: (b.decor + 1) % 3 }]),
      label: "la seconde moitié ne porte pas les bonnes marques",
    });
    out.push({
      piece: withContents([
        { ...a, decor: b.decor },
        { ...b, decor: a.decor },
      ]),
      label: "les marques sont sur la mauvaise moitié",
    });
  }
  return out;
}

function pieceSignature(piece: TrianglePiece): string {
  return piece.contents.map((content) => `${content.color}/${content.decor}`).join("|");
}

/** Nombre de classes qu'une règle produit sur une figure donnée. */
export function classCount(rule: TriangleRule, size: number): number {
  return new Set(allCells(size).map((cell) => rule.classOf(cell.row, cell.col, size))).size;
}

export function generateTrianglePuzzle(seed: number, level: TriangleLevel): TrianglePuzzle {
  const rng = createRng(seed);
  const info = TRIANGLE_LEVELS[level];
  const { size } = info;
  const cells = allCells(size);

  const available = TRIANGLE_RULES.filter((rule) => (rule.minSize ?? 0) <= size);
  // Sans décor, la couleur porte seule la difficulté : il faut alors au moins
  // trois classes. Une figure à deux tons n'offre pas assez de fausses pièces
  // pour en proposer trois qui se tiennent — et elle est pauvre à regarder.
  const usable = info.decor ? available : available.filter((rule) => classCount(rule, size) >= 3);
  const colorRule = pick(rng, usable);
  // Au niveau 3, les marques suivent une **autre** règle que les couleurs : il
  // faut alors lire la figure deux fois, sur deux logiques différentes.
  const decorRule = info.decor
    ? level === 3
      ? pick(
          rng,
          usable.filter((rule) => rule.id !== colorRule.id)
        )
      : colorRule
    : colorRule;

  const colorByClass = assignByClass(rng, cells, size, colorRule, info.colors);
  const decorByClass = assignByClass(rng, cells, size, decorRule, 3);

  const grid: Record<string, CellContent> = {};
  for (const cell of cells) {
    grid[key(cell.row, cell.col)] = {
      color: colorByClass.get(colorRule.classOf(cell.row, cell.col, size)) ?? 0,
      decor: info.decor ? (decorByClass.get(decorRule.classOf(cell.row, cell.col, size)) ?? 0) : 0,
    };
  }

  // Le trou : une paire adjacente dont **les deux cases restent déductibles**,
  // couleur et décor compris.
  const pairs = seededShuffle(adjacentPairs(size), seed + 313);
  const hole =
    pairs.find((pair) =>
      pair.every(
        (cell) =>
          isDeducible(cell, pair, size, colorRule) &&
          (!info.decor || isDeducible(cell, pair, size, decorRule))
      )
    ) ?? pairs[0];

  const truth: TrianglePiece = {
    cells: hole,
    contents: [grid[key(hole[0].row, hole[0].col)], grid[key(hole[1].row, hole[1].col)]],
  };

  const usedColors = [...new Set(Object.values(grid).map((cell) => cell.color))];
  const seen = new Set<string>([pieceSignature(truth)]);
  const decoys: Mutation[] = [];
  for (const candidate of seededShuffle(mutations(truth, usedColors, info.decor), seed + 719)) {
    if (decoys.length >= 3) break;
    const signature = pieceSignature(candidate.piece);
    if (seen.has(signature)) continue;
    seen.add(signature);
    decoys.push(candidate);
  }

  // Filet de sécurité : si un tirage n'offre pas trois fausses pièces, on
  // rejoue la figure plutôt que d'en proposer moins de quatre.
  if (decoys.length < 3) return generateTrianglePuzzle(seed + 104729, level);

  const labelled = [
    { piece: truth, difference: "" },
    ...decoys.map((decoy) => ({ piece: decoy.piece, difference: decoy.label })),
  ];
  const shuffled = seededShuffle(labelled, seed + 1129);

  return {
    id: `triangle.${level}.${seed}`,
    level,
    size,
    grid,
    hole,
    options: shuffled.map((entry) => entry.piece),
    answerIndex: shuffled.findIndex((entry) => entry.difference === ""),
    rule:
      info.decor && decorRule.id !== colorRule.id
        ? `Pour les couleurs, ${colorRule.label}. Pour les marques, ${decorRule.label}.`
        : capitalize(colorRule.label) + ".",
    differences: shuffled.map((entry) => entry.difference),
  };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------------------
// Formats et notation
// ---------------------------------------------------------------------------

export type TriangleFormatKey = "officiel" | "court";

export interface TriangleFormat {
  key: TriangleFormatKey;
  label: string;
  size: number;
  durationSeconds: number;
  hint: string;
}

/** Cadence officielle : 20 questions en 8 minutes, soit 24 s l'unité. */
export const TRIANGLE_PACE_SECONDS = 24;

export const TRIANGLE_FORMATS: Record<TriangleFormatKey, TriangleFormat> = {
  officiel: {
    key: "officiel",
    label: "Test officiel",
    size: 20,
    durationSeconds: 8 * 60,
    hint: "Le format des sélections : 20 figures en 8 minutes.",
  },
  court: {
    key: "court",
    label: "Format court",
    size: 8,
    durationSeconds: 8 * TRIANGLE_PACE_SECONDS,
    hint: "Même cadence, session express — pour s’échauffer.",
  },
};

export const TRIANGLE_FORMAT_LIST: readonly TriangleFormat[] = [
  TRIANGLE_FORMATS.officiel,
  TRIANGLE_FORMATS.court,
];

/** La difficulté monte au fil de la session, comme au test réel. */
export function levelForPosition(index: number, size: number): TriangleLevel {
  const third = size / 3;
  if (index < third) return 1;
  if (index < third * 2) return 2;
  return 3;
}

export function buildTriangleSession(seed: number, format: TriangleFormatKey): TrianglePuzzle[] {
  const { size } = TRIANGLE_FORMATS[format];
  return Array.from({ length: size }, (_, i) =>
    generateTrianglePuzzle(seed + i * 1583, levelForPosition(i, size))
  );
}

export interface TriangleScore {
  correct: number;
  answered: number;
  total: number;
  precision: number;
  bestStreak: number;
}

export function scoreTriangleSession(
  puzzles: readonly TrianglePuzzle[],
  answers: readonly (number | null)[]
): TriangleScore {
  let correct = 0;
  let answered = 0;
  let streak = 0;
  let bestStreak = 0;
  puzzles.forEach((puzzle, i) => {
    const answer = answers[i];
    if (answer === null || answer === undefined) {
      streak = 0;
      return;
    }
    answered += 1;
    if (answer === puzzle.answerIndex) {
      correct += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  });
  const total = puzzles.length;
  return {
    correct,
    answered,
    total,
    precision: total === 0 ? 0 : Math.round((correct / total) * 100),
    bestStreak,
  };
}
