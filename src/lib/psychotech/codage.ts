import { createRng, seededShuffle } from "@/features/quiz/engine";

/**
 * Test de codage (TAMI-C) — génération et notation, logique pure sans rendu.
 *
 * Format officiel : **45 questions en 2 min 30**, soit 3,3 s l'unité. Une
 * **grille de mots** est affichée, chacun associé à un **code à quatre
 * chiffres** ; la grille ne change pas de toute l'épreuve. À chaque question,
 * un mot est demandé et **cinq codes** sont proposés.
 *
 * Deux traits relevés sur l'épreuve réelle, et qui font toute la difficulté :
 *
 * 1. **Les cinq propositions sont des codes de la grille**, jamais des nombres
 *    inventés. On ne peut donc pas éliminer un code parce qu'il « n'existe
 *    pas » — il faut vraiment retrouver la ligne du mot.
 * 2. **Les codes se ressemblent.** Ils partagent des chiffres, et les mauvaises
 *    propositions sont choisies parmi les plus proches du bon. C'est une
 *    épreuve de vitesse de recherche et de rigueur, pas de raisonnement.
 *
 * Ce n'est pas un test de mémoire : la grille reste sous les yeux. La mémoire
 * ne fait qu'accélérer, elle ne remplace pas la recherche.
 */

export type Rng = () => number;

export interface CodageEntry {
  word: string;
  /** Quatre chiffres, sous forme de chaîne : « 3185 ». */
  code: string;
}

export type CodageLevel = 1 | 2 | 3;

export interface CodageQuestion {
  id: string;
  /** Rang du mot demandé dans la grille. */
  entryIndex: number;
  /** Cinq codes, tous présents dans la grille. */
  options: string[];
  answerIndex: number;
}

export interface CodageSession {
  level: CodageLevel;
  /** La grille, **identique pour toute la session** — comme à l'épreuve. */
  grid: CodageEntry[];
  questions: CodageQuestion[];
}

/** Cinq propositions, comme à l'épreuve. */
export const CODAGE_OPTIONS = 5;

// ---------------------------------------------------------------------------
// Vocabulaire
// ---------------------------------------------------------------------------

/**
 * Les mots de la grille, groupés par **ressemblance visuelle** (même début,
 * même longueur, même silhouette). Aux niveaux élevés on pioche plusieurs mots
 * du même groupe : chercher « portier » quand « portail » et « portique »
 * figurent dans la grille demande de lire jusqu'au bout, pas de reconnaître
 * une forme.
 *
 * Ce vocabulaire est une **donnée de moteur**, pas du contenu éditorial : il
 * n'énonce aucun fait, ne se cite pas et n'a pas de source à créditer. Il vit
 * donc ici et non dans `content/`.
 */
const WORD_GROUPS: readonly (readonly string[])[] = [
  ["portail", "portier", "portique", "portage"],
  ["marche", "manche", "mangue", "manque"],
  ["carton", "carbone", "carnet", "carreau"],
  ["balise", "baliser", "balade", "balance"],
  ["ordonner", "ordinaire", "ordure", "ordre"],
  ["déguiser", "dégager", "dégivrer", "dégourdi"],
  ["galerie", "galette", "galop", "galon"],
  ["pouvoir", "pousser", "poutre", "poulie"],
  ["augure", "auguste", "aubaine", "audace"],
  ["détaché", "détaler", "détour", "dételer"],
  ["pomme", "poumon", "pompe", "pommeau"],
  ["ketchup", "kermesse", "kayak", "képi"],
  ["fusée", "fusible", "fuselage", "fusil"],
  ["hélice", "hélium", "hélico", "hémisphère"],
  ["cabine", "cabestan", "cadran", "cadence"],
  ["vitesse", "vitrine", "vitrail", "vivace"],
  ["nuage", "nuance", "nuageux", "nucléaire"],
  ["rampe", "rampant", "rançon", "randonnée"],
  ["sillage", "sillon", "silence", "silex"],
  ["tangage", "tangent", "tandem", "tanière"],
];

// ---------------------------------------------------------------------------
// Niveaux
// ---------------------------------------------------------------------------

export interface CodageLevelInfo {
  level: CodageLevel;
  label: string;
  hint: string;
  /** Nombre de mots de la grille. */
  size: number;
  /**
   * Nombre de familles de codes. Moins de familles pour plus de mots, c'est
   * plus de codes qui se ressemblent — donc plus de risque de se tromper de
   * ligne.
   */
  families: number;
  /** Nombre de mots piochés dans un même groupe de ressemblance. */
  wordsPerGroup: number;
}

