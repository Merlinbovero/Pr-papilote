import { createRng, seededShuffle } from "@/features/quiz/engine";

/**
 * Formes imbriquées — génération et notation, logique pure sans rendu.
 *
 * Format officiel des sélections : **20 questions en 8 minutes, quatre
 * propositions**, difficulté croissante (chevauchements, rotations, symétries,
 * puis découpes fines). On montre un assemblage de pièces enchevêtrées ; il
 * faut désigner, parmi quatre jeux de pièces désassemblées, celui dont
 * l'assemblage a été fait.
 *
 * Deux exigences structurent tout le module :
 *
 * 1. **Une seule réponse défendable.** Chaque distracteur diffère du bon jeu
 *    par une pièce, et cette différence doit dépasser un écart minimal
 *    mesuré (`shapeDistance`) — sinon la question se joue à la loupe, pas à la
 *    projection mentale.
 * 2. **Aucune pièce avalée.** Les pièces s'imbriquent mais ne se recouvrent
 *    jamais au point qu'une modification devienne invisible : la distance
 *    entre deux centres reste supérieure à une fraction de la somme de leurs
 *    rayons. Sans cette garantie, deux jeux pourraient produire la même image.
 */

export type Rng = () => number;

/**
 * Les six familles de pièces. Toutes se construisent à partir de primitives
 * paramétriques — aucun modèle téléchargé, donc aucune question de droits :
 * un anneau est un tore d'arc partiel, un disque entaillé un cylindre d'angle
 * partiel, une barre une boîte, un tube un profil annulaire révolutionné.
 */
export type PieceKind = "barre" | "plaque" | "anneau" | "disque" | "cone" | "tube";

export const PIECE_KINDS: readonly PieceKind[] = [
  "barre",
  "plaque",
  "anneau",
  "disque",
  "cone",
  "tube",
];

/** Libellé français d'une famille, pour la correction. */
export const PIECE_LABELS: Record<PieceKind, string> = {
  barre: "barre",
  plaque: "plaque",
  anneau: "anneau",
  disque: "disque",
  cone: "cône",
  tube: "tube",
};

/** Genre grammatical : la correction se lit en français, pas en pseudo-code. */
const FEMININE: readonly PieceKind[] = ["barre", "plaque"];

/** « la barre », « le tube » — l'article s'élide devant une voyelle. */
export function withArticle(kind: PieceKind): string {
  const word = PIECE_LABELS[kind];
  if (FEMININE.includes(kind)) return `la ${word}`;
  return /^[aeiouâêîôûàéèùy]/i.test(word) ? `l’${word}` : `le ${word}`;
}

/** Accorde un adjectif au genre de la pièce. */
export function agree(kind: PieceKind, masculine: string, feminine: string): string {
  return FEMININE.includes(kind) ? feminine : masculine;
}

/**
 * Une pièce. `arc` est la fraction de tour effectivement matérialisée : 1 pour
 * une pièce fermée, moins pour une pièce entaillée (anneau ouvert, disque
 * amputé d'une part). Les pièces non révolutionnées ignorent `arc`.
 */
export interface Piece {
  kind: PieceKind;
  /** Rayon (pièces de révolution) ou demi-longueur (barre, plaque). */
  radius: number;
  /** Hauteur, épaisseur ou section selon la famille. */
  height: number;
  /** Épaisseur du tore / de la paroi du tube ; ignorée ailleurs. */
  thickness: number;
  /** Fraction de tour matérialisée, entre 0,25 et 1. */
  arc: number;
  /** Index de teinte dans la palette du test (le rendu décide de la couleur). */
  hue: number;
}

