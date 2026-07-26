import { createRng } from "@/features/quiz/engine";

/**
 * Test de dominos — génération et notation, logique pure sans rendu.
 *
 * Une série de dominos suit une (ou plusieurs) règle(s) ; une tuile est
 * masquée, le candidat compose sa valeur. Contrairement à un QCM, **aucune
 * réponse ne se devine par élimination** : les deux moitiés se saisissent au
 * pavé, exactement comme sur la feuille de réponse du test papier.
 *
 * Convention universelle du domino : chaque moitié vaut **0 à 6**, le **blanc
 * vaut 0**, et au-delà de 6 on repart à 0 — toute l'arithmétique est donc
 * **modulo 7**.
 */

export type Rng = () => number;

/** Une tuile : deux moitiés de 0 à 6 (0 = blanc). */
export interface Domino {
  top: number;
  bottom: number;
}

export type DominoLevel = 1 | 2 | 3;

/** Forme de la disposition — dicte le placement, jamais la règle. */
export type DominoLayoutKind = "ligne" | "grille" | "cercle" | "croix" | "branche" | "spirale";

/** Position d'une tuile sur une grille entière (unités de tuile). */
export interface DominoPlacement {
  x: number;
  y: number;
}

export interface DominoPuzzle {
  level: DominoLevel;
  layout: DominoLayoutKind;
  /** Les tuiles **dans l'ordre de lecture**. */
  tiles: Domino[];
  /** Placement de chaque tuile, même longueur et même ordre que `tiles`. */
  places: DominoPlacement[];
  /**
   * Liens dessinés entre tuiles consécutives. La règle peut être retorse,
   * l'ordre de lecture ne doit jamais l'être : sans ces liens, une spirale ou
   * une branche serait ambiguë, donc injuste plutôt que difficile.
   */
  edges: [number, number][];
  /** Index de la tuile masquée dans `tiles`. */
  missingIndex: number;
  solution: Domino;
  /** Explication de la règle, donnée à la correction. */
  rule: string;
}

export interface DominoLevelInfo {
  level: DominoLevel;
  label: string;
  hint: string;
  /** Nombre de dominos par session. */
  size: number;
  /** Temps imparti pour la session entière (s). */
  durationSeconds: number;
}

/**
 * Trois niveaux, dix questions chacun. Les durées sont calées sur le rythme du
 * test papier de référence (44 dominos en 25 min, soit ≈ 34 s l'unité) puis
 * élargies à mesure que les règles se superposent.
 */
export const DOMINO_LEVELS: Record<DominoLevel, DominoLevelInfo> = {
  1: {
    level: 1,
    label: "Facile",
    hint: "Chaque moitié suit sa propre règle, en lecture linéaire.",
    size: 10,
    durationSeconds: 6 * 60,
  },
  2: {
    level: 2,
    label: "Difficile",
    hint: "Règles opposées, relations entre les deux moitiés, dispositions non linéaires.",
    size: 10,
    durationSeconds: 8 * 60,
  },
  3: {
    level: 3,
    label: "Impossible",
    hint: "Chaînes entrelacées, règles portant sur la somme, dépendances en cascade.",
    size: 10,
    durationSeconds: 10 * 60,
  },
};

export const DOMINO_LEVEL_LIST: readonly DominoLevelInfo[] = [
  DOMINO_LEVELS[1],
  DOMINO_LEVELS[2],
  DOMINO_LEVELS[3],
];

// ---------------------------------------------------------------------------
// Arithmétique du domino
// ---------------------------------------------------------------------------

/** Ramène une valeur dans [0 ; 6] — le blanc (0) suit le 6. */
export function mod7(value: number): number {
  return ((value % 7) + 7) % 7;
}

export function makeDomino(top: number, bottom: number): Domino {
  return { top: mod7(top), bottom: mod7(bottom) };
}

export function sameDomino(a: Domino, b: Domino): boolean {
  return a.top === b.top && a.bottom === b.bottom;
}

// ---------------------------------------------------------------------------
// Dispositions
// ---------------------------------------------------------------------------

function linePlaces(count: number): DominoPlacement[] {
  return Array.from({ length: count }, (_, i) => ({ x: i, y: 0 }));
}

function gridPlaces(count: number, columns: number): DominoPlacement[] {
  return Array.from({ length: count }, (_, i) => ({
    x: i % columns,
    y: Math.floor(i / columns),
  }));
}