export const CODAGE_LEVELS: Record<CodageLevel, CodageLevelInfo> = {
  1: {
    level: 1,
    label: "Grille de 12",
    hint: "Le format de l’épreuve : douze mots bien distincts, codes espacés.",
    size: 12,
    families: 3,
    wordsPerGroup: 1,
  },
  2: {
    level: 2,
    label: "Grille de 20",
    hint: "Plus de lignes à balayer, et des codes qui commencent à se ressembler.",
    size: 20,
    families: 4,
    wordsPerGroup: 2,
  },
  3: {
    level: 3,
    label: "Grille de 30",
    hint: "Trente mots, dont des voisins de forme, et des codes à un chiffre près.",
    size: 30,
    families: 4,
    wordsPerGroup: 3,
  },
};

export const CODAGE_LEVEL_LIST: readonly CodageLevelInfo[] = [
  CODAGE_LEVELS[1],
  CODAGE_LEVELS[2],
  CODAGE_LEVELS[3],
];

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Nombre de positions où deux codes diffèrent — de 0 à 4. */
export function codeDistance(a: string, b: string): number {
  let count = 0;
  for (let i = 0; i < 4; i += 1) if (a[i] !== b[i]) count += 1;
  return count;
}

// ---------------------------------------------------------------------------
// Grille
// ---------------------------------------------------------------------------

/**
 * Les codes de la grille, bâtis par **familles** : une famille part d'un code
 * de référence et n'en change qu'un ou deux chiffres. C'est ce qui reproduit
 * les grilles réelles, où l'on trouve 1985, 1988, 1485 et 1785 côte à côte.
 */
function buildCodes(rng: Rng, info: CodageLevelInfo): string[] {
  const codes = new Set<string>();
  const perFamily = Math.ceil(info.size / info.families);

  let guard = 0;
  while (codes.size < info.size && guard < 4000) {
    guard += 1;
    // Un code de référence : premier chiffre de 1 à 3, comme à l'épreuve.
    const base = [int(rng, 1, 3), int(rng, 0, 9), int(rng, 0, 9), int(rng, 0, 9)];
    codes.add(base.join(""));

    for (let k = 0; k < perFamily - 1 && codes.size < info.size; k += 1) {
      const variant = [...base];
      // Une ou deux positions changées : au-delà, la famille se dissout.
      const changes = int(rng, 1, 2);
      for (let c = 0; c < changes; c += 1) {
        const position = int(rng, 0, 3);
        variant[position] = position === 0 ? int(rng, 1, 3) : int(rng, 0, 9);
      }
      codes.add(variant.join(""));
    }
  }

  // Repli : si les familles n'ont pas suffi, on complète par des codes libres.
  while (codes.size < info.size) {
    codes.add([int(rng, 1, 3), int(rng, 0, 9), int(rng, 0, 9), int(rng, 0, 9)].join(""));
  }
  return [...codes].slice(0, info.size);
}

/** Les mots de la grille, piochés selon la proximité voulue par le niveau. */
function buildWords(rng: Rng, info: CodageLevelInfo): string[] {
  const groups = seededShuffle([...WORD_GROUPS], Math.floor(rng() * 100000));
  const words: string[] = [];
  for (const group of groups) {
    if (words.length >= info.size) break;
    const picked = seededShuffle([...group], Math.floor(rng() * 100000)).slice(
      0,
      info.wordsPerGroup
    );
    for (const word of picked) {
      if (words.length < info.size) words.push(word);
    }
  }
  return words;
}