/** Pose d'une pièce dans l'assemblage. */
export interface PiecePose {
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface PlacedPiece {
  piece: Piece;
  pose: PiecePose;
}

export type FormeLevel = 1 | 2 | 3;

export interface FormePuzzle {
  id: string;
  level: FormeLevel;
  /** L'assemblage montré en haut : pièces posées, imbriquées. */
  assembly: PlacedPiece[];
  /** Basculement d'ensemble, appliqué au groupe au rendu. */
  tilt: [number, number, number];
  /** Les quatre jeux désassemblés proposés, dans l'ordre d'affichage. */
  options: Piece[][];
  answerIndex: number;
  /** Ce qui distingue chaque mauvais jeu — affiché à la correction. */
  differences: string[];
}

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function range(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Rayon de la sphère englobante d'une pièce — sert à garantir que les pièces
 * s'imbriquent sans s'avaler.
 */
export function boundingRadius(piece: Piece): number {
  switch (piece.kind) {
    case "barre":
    case "plaque":
      return Math.hypot(piece.radius, piece.height / 2, piece.thickness / 2);
    case "anneau":
      return piece.radius + piece.thickness;
    default:
      return Math.hypot(piece.radius, piece.height / 2);
  }
}

// ---------------------------------------------------------------------------
// Signature et distance
// ---------------------------------------------------------------------------

/**
 * Signature d'une pièce : ce qui la distingue à l'œil. Deux pièces de même
 * signature sont interchangeables dans un jeu — c'est cette égalité qui sert à
 * vérifier qu'aucun distracteur n'est en réalité une bonne réponse.
 */
export function pieceSignature(piece: Piece): string {
  const arc = piece.kind === "barre" || piece.kind === "plaque" ? 1 : piece.arc;
  return [
    piece.kind,
    round2(piece.radius),
    round2(piece.height),
    round2(piece.thickness),
    round2(arc),
  ].join("|");
}

/** Signature d'un jeu de pièces — indépendante de l'ordre d'affichage. */
export function setSignature(pieces: readonly Piece[]): string {
  return pieces.map(pieceSignature).sort().join(" + ");
}

/**
 * Écart perceptif entre deux pièces. Une famille différente vaut à elle seule
 * l'écart maximal ; sinon on cumule les écarts relatifs de proportions et
 * l'écart d'arc, qui est le plus visible de tous (une entaille se repère avant
 * une différence de rayon).
 */
export function shapeDistance(a: Piece, b: Piece): number {
  if (a.kind !== b.kind) return 10;
  const rel = (x: number, y: number) => Math.abs(x - y) / Math.max(0.001, Math.max(x, y));
  const revolution = a.kind !== "barre" && a.kind !== "plaque";
  return (
    4 * rel(a.radius, b.radius) +
    4 * rel(a.height, b.height) +
    3 * rel(a.thickness, b.thickness) +
    (revolution ? 12 * Math.abs(a.arc - b.arc) : 0)
  );
}

// ---------------------------------------------------------------------------
// Niveaux
// ---------------------------------------------------------------------------

export interface FormeLevelInfo {
  level: FormeLevel;
  label: string;
  hint: string;
  /** Nombre de pièces de l'assemblage. */
  pieces: number;
  /** Écart minimal exigé entre la pièce d'origine et sa version altérée. */
  minDistance: number;
  /** Les pièces peuvent-elles être tournées hors des axes ? */
  freeRotation: boolean;
}

export const FORME_LEVELS: Record<FormeLevel, FormeLevelInfo> = {
  1: {
    level: 1,
    label: "Pièces franches",
    hint: "Trois pièces bien distinctes, une différence qui saute aux yeux.",
    pieces: 3,
    minDistance: 3.5,
    freeRotation: false,
  },
  2: {
    level: 2,
    label: "Rotations et symétries",
    hint: "Quatre pièces, orientées librement : il faut les remettre mentalement d’aplomb.",
    pieces: 4,
    minDistance: 2,
    freeRotation: true,
  },
  3: {
    level: 3,
    label: "Découpes fines",
    hint: "Cinq pièces, et un seul détail sépare le bon jeu des autres.",
    pieces: 5,
    minDistance: 1.6,
    freeRotation: true,
  },
};

export const FORME_LEVEL_LIST: readonly FormeLevelInfo[] = [
  FORME_LEVELS[1],
  FORME_LEVELS[2],
  FORME_LEVELS[3],
];

// ---------------------------------------------------------------------------
// Génération des pièces
// ---------------------------------------------------------------------------

function makePiece(rng: Rng, kind: PieceKind, hue: number): Piece {
  switch (kind) {
    case "barre":
      // Section volontairement mince : une barre doit passer dans le trou d'un
      // anneau, sinon rien ne s'imbrique.
      return {
        kind,
        radius: round2(range(rng, 1.1, 1.9)),
        height: round2(range(rng, 0.14, 0.26)),
        thickness: round2(range(rng, 0.14, 0.26)),
        arc: 1,
        hue,
      };
    case "plaque":
      return {
        kind,
        radius: round2(range(rng, 1.0, 1.7)),
        height: round2(range(rng, 0.08, 0.14)),
        thickness: round2(range(rng, 0.35, 0.6)),
        arc: 1,
        hue,
      };
    case "anneau":
      return {
        kind,
        radius: round2(range(rng, 0.55, 0.9)),
        height: round2(range(rng, 0.2, 0.34)),
        thickness: round2(range(rng, 0.14, 0.24)),
        arc: round2(pick(rng, [1, 1, 0.75, 0.6, 0.5])),
        hue,
      };
    case "disque":
      return {
        kind,
        radius: round2(range(rng, 0.5, 0.85)),
        height: round2(range(rng, 0.18, 0.36)),
        thickness: 0.1,
        arc: round2(pick(rng, [1, 1, 0.75, 0.65, 0.5])),
        hue,
      };
    case "cone":
      return {
        kind,
        radius: round2(range(rng, 0.4, 0.7)),
        height: round2(range(rng, 0.55, 0.85)),
        thickness: 0.1,
        arc: round2(pick(rng, [1, 1, 0.75, 0.5])),
        hue,
      };
    case "tube":
      return {
        kind,
        radius: round2(range(rng, 0.4, 0.68)),
        height: round2(range(rng, 0.42, 0.7)),
        thickness: round2(range(rng, 0.1, 0.2)),
        arc: round2(pick(rng, [1, 1, 0.75, 0.6])),
        hue,
      };
  }
}

/**
 * Un jeu de pièces distinctes : deux pièces de même signature rendraient le
 * distracteur ambigu (on ne saurait plus laquelle a été altérée).
 */
function makePieceSet(rng: Rng, count: number): Piece[] {
  const pieces: Piece[] = [];
  const usedKinds: PieceKind[] = [];
  const maxRods = count >= 5 ? 2 : 1;
  let guard = 0;
  while (pieces.length < count && guard < 400) {
    guard += 1;
    const rods = pieces.filter((p) => !isRevolution(p.kind)).length;
    const remaining = count - pieces.length;
    // Il faut au moins deux pièces de révolution pour qu'il y ait enfilade ;
    // les barres viennent la traverser, jamais la remplacer.
    const needRevolution = pieces.length - rods < 2 || remaining <= 1;
    const kind = pick(rng, PIECE_KINDS);
    if (needRevolution && !isRevolution(kind)) continue;
    if (!isRevolution(kind) && rods >= maxRods) continue;
    // Deux pièces de la même famille au plus : au-delà, l'image devient confuse.
    if (usedKinds.filter((k) => k === kind).length >= 2) continue;
    const piece = makePiece(rng, kind, pieces.length);
    if (pieces.some((p) => pieceSignature(p) === pieceSignature(piece))) continue;
    if (pieces.some((p) => shapeDistance(p, piece) < 1.2)) continue;
    pieces.push(piece);
    usedKinds.push(kind);
  }
  return pieces;
}

// ---------------------------------------------------------------------------
// Imbrication
// ---------------------------------------------------------------------------

type Point = [number, number, number];

/** Les familles de révolution : elles s'enfilent sur un axe commun. */
const REVOLUTION_KINDS: readonly PieceKind[] = ["anneau", "disque", "cone", "tube"];

export function isRevolution(kind: PieceKind): boolean {
  return REVOLUTION_KINDS.includes(kind);
}

/**
 * Épaisseur d'une pièce **le long de son axe de révolution** — c'est elle qui
 * décide de l'espacement dans l'enfilade, donc du recouvrement.
 */
export function axialExtent(piece: Piece): number {
  if (piece.kind === "anneau") return piece.thickness * 2;
  if (piece.kind === "barre" || piece.kind === "plaque") return piece.thickness;
  return piece.height;
}

/**
 * Empreinte d'une pièce **sur l'axe de l'enfilade**. Une pièce de révolution y
 * présente son épaisseur ; une barre y est couchée de tout son long.
 */
export function spanOnAxis(piece: Piece): number {
  return isRevolution(piece.kind) ? axialExtent(piece) : piece.radius * 2;
}

/** Rayon perpendiculaire à l'axe — le « gabarit » vu de face. */
export function radialExtent(piece: Piece): number {
  if (piece.kind === "anneau") return piece.radius + piece.thickness;
  return piece.radius;
}

/**
 * Fraction de la somme des épaisseurs qui sépare deux pièces consécutives de
 * l'enfilade. En dessous de 0,5 elles se chevauchent — c'est ce chevauchement
 * qui fait l'imbrication. La valeur garantit aussi qu'aucune pièce n'est
 * **contenue** dans sa voisine : l'inclusion exigerait un rapport d'épaisseur
 * supérieur à 11, hors d'atteinte des fourchettes de tirage.
 */
export const AXIAL_OVERLAP = 0.42;

/**
 * Orientation de départ de l'entaille autour de l'axe de l'enfilade, choisie
 * pour que le creux regarde l'observateur. Les rotations tirées au sort s'en
 * écartent, jamais au point de le faire passer derrière.
 */
export const SLIT_FACING = -0.7;

/**
 * Alignement d'une pièce de révolution sur l'axe X. Les primitives n'ont pas
 * toutes le même axe naturel : un tore vit dans le plan XY (axe Z), un
 * cylindre a l'axe Y. On les ramène toutes sur X, l'axe de l'enfilade.
 */
function axisAlignment(kind: PieceKind): Point {
  if (kind === "anneau") return [0, Math.PI / 2, 0];
  return [0, 0, Math.PI / 2];
}

/**
 * Pose les pièces comme l'épreuve les montre : les pièces de révolution
 * **enfilées sur un axe commun** et se chevauchant, les barres et plaques
 * **traversant** l'enfilade de part en part.
 *
 * Deux invariants, tenus par construction et vérifiés par les tests :
 *
 * - **aucune pièce avalée** — le chevauchement axial est partiel, jamais une
 *   inclusion ; une pièce cachée rendrait deux jeux également défendables ;
 * - **assemblage d'un seul tenant** — les pièces enfilées se chevauchent deux
 *   à deux, et chaque barre traverse l'enfilade.
 */
function threadCentres(threaded: readonly Piece[]): number[] {
  const centres: number[] = [];
  let x = 0;
  threaded.forEach((piece, i) => {
    if (i > 0) x += (axialExtent(threaded[i - 1]) + axialExtent(piece)) * AXIAL_OVERLAP;
    centres.push(x);
  });
  return centres;
}

/** Demi-longueur de l'enfilade, extrémités comprises. */
export function stackHalfExtent(pieces: readonly Piece[]): number {
  const threaded = pieces.filter((p) => isRevolution(p.kind));
  if (threaded.length === 0) return 0;
  const centres = threadCentres(threaded);
  const middle = (centres[0] + centres[centres.length - 1]) / 2;
  return threaded.reduce(
    (max, piece, i) => Math.max(max, Math.abs(centres[i] - middle) + axialExtent(piece) / 2),
    0
  );
}

/**
 * Allonge les barres jusqu'à ce qu'elles dépassent de l'enfilade. Une barre
 * plus courte que la pile disparaîtrait dedans : on ne pourrait plus juger de
 * sa longueur, et deux jeux deviendraient également défendables.
 */
function fitRods(pieces: readonly Piece[]): Piece[] {
  const half = stackHalfExtent(pieces);
  return pieces.map((piece) =>
    isRevolution(piece.kind) || piece.radius > half * 1.15
      ? piece
      : { ...piece, radius: round2(half * 1.25) }
  );
}

function placePieces(
  rng: Rng,
  pieces: readonly Piece[],
  info: FormeLevelInfo
): { placed: PlacedPiece[]; tilt: Point } {
  const threaded = pieces.filter((p) => isRevolution(p.kind));
  const rods = pieces.filter((p) => !isRevolution(p.kind));

  const centres = threadCentres(threaded);
  const middle = centres.length > 0 ? (centres[0] + centres[centres.length - 1]) / 2 : 0;

  // L'entaille d'une pièce enfilée pointe radialement. On la fait tourner
  // autour de l'axe, mais **jamais assez pour qu'elle passe derrière** : une
  // entaille invisible sur l'assemblage rendrait deux jeux également
  // défendables. La fourchette garde le creux tourné vers l'observateur.
  const spin = () =>
    SLIT_FACING + (info.freeRotation ? range(rng, -1, 1) : pick(rng, [-0.9, 0, 0.9]));

  const placedThreaded: PlacedPiece[] = threaded.map((piece, i) => {
    const [rx, ry, rz] = axisAlignment(piece.kind);
    return {
      piece,
      pose: {
        position: [round2(centres[i] - middle), 0, 0],
        // La rotation autour de X fait tourner l'entaille : c'est elle qui
        // oblige à se projeter dans l'espace plutôt qu'à comparer des profils.
        rotation: [round2(rx + spin()), round2(ry), round2(rz)],
      },
    };
  });

  const placedRods: PlacedPiece[] = rods.map((piece, i) => {
    // Une barre est plus longue que l'enfilade : elle dépasse des deux côtés,
    // donc elle reste visible quoi qu'il arrive.
    const lean = info.freeRotation ? range(rng, -0.5, 0.5) : 0;
    const side = i === 0 ? 1 : -1;
    const offset = round2(range(rng, 0, 0.12) * side);
    return {
      piece,
      pose: {
        position: [0, offset, round2(offset * 0.6)],
        rotation: [round2(spin() * 0.25), round2(lean), round2(lean * 0.6)],
      },
    };
  });

  // Une inclinaison d'ensemble : sans elle, tous les assemblages se
  // présenteraient sous le même angle et la difficulté s'effondrerait.
  const tilt: Point = info.freeRotation
    ? [
        round2(range(rng, -0.35, 0.35)),
        round2(range(rng, -0.6, 0.6)),
        round2(range(rng, -0.3, 0.3)),
      ]
    : [0, round2(range(rng, -0.3, 0.3)), 0];

  // On rend les pièces dans l'ordre du jeu, pour que l'assemblage montre
  // exactement les pièces de la bonne proposition, dans le même ordre.
  const byPiece = new Map<Piece, PlacedPiece>();
  placedThreaded.forEach((entry) => byPiece.set(entry.piece, entry));
  placedRods.forEach((entry) => byPiece.set(entry.piece, entry));
  const placed = pieces.map((piece) => byPiece.get(piece) as PlacedPiece);

  return { placed, tilt };
}

/**
 * Aucune pièce n'est cachée dans une autre.
 *
 * Seules les pièces enfilées peuvent en avaler une : une barre est une lame de
 * quelques centimètres de section, elle ne recouvre rien. Une pièce enfilée en
 * cache une autre si son empreinte sur l'axe contient celle de sa voisine
 * **et** que son gabarit est au moins aussi grand — auquel cas la pièce
 * intérieure devient invisible, et deux jeux différents produiraient la même
 * image.
 */
export function noPieceHidden(placed: readonly PlacedPiece[]): boolean {
  const enfilees = placed
    .filter(({ piece }) => isRevolution(piece.kind))
    .map(({ piece, pose }) => ({
      piece,
      min: pose.position[0] - axialExtent(piece) / 2,
      max: pose.position[0] + axialExtent(piece) / 2,
    }));

  for (const inner of enfilees) {
    for (const outer of enfilees) {
      if (inner === outer) continue;
      const contenue = inner.min >= outer.min && inner.max <= outer.max;
      if (contenue && radialExtent(inner.piece) <= radialExtent(outer.piece) * 1.12) return false;
    }
  }
  return true;
}

/** L'enfilade tient-elle d'un seul tenant ? */
export function isConnectedAssembly(placed: readonly PlacedPiece[]): boolean {
  if (placed.length <= 1) return true;
  const threaded = placed.filter((p) => isRevolution(p.piece.kind));
  if (threaded.length === 0) return false;
  const sorted = [...threaded].sort((a, b) => a.pose.position[0] - b.pose.position[0]);
  for (let i = 1; i < sorted.length; i += 1) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    const gap = current.pose.position[0] - previous.pose.position[0];
    const half = (axialExtent(previous.piece) + axialExtent(current.piece)) / 2;
    if (gap >= half) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Distracteurs
// ---------------------------------------------------------------------------

type Mutation = { piece: Piece; label: string };

/** Les altérations possibles d'une pièce, de la plus voyante à la plus fine. */
function mutations(piece: Piece): Mutation[] {
  const out: Mutation[] = [];
  const revolution = piece.kind !== "barre" && piece.kind !== "plaque";

  const nom = withArticle(piece.kind);
  const accord = (m: string, f: string) => agree(piece.kind, m, f);

  if (revolution) {
    const closed = piece.arc >= 0.999;
    if (closed) {
      out.push({
        piece: { ...piece, arc: 0.6 },
        label: `${nom} est ${accord("entaillé", "entaillée")} alors qu’${accord("il", "elle")} est ${accord("fermé", "fermée")} sur l’assemblage`,
      });
      out.push({
        piece: { ...piece, arc: 0.75 },
        label: `${nom} porte une encoche absente de l’assemblage`,
      });
    } else {
      out.push({
        piece: { ...piece, arc: 1 },
        label: `${nom} est ${accord("fermé", "fermée")} alors qu’${accord("il", "elle")} est ${accord("entaillé", "entaillée")} sur l’assemblage`,
      });
      out.push({
        piece: { ...piece, arc: round2(Math.max(0.35, piece.arc - 0.25)) },
        label: `l’entaille ${accord("du", "de la")} ${PIECE_LABELS[piece.kind]} est nettement plus large`,
      });
    }
  }

  // Les mêmes nombres ne décrivent pas la même chose selon la famille : le
  // « rayon » d'une barre est sa demi-longueur, sa « hauteur » son épaisseur.
  // La correction doit parler la langue de la pièce qu'elle décrit.
  const [plusLarge, moinsLarge] = revolution
    ? ["trop large", `trop ${accord("étroit", "étroite")}`]
    : [`trop ${accord("long", "longue")}`, `trop ${accord("court", "courte")}`];
  const elance = piece.kind === "cone" || piece.kind === "tube";
  const [plusHaut, moinsHaut] = elance
    ? ["trop long", "trop court"]
    : [`trop ${accord("épais", "épaisse")}`, "trop mince"];

  out.push({
    piece: { ...piece, radius: round2(piece.radius * 1.45) },
    label: `${nom} est ${plusLarge}`,
  });
  out.push({
    piece: { ...piece, radius: round2(piece.radius * 0.65) },
    label: `${nom} est ${moinsLarge}`,
  });
  // La section d'une barre ne fait que deux ou trois millimètres à l'écran :
  // la modifier produirait une différence indécelable. On ne joue que sur sa
  // longueur, qui, elle, se voit.
  if (revolution) {
    out.push({
      piece: { ...piece, height: round2(piece.height * 1.6) },
      label: `${nom} est ${plusHaut}`,
    });
    out.push({
      piece: { ...piece, height: round2(piece.height * 0.55) },
      label: `${nom} est ${moinsHaut}`,
    });
  }

  if (piece.kind === "anneau" || piece.kind === "tube") {
    out.push({
      piece: { ...piece, thickness: round2(piece.thickness * 1.9) },
      label: `la paroi ${accord("du", "de la")} ${PIECE_LABELS[piece.kind]} est bien plus épaisse`,
    });
  }
  if (piece.kind === "disque") {
    out.push({
      piece: { ...piece, kind: "tube", thickness: round2(piece.radius * 0.3) },
      label: "le disque plein est remplacé par un tube creux",
    });
  }
  if (piece.kind === "cone") {
    out.push({
      piece: { ...piece, kind: "tube", thickness: round2(piece.radius * 0.3) },
      label: "le cône est remplacé par un tube",
    });
  }
  if (piece.kind === "barre") {
    out.push({
      piece: { ...piece, kind: "plaque", thickness: round2(piece.thickness * 2.2) },
      label: "la barre est remplacée par une plaque",
    });
  }
  return out;
}

/**
 * Trois jeux faux, chacun obtenu en altérant **une seule** pièce du bon jeu.
 * Une altération n'est retenue que si elle dépasse l'écart minimal du niveau,
 * si elle ne recrée pas une pièce déjà présente, et si le jeu obtenu n'a pas
 * déjà été produit — trois distracteurs identiques rendraient la question
 * absurde.
 */
function buildDecoys(rng: Rng, truth: readonly Piece[], info: FormeLevelInfo): Piece[][] {
  const decoys: Piece[][] = [];
  const seen = new Set<string>([setSignature(truth)]);
  const order = seededShuffle(
    truth.map((_, i) => i),
    Math.floor(rng() * 100000)
  );

  for (let pass = 0; pass < 4 && decoys.length < 3; pass += 1) {
    for (const index of order) {
      if (decoys.length >= 3) break;
      const source = truth[index];
      const candidates = seededShuffle(mutations(source), Math.floor(rng() * 100000)).filter(
        (m) => shapeDistance(source, m.piece) >= info.minDistance
      );
      for (const candidate of candidates) {
        const set = truth.map((p, i) => (i === index ? candidate.piece : p));
        // La pièce altérée ne doit pas devenir le sosie d'une autre pièce du jeu.
        const collides = set.some((p, i) => i !== index && shapeDistance(p, candidate.piece) < 1);
        const signature = setSignature(set);
        if (collides || seen.has(signature)) continue;
        seen.add(signature);
        decoys.push(set);
        break;
      }
    }
  }
  return decoys;
}

// ---------------------------------------------------------------------------
// Assemblage d'une question
// ---------------------------------------------------------------------------

export function generateFormePuzzle(seed: number, level: FormeLevel): FormePuzzle {
  const rng = createRng(seed);
  const info = FORME_LEVELS[level];

  let truth = fitRods(makePieceSet(rng, info.pieces));
  let decoys = buildDecoys(rng, truth, info);
  // Certains tirages n'offrent pas trois altérations assez franches : on
  // rejoue le jeu de pièces plutôt que de baisser l'exigence.
  for (let attempt = 0; attempt < 30 && decoys.length < 3; attempt += 1) {
    truth = fitRods(makePieceSet(rng, info.pieces));
    decoys = buildDecoys(rng, truth, info);
  }

  const { placed: assembly, tilt } = placePieces(rng, truth, info);
  const labelled = [
    { pieces: truth, difference: "" },
    ...decoys.slice(0, 3).map((set) => ({
      pieces: set,
      difference: describeDifference(truth, set),
    })),
  ];
  const shuffled = seededShuffle(labelled, seed + 977);
  const answerIndex = shuffled.findIndex((entry) => entry.difference === "");

  return {
    id: `forme.${level}.${seed}`,
    level,
    assembly,
    tilt,
    options: shuffled.map((entry) => entry.pieces),
    answerIndex,
    differences: shuffled.map((entry) => entry.difference),
  };
}

/** Ce qui sépare un jeu faux du bon — une phrase, pour la correction. */
export function describeDifference(truth: readonly Piece[], other: readonly Piece[]): string {
  for (let i = 0; i < truth.length; i += 1) {
    if (pieceSignature(truth[i]) === pieceSignature(other[i])) continue;
    const found = mutations(truth[i]).find(
      (m) => pieceSignature(m.piece) === pieceSignature(other[i])
    );
    if (found) return found.label;
    return `${withArticle(other[i].kind)} n’a pas les bonnes proportions`;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Formats et notation
// ---------------------------------------------------------------------------

export type FormeFormatKey = "officiel" | "court";

export interface FormeFormat {
  key: FormeFormatKey;
  label: string;
  size: number;
  durationSeconds: number;
  hint: string;
}

/**
 * Le format officiel : **20 questions en 8 minutes**, soit 24 s l'unité. Le
 * format court garde exactement la même cadence — seule la longueur change,
 * si bien qu'un score reste comparable d'un format à l'autre.
 */
export const FORME_PACE_SECONDS = 24;

export const FORME_FORMATS: Record<FormeFormatKey, FormeFormat> = {
  officiel: {
    key: "officiel",
    label: "Test officiel",
    size: 20,
    durationSeconds: 8 * 60,
    hint: "Le format des sélections : 20 assemblages en 8 minutes.",
  },
  court: {
    key: "court",
    label: "Format court",
    size: 8,
    durationSeconds: 8 * FORME_PACE_SECONDS,
    hint: "Même rythme, session express — pour s’échauffer.",
  },
};

export const FORME_FORMAT_LIST: readonly FormeFormat[] = [
  FORME_FORMATS.officiel,
  FORME_FORMATS.court,
];

/** La difficulté monte au fil de la session, comme au test réel. */
export function levelForPosition(index: number, size: number): FormeLevel {
  const third = size / 3;
  if (index < third) return 1;
  if (index < third * 2) return 2;
  return 3;
}

export function buildFormeSession(seed: number, format: FormeFormatKey): FormePuzzle[] {
  const { size } = FORME_FORMATS[format];
  return Array.from({ length: size }, (_, i) =>
    generateFormePuzzle(seed + i * 1499, levelForPosition(i, size))
  );
}

export interface FormeScore {
  correct: number;
  answered: number;
  total: number;
  precision: number;
  bestStreak: number;
}

export function scoreFormeSession(
  puzzles: readonly FormePuzzle[],
  answers: readonly (number | null)[]
): FormeScore {
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