/**
 * Anneau parcouru dans le sens horaire depuis le sommet. La chaîne **ne se
 * referme pas** : la règle est linéaire, dessiner le lien de la dernière tuile
 * vers la première laisserait croire à une périodicité qui n'existe pas.
 */
function circlePlaces(count: number): DominoPlacement[] {
  const radius = count <= 6 ? 2 : 2.4;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Number((radius + radius * Math.cos(angle)).toFixed(3)),
      y: Number((radius + radius * Math.sin(angle)).toFixed(3)),
    };
  });
}

/**
 * Arbre : un tronc de deux tuiles, puis deux branches qui descendent en
 * alternance. La branche gauche porte les rangs pairs, la droite les rangs
 * impairs — cette disposition n'a donc de sens qu'avec une règle entrelacée,
 * dont elle donne la clé visuelle.
 */
function branchPlaces(count: number): DominoPlacement[] {
  const places: DominoPlacement[] = [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ];
  for (let i = 2; i < count; i += 1) {
    places.push({ x: i % 2 === 0 ? 0 : 2, y: 2 + Math.floor((i - 2) / 2) });
  }
  return places;
}

/** Spirale carrée, du centre vers l'extérieur. */
function spiralPlaces(count: number): DominoPlacement[] {
  const places: DominoPlacement[] = [];
  let x = 1;
  let y = 1;
  const steps: DominoPlacement[] = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ];
  let dir = 0;
  let run = 1;
  places.push({ x, y });
  while (places.length < count) {
    for (let r = 0; r < 2 && places.length < count; r += 1) {
      for (let s = 0; s < run && places.length < count; s += 1) {
        x += steps[dir].x;
        y += steps[dir].y;
        places.push({ x, y });
      }
      dir = (dir + 1) % 4;
    }
    run += 1;
  }
  return places;
}

/**
 * Liens entre tuiles consécutives — la chaîne de lecture.
 *
 * Les dispositions conventionnelles (ligne, grille) n'en portent aucun :
 * l'ordre y va de soi, de gauche à droite puis de haut en bas. Les autres en
 * portent toujours. La règle peut être retorse, l'ordre de lecture jamais :
 * sans ces liens, une spirale serait ambiguë — donc injuste, pas difficile.
 */
function chainEdges(count: number): [number, number][] {
  return Array.from({ length: Math.max(0, count - 1) }, (_, i) => [i, i + 1] as [number, number]);
}

/** Arbre : tronc, puis chaque tuile pend de la précédente de sa branche. */
function branchEdges(count: number): [number, number][] {
  const edges: [number, number][] = [[0, 1]];
  let lastLeft = 1;
  let lastRight = 1;
  for (let i = 2; i < count; i += 1) {
    if (i % 2 === 0) {
      edges.push([lastLeft, i]);
      lastLeft = i;
    } else {
      edges.push([lastRight, i]);
      lastRight = i;
    }
  }
  return edges;
}