export function buildGrid(seed: number, level: CodageLevel): CodageEntry[] {
  const rng = createRng(seed);
  const info = CODAGE_LEVELS[level];
  const words = buildWords(rng, info);
  const codes = buildCodes(rng, info);
  return words.map((word, i) => ({ word, code: codes[i] }));
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/**
 * Les quatre mauvaises propositions sont **d'autres codes de la grille**,
 * choisis parmi les plus proches du bon. C'est le trait relevé sur l'épreuve
 * réelle : aucun code inventé, donc aucune élimination gratuite.
 */
function optionsFor(rng: Rng, grid: readonly CodageEntry[], entryIndex: number): string[] {
  const answer = grid[entryIndex].code;
  const others = grid
    .filter((_, i) => i !== entryIndex)
    .map((entry) => entry.code)
    .sort((a, b) => codeDistance(answer, a) - codeDistance(answer, b));

  // On pioche dans les plus proches, avec un peu de jeu pour ne pas toujours
  // proposer exactement les mêmes quatre voisins.
  const pool = others.slice(0, Math.min(others.length, CODAGE_OPTIONS));
  const decoys = seededShuffle(pool, Math.floor(rng() * 100000)).slice(0, CODAGE_OPTIONS - 1);
  return seededShuffle([answer, ...decoys], Math.floor(rng() * 100000));
}

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

export type CodageFormatKey = "officiel" | "court";

export interface CodageFormat {
  key: CodageFormatKey;
  label: string;
  size: number;
  durationSeconds: number;
  hint: string;
}

/** Cadence officielle : 45 questions en 150 s, soit 3,33 s l'unité. */
export const CODAGE_PACE_SECONDS = 150 / 45;

export const CODAGE_FORMATS: Record<CodageFormatKey, CodageFormat> = {
  officiel: {
    key: "officiel",
    label: "Test officiel",
    size: 45,
    durationSeconds: 150,
    hint: "Le format des sélections : 45 questions en 2 min 30.",
  },
  court: {
    key: "court",
    label: "Format court",
    size: 15,
    durationSeconds: 50,
    hint: "Même cadence, session express — pour s’échauffer.",
  },
};

export const CODAGE_FORMAT_LIST: readonly CodageFormat[] = [
  CODAGE_FORMATS.officiel,
  CODAGE_FORMATS.court,
];

/**
 * Une session : **une grille** et ses questions. Le niveau vaut pour la session
 * entière, et non par tiers comme dans nos autres épreuves : la grille ne
 * changeant pas en cours de route, la difficulté ne peut pas monter sans la
 * remplacer — ce que l'épreuve ne fait pas.
 */
export function buildCodageSession(
  seed: number,
  format: CodageFormatKey,
  level: CodageLevel
): CodageSession {
  const grid = buildGrid(seed, level);
  const rng = createRng(seed + 7919);
  const { size } = CODAGE_FORMATS[format];

  const questions: CodageQuestion[] = [];
  let previous = -1;
  for (let i = 0; i < size; i += 1) {
    // On balaie la grille dans un ordre mélangé et on recommence : chaque mot
    // revient à peu près autant que les autres, et jamais deux fois de suite.
    let entryIndex = -1;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = int(rng, 0, grid.length - 1);
      if (candidate !== previous) {
        entryIndex = candidate;
        break;
      }
    }
    if (entryIndex < 0) entryIndex = (previous + 1) % grid.length;
    previous = entryIndex;

    const options = optionsFor(rng, grid, entryIndex);
    questions.push({
      id: `codage.${level}.${seed}.${i}`,
      entryIndex,
      options,
      answerIndex: options.indexOf(grid[entryIndex].code),
    });
  }

  return { level, grid, questions };
}

// ---------------------------------------------------------------------------
// Notation
// ---------------------------------------------------------------------------

export interface CodageScore {
  correct: number;
  answered: number;
  total: number;
  /** Pourcentage de bonnes réponses sur l'ensemble des questions. */
  precision: number;
  /** Pourcentage de bonnes réponses sur ce qui a été traité. */
  justesse: number;
  bestStreak: number;
}

export function scoreCodageSession(
  questions: readonly CodageQuestion[],
  answers: readonly (number | null)[]
): CodageScore {
  let correct = 0;
  let answered = 0;
  let streak = 0;
  let bestStreak = 0;
  questions.forEach((question, i) => {
    const answer = answers[i];
    if (answer === null || answer === undefined) {
      streak = 0;
      return;
    }
    answered += 1;
    if (answer === question.answerIndex) {
      correct += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  });
  const total = questions.length;
  return {
    correct,
    answered,
    total,
    precision: total === 0 ? 0 : Math.round((correct / total) * 100),
    justesse: answered === 0 ? 0 : Math.round((correct / answered) * 100),
    bestStreak,
  };
}

/**
 * À quel mot appartenait le code donné par erreur. C'est l'explication la plus
 * parlante d'une faute de codage : « vous avez donné 1988, qui est le code de
 * *galerie* » — on comprend aussitôt qu'on a lu une ligne à côté.
 */
export function wordForCode(grid: readonly CodageEntry[], code: string): string | undefined {
  return grid.find((entry) => entry.code === code)?.word;
}