// ---------------------------------------------------------------------------
// Générateurs de règles
// ---------------------------------------------------------------------------

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Signe littéral pour les explications (« +2 », « −3 »). */
function step(value: number): string {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

interface RuleResult {
  tiles: Domino[];
  rule: string;
}

/** Niveau 1 — une progression par moitié, indépendantes l'une de l'autre. */
function ruleIndependent(rng: Rng, count: number): RuleResult {
  const t0 = int(rng, 0, 6);
  const b0 = int(rng, 0, 6);
  const st = pick(rng, [1, 2, -1, -2]);
  // Un pas nul sur une moitié rend la lecture plus lisible au niveau 1.
  const sb = pick(rng, [1, 2, -1, 0]);
  const tiles = Array.from({ length: count }, (_, i) => makeDomino(t0 + i * st, b0 + i * sb));
  const rule =
    sb === 0
      ? `Le haut avance de ${step(st)} à chaque tuile, le bas ne bouge pas.`
      : `Deux règles indépendantes : le haut ${step(st)}, le bas ${step(sb)} à chaque tuile.`;
  return { tiles, rule };
}

/** Niveau 1 — motif qui se répète à l'identique. */
function ruleRepeat(rng: Rng, count: number): RuleResult {
  const period = pick(rng, [2, 3]);
  const motif = Array.from({ length: period }, () => makeDomino(int(rng, 0, 6), int(rng, 0, 6)));
  const tiles = Array.from({ length: count }, (_, i) => motif[i % period]);
  return {
    tiles,
    rule: `Un motif de ${period} dominos se répète à l'identique — repérez la période avant de calculer quoi que ce soit.`,
  };
}

/** Niveau 2 — les deux moitiés s'éloignent en sens contraire. */
function ruleOpposite(rng: Rng, count: number): RuleResult {
  const t0 = int(rng, 0, 6);
  const b0 = int(rng, 0, 6);
  const st = pick(rng, [1, 2, 3]);
  const sb = -pick(rng, [1, 2, 3]);
  const tiles = Array.from({ length: count }, (_, i) => makeDomino(t0 + i * st, b0 + i * sb));
  return {
    tiles,
    rule: `Le haut monte de ${st}, le bas descend de ${Math.abs(sb)} — au-delà de 6 on repart à 0, en dessous de 0 on repart à 6.`,
  };
}

/**
 * Niveau 2 — la somme des deux moitiés est un invariant. Le haut est tiré
 * dans [0 ; somme] pour que l'invariant soit **littéralement lisible** : si la
 * somme n'était vraie que modulo 7, on demanderait au candidat de deviner une
 * retenue invisible.
 */
function ruleConstantSum(rng: Rng, count: number): RuleResult {
  const sum = int(rng, 4, 6);
  const t0 = int(rng, 0, sum);
  const st = pick(rng, [1, 2]) * pick(rng, [1, -1]);
  const tiles = Array.from({ length: count }, (_, i) => {
    const top = (((t0 + i * st) % (sum + 1)) + (sum + 1)) % (sum + 1);
    return makeDomino(top, sum - top);
  });
  return {
    tiles,
    rule: `La règle ne porte pas sur chaque moitié mais sur leur relation : haut + bas font toujours ${sum}. Le haut avance de ${step(st)} et rebondit entre 0 et ${sum}.`,
  };
}

/** Niveau 2 — pas alterné sur le haut, pas constant sur le bas. */
function ruleAlternating(rng: Rng, count: number): RuleResult {
  const t0 = int(rng, 0, 6);
  const b0 = int(rng, 0, 6);
  const a = pick(rng, [1, 2]);
  const b = pick(rng, [3, 4]);
  const sb = pick(rng, [1, 2]);
  const tops: number[] = [t0];
  for (let i = 1; i < count; i += 1) {
    tops.push(tops[i - 1] + (i % 2 === 1 ? a : b));
  }
  const tiles = tops.map((t, i) => makeDomino(t, b0 + i * sb));
  return {
    tiles,
    rule: `Le haut alterne ${step(a)} puis ${step(b)}, sans jamais s'installer ; le bas avance régulièrement de ${sb}.`,
  };
}

/** Niveau 3 — deux chaînes entrelacées, une tuile sur deux. */
function ruleInterleaved(rng: Rng, count: number): RuleResult {
  const tA = int(rng, 0, 6);
  const bA = int(rng, 0, 6);
  const tB = int(rng, 0, 6);
  const bB = int(rng, 0, 6);
  const sA = pick(rng, [1, 2, 3]);
  const sB = pick(rng, [-1, -2, 2]);
  const tiles = Array.from({ length: count }, (_, i) => {
    const rank = Math.floor(i / 2);
    return i % 2 === 0
      ? makeDomino(tA + rank * sA, bA + rank * sA)
      : makeDomino(tB + rank * sB, bB + rank * sB);
  });
  return {
    tiles,
    rule: `Deux séries entrelacées : les tuiles de rang pair avancent de ${step(sA)}, celles de rang impair de ${step(sB)}. Lisez une tuile sur deux.`,
  };
}

/**
 * Niveau 3 — cascade croisée : le haut reprend le bas du précédent, et le bas
 * reprend son haut décalé. Les deux moitiés se passent la main d'une tuile à
 * l'autre, si bien qu'aucune ne suit de progression lisible isolément.
 */
function ruleCascade(rng: Rng, count: number): RuleResult {
  const s = pick(rng, [1, 2, 3, -1, -2]);
  const tiles: Domino[] = [makeDomino(int(rng, 0, 6), int(rng, 0, 6))];
  for (let i = 1; i < count; i += 1) {
    const previous = tiles[i - 1];
    tiles.push(makeDomino(previous.bottom, previous.top + s));
  }
  return {
    tiles,
    rule: `Cascade croisée : le haut d'un domino reprend le bas du précédent, et son bas reprend le haut du précédent ${step(s)}. Aucune moitié ne progresse seule — il faut suivre les deux en alternance.`,
  };
}

/** Niveau 3 — la somme des moitiés suit une suite de Fibonacci modulo 7. */
function ruleFibonacciSum(rng: Rng, count: number): RuleResult {
  const s0 = int(rng, 1, 6);
  const s1 = int(rng, 1, 6);
  const sums = [s0, s1];
  for (let i = 2; i < count; i += 1) {
    sums.push(mod7(sums[i - 1] + sums[i - 2]));
  }
  const t0 = int(rng, 0, 6);
  const st = pick(rng, [1, 2]);
  const tiles = sums.map((sum, i) => {
    const top = mod7(t0 + i * st);
    return makeDomino(top, sum - top);
  });
  return {
    tiles,
    rule: `La somme des deux moitiés suit une suite de Fibonacci modulo 7 — chaque somme est le total des deux précédentes ; le haut, lui, avance de ${step(st)}.`,
  };
}

/** Niveau 3 — l'écart entre les deux moitiés se creuse à chaque tuile. */
function ruleGrowingGap(rng: Rng, count: number): RuleResult {
  const t0 = int(rng, 0, 6);
  const gap0 = int(rng, 0, 3);
  const growth = pick(rng, [1, 2]);
  const st = pick(rng, [1, 2, -1]);
  const tiles = Array.from({ length: count }, (_, i) => {
    const top = mod7(t0 + i * st);
    return makeDomino(top, top + gap0 + i * growth);
  });
  return {
    tiles,
    rule: `L'écart entre le bas et le haut se creuse de ${growth} à chaque tuile (il part de ${gap0}), pendant que le haut avance de ${step(st)}.`,
  };
}

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------

interface LayoutChoice {
  layout: DominoLayoutKind;
  count: number;
  places: DominoPlacement[];
  edges: [number, number][];
  /** Index masquable — jamais la première tuile, qui amorce la lecture. */
  hidable: number[];
}

/** Disposition en ligne ou en grille : ordre conventionnel, donc sans liens. */
function conventional(kind: "ligne" | "grille", count: number): LayoutChoice {
  return {
    layout: kind,
    count,
    places: kind === "ligne" ? linePlaces(count) : gridPlaces(count, 3),
    edges: [],
    hidable: [count - 1],
  };
}

function layoutsForLevel(rng: Rng, level: DominoLevel): LayoutChoice {
  if (level === 1) {
    return pick(rng, [true, false])
      ? conventional("ligne", int(rng, 5, 6))
      : conventional("grille", 6);
  }

  if (level === 2) {
    if (pick(rng, [true, false])) {
      const count = int(rng, 6, 7);
      return {
        layout: "cercle",
        count,
        places: circlePlaces(count),
        edges: chainEdges(count),
        hidable: [count - 1, count - 2],
      };
    }
    const count = pick(rng, [6, 9]);
    return { ...conventional("grille", count), hidable: [count - 1, count - 2] };
  }

  const count = int(rng, 7, 8);
  return pick(rng, [true, false])
    ? {
        layout: "spirale",
        count,
        places: spiralPlaces(count),
        edges: chainEdges(count),
        hidable: [count - 1, count - 2],
      }
    : { ...conventional("ligne", count), hidable: [count - 1, count - 2, count - 3] };
}

function rulesForLevel(rng: Rng, level: DominoLevel, count: number): RuleResult {
  if (level === 1) {
    return pick(rng, [ruleIndependent, ruleRepeat])(rng, count);
  }
  if (level === 2) {
    return pick(rng, [ruleOpposite, ruleConstantSum, ruleAlternating])(rng, count);
  }
  return pick(rng, [ruleCascade, ruleFibonacciSum, ruleGrowingGap])(rng, count);
}

/**
 * L'arbre est réservé à la règle entrelacée : ses deux branches **sont** les
 * deux séries. Associer cette forme à une autre règle n'apprendrait rien et
 * égarerait le candidat — la disposition doit renseigner, pas piéger.
 */
function interleavedOnBranch(rng: Rng): { choice: LayoutChoice; result: RuleResult } {
  const count = 7;
  const result = ruleInterleaved(rng, count);
  return {
    choice: {
      layout: "branche",
      count,
      places: branchPlaces(count),
      edges: branchEdges(count),
      hidable: [count - 1, count - 2],
    },
    result,
  };
}

/**
 * Une série entièrement déterminée par sa graine — deux appels de même graine
 * et de même niveau donnent exactement la même question.
 */
export function generateDominoPuzzle(seed: number, level: DominoLevel): DominoPuzzle {
  const rng = createRng(seed);

  let choice: LayoutChoice;
  let result: RuleResult;
  if (level === 3 && rng() < 0.34) {
    ({ choice, result } = interleavedOnBranch(rng));
  } else {
    choice = layoutsForLevel(rng, level);
    result = rulesForLevel(rng, level, choice.count);
  }

  const missingIndex = pick(rng, choice.hidable);
  return {
    level,
    layout: choice.layout,
    tiles: result.tiles,
    places: choice.places,
    edges: choice.edges,
    missingIndex,
    solution: result.tiles[missingIndex],
    rule: result.rule,
  };
}

/** Signature d'une série, pour ne pas resservir deux fois la même question. */
function puzzleSignature(puzzle: DominoPuzzle): string {
  return `${puzzle.layout}|${puzzle.tiles.map((t) => `${t.top}${t.bottom}`).join("-")}|${puzzle.missingIndex}`;
}

/**
 * Les dix séries d'une session. On écarte les doublons exacts ; au bout d'un
 * nombre raisonnable d'essais on accepte ce qui vient, pour ne jamais boucler
 * indéfiniment sur une graine malchanceuse.
 */
export function buildDominoSession(seed: number, level: DominoLevel): DominoPuzzle[] {
  const target = DOMINO_LEVELS[level].size;
  const puzzles: DominoPuzzle[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; puzzles.length < target && attempt < target * 12; attempt += 1) {
    const puzzle = generateDominoPuzzle(seed + attempt * 977, level);
    const signature = puzzleSignature(puzzle);
    if (seen.has(signature)) continue;
    seen.add(signature);
    puzzles.push(puzzle);
  }
  while (puzzles.length < target) {
    puzzles.push(generateDominoPuzzle(seed + puzzles.length * 13, level));
  }
  return puzzles;
}

// ---------------------------------------------------------------------------
// Notation
// ---------------------------------------------------------------------------

/** Réponse composée par le candidat ; `null` tant qu'une moitié manque. */
export interface DominoAnswer {
  top: number | null;
  bottom: number | null;
}

export const EMPTY_ANSWER: DominoAnswer = { top: null, bottom: null };

export function isComplete(answer: DominoAnswer): answer is { top: number; bottom: number } {
  return answer.top !== null && answer.bottom !== null;
}

/**
 * Une tuile n'est juste que si **les deux moitiés** le sont — c'est la règle du
 * test papier. On expose tout de même le détail par moitié : à la correction,
 * savoir qu'on a tenu le haut et manqué le bas vaut mieux qu'un simple « faux ».
 */
export interface DominoVerdict {
  topOk: boolean;
  bottomOk: boolean;
  correct: boolean;
}

export function verdictFor(answer: DominoAnswer, solution: Domino): DominoVerdict {
  const topOk = answer.top === solution.top;
  const bottomOk = answer.bottom === solution.bottom;
  return { topOk, bottomOk, correct: topOk && bottomOk };
}

export interface DominoScore {
  /** Dominos entièrement justes. */
  correct: number;
  /** Séries traitées (les deux moitiés saisies). */
  answered: number;
  total: number;
  /** Moitiés justes sur l'ensemble — mesure plus fine que le score. */
  halvesCorrect: number;
  /** Pourcentage de dominos entièrement justes, arrondi. */
  precision: number;
}

export function scoreDominoSession(
  puzzles: readonly DominoPuzzle[],
  answers: readonly DominoAnswer[]
): DominoScore {
  let correct = 0;
  let answered = 0;
  let halvesCorrect = 0;
  puzzles.forEach((puzzle, i) => {
    const answer = answers[i] ?? EMPTY_ANSWER;
    if (isComplete(answer)) answered += 1;
    const verdict = verdictFor(answer, puzzle.solution);
    if (verdict.topOk) halvesCorrect += 1;
    if (verdict.bottomOk) halvesCorrect += 1;
    if (verdict.correct) correct += 1;
  });
  const total = puzzles.length;
  return {
    correct,
    answered,
    total,
    halvesCorrect,
    precision: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}
