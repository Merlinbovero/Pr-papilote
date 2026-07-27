import { createRng, seededShuffle } from "@/features/quiz/engine";

/**
 * Calcul mental — génération et notation, logique pure sans rendu.
 *
 * Format officiel des sélections : **24 questions en 8 minutes, quatre
 * propositions**, difficulté croissante, décimaux, fractions et pourcentages —
 * et surtout **pas de brouillon**. D'où deux conséquences qui structurent tout
 * ce module : la plupart des questions se traitent par **encadrement** plutôt
 * que par calcul exact, et les distracteurs sont les **erreurs qu'on commet
 * vraiment de tête** (virgule décalée, retenue oubliée, opération inversée) —
 * jamais des nombres au hasard, qui se laisseraient éliminer trop facilement.
 */

export type Rng = () => number;

export type CalcTheme =
  | "addition-soustraction"
  | "multiplication"
  | "division"
  | "quatre-operations"
  | "matrices"
  | "ordres-de-grandeur"
  | "fractions-pourcentages"
  | "metier"
  | "melange";

export type CalcLevel = 1 | 2 | 3;

/** Niveau demandé pour une session : fixe, ou croissant au fil des questions. */
export type CalcLevelChoice = CalcLevel | "progressif";

/**
 * Grille 3×3 à trou (thème « matrices »). Les totaux sont en marge ; une case
 * manque. `rowTotals[i]` peut être `null` au niveau 3 : le raccourci par la
 * ligne est alors coupé, il faut passer par la colonne.
 */
export interface CalcGrid {
  /** Neuf cases, ligne par ligne ; la case cherchée vaut `null`. */
  cells: (number | null)[];
  rowTotals: (number | null)[];
  colTotals: (number | null)[];
  /** Index (0-8) de la case à trouver. */
  missingIndex: number;
}

export interface CalcQuestion {
  id: string;
  /** Thème réel de la question — utile quand la session mélange tout. */
  theme: Exclude<CalcTheme, "melange">;
  level: CalcLevel;
  prompt: string;
  /** Grille à afficher (thème « matrices » uniquement). */
  grid?: CalcGrid;
  choices: string[];
  correctIndex: number;
  /** Comment on y arrive — affiché à la correction. */
  method: string;
}

export interface CalcThemeInfo {
  theme: CalcTheme;
  label: string;
  hint: string;
}

export const CALC_THEMES: readonly CalcThemeInfo[] = [
  {
    theme: "addition-soustraction",
    label: "Additions et soustractions",
    hint: "Les deux mêlées, avec les retenues qui piègent.",
  },
  {
    theme: "multiplication",
    label: "Multiplications",
    hint: "Tables étendues, décompositions, décimaux.",
  },
  {
    theme: "division",
    label: "Divisions",
    hint: "Exactes, puis quotients décimaux et diviseurs inférieurs à 1.",
  },
  {
    theme: "quatre-operations",
    label: "Les quatre opérations",
    hint: "Tout se mélange, avec des calculs en chaîne.",
  },
  {
    theme: "matrices",
    label: "Grilles 3×3",
    hint: "Une case manque, les totaux la trahissent — calcul sous charge.",
  },
  {
    theme: "ordres-de-grandeur",
    label: "Ordres de grandeur",
    hint: "Pas le résultat exact : le bon encadrement. La compétence clé.",
  },
  {
    theme: "fractions-pourcentages",
    label: "Fractions et pourcentages",
    hint: "Fractions d’un nombre, hausses et remises successives.",
  },
  {
    theme: "metier",
    label: "Calculs du métier",
    hint: "Nœuds, pieds, temps de vol, règle du 1 en 60.",
  },
  {
    theme: "melange",
    label: "Tout mélangé",
    hint: "Comme à l’épreuve : les thèmes alternent sans prévenir.",
  },
];

/** Les thèmes réellement générateurs — « mélange » pioche parmi eux. */
const REAL_THEMES = CALC_THEMES.map((t) => t.theme).filter(
  (t): t is Exclude<CalcTheme, "melange"> => t !== "melange"
);

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

export type CalcFormatKey = "court" | "standard" | "officiel" | "illimite";

export interface CalcFormat {
  key: CalcFormatKey;
  label: string;
  /** `null` pour le format illimité. */
  size: number | null;
  /** `null` quand la session n'est pas chronométrée. */
  durationSeconds: number | null;
  hint: string;
}

/** Cadence officielle : 24 questions en 8 minutes, soit 20 s l'unité. */
export const CALC_PACE_SECONDS = 20;

export const CALC_FORMATS: Record<CalcFormatKey, CalcFormat> = {
  court: {
    key: "court",
    label: "Court",
    size: 10,
    durationSeconds: 10 * CALC_PACE_SECONDS,
    hint: "Dix questions, à la cadence officielle.",
  },
  standard: {
    key: "standard",
    label: "Standard",
    size: 20,
    durationSeconds: 20 * CALC_PACE_SECONDS,
    hint: "Vingt questions, même cadence.",
  },
  officiel: {
    key: "officiel",
    label: "Test officiel",
    size: 24,
    durationSeconds: 8 * 60,
    hint: "Le format des sélections : 24 questions en 8 minutes.",
  },
  illimite: {
    key: "illimite",
    label: "Sans fin",
    size: null,
    durationSeconds: null,
    hint: "On enchaîne à son rythme et on s’arrête quand on veut.",
  },
};

export const CALC_FORMAT_LIST: readonly CalcFormat[] = [
  CALC_FORMATS.court,
  CALC_FORMATS.standard,
  CALC_FORMATS.officiel,
  CALC_FORMATS.illimite,
];

/** Niveau d'une question selon sa place, quand la session est progressive. */
export function levelAt(index: number, size: number | null): CalcLevel {
  if (size === null) {
    // Sans fin : on monte par paliers de dix, puis on reste au niveau 3.
    return (Math.min(3, Math.floor(index / 10) + 1) as CalcLevel) ?? 1;
  }
  const third = size / 3;
  if (index < third) return 1;
  if (index < third * 2) return 2;
  return 3;
}

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Arrondi à trois décimales : suffisant, et évite les 0,30000000000000004. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Arrondi d'estimation : on ne demande pas l'approximation d'un nombre donné
 * au millième. Les propositions restent lisibles à l'échelle où on les
 * manipule — c'est le propre d'un ordre de grandeur.
 */
function roundish(value: number): number {
  const abs = Math.abs(value);
  if (abs >= 100) return Math.round(value / 5) * 5;
  if (abs >= 10) return Math.round(value);
  return Math.round(value * 10) / 10;
}

/**
 * Écriture française d'un nombre : virgule décimale, pas de séparateur de
 * milliers (il gênerait plus qu'il n'aiderait sur des nombres de cette taille).
 * Formatage maison plutôt que `toLocaleString`, dont le résultat dépend de
 * l'environnement — et le contenu d'une question ne doit dépendre de rien.
 */
export function fmt(value: number): string {
  return String(round(value)).replace(".", ",");
}

interface RawQuestion {
  prompt: string;
  answer: number;
  /** Fausses valeurs plausibles, par ordre de préférence. */
  wrong: number[];
  method: string;
  grid?: CalcGrid;
}

/**
 * Quatre propositions uniques, mélangées par la graine. Si les distracteurs
 * proposés se télescopent, on complète par de légers écarts — mais jamais au
 * point de produire une proposition absurde, qui donnerait la réponse.
 */
function buildChoices(raw: RawQuestion, seed: number): { choices: string[]; correctIndex: number } {
  const values: number[] = [round(raw.answer)];
  for (const candidate of raw.wrong) {
    const value = round(candidate);
    if (values.length >= 4) break;
    if (values.some((v) => Math.abs(v - value) < 1e-9)) continue;
    values.push(value);
  }
  const rng = createRng(seed + 991);
  let guard = 0;
  while (values.length < 4 && guard < 60) {
    guard += 1;
    const scale = Math.max(1, Math.abs(raw.answer) * 0.1);
    const value = round(raw.answer + pick(rng, [-3, -2, -1, 1, 2, 3]) * scale);
    if (values.some((v) => Math.abs(v - value) < 1e-9)) continue;
    values.push(value);
  }
  const order = seededShuffle(
    values.map((_, i) => i),
    seed + 17
  );
  const shuffled = order.map((i) => values[i]);
  return {
    choices: shuffled.map(fmt),
    correctIndex: shuffled.findIndex((v) => Math.abs(v - round(raw.answer)) < 1e-9),
  };
}

// ---------------------------------------------------------------------------
// Générateurs par thème
// ---------------------------------------------------------------------------

function genAddSub(rng: Rng, level: CalcLevel): RawQuestion {
  if (level === 1) {
    const a = int(rng, 23, 89);
    const b = int(rng, 14, 68);
    const plus = rng() < 0.5;
    const answer = plus ? a + b : a - b;
    return {
      prompt: `${a} ${plus ? "+" : "−"} ${b} = ?`,
      answer,
      wrong: [answer + 10, answer - 10, answer + (plus ? -1 : 1) * 1],
      method: plus
        ? `On complète à la dizaine : ${a} + ${b} = ${a} + ${b - (b % 10)} + ${b % 10}.`
        : `On retire la dizaine puis le reste : ${a} − ${b - (b % 10)} − ${b % 10}.`,
    };
  }
  if (level === 2) {
    const a = int(rng, 120, 480);
    const b = int(rng, 40, 190);
    const c = int(rng, 15, 95);
    const answer = a + b - c;
    return {
      prompt: `${a} + ${b} − ${c} = ?`,
      answer,
      wrong: [a + b + c, answer + 10, answer - 100],
      method: `On regroupe : ${a} + ${b} = ${a + b}, puis on retire ${c}.`,
    };
  }
  const a = round(int(rng, 40, 180) + int(rng, 1, 9) / 10);
  const b = round(int(rng, 10, 60) + int(rng, 1, 95) / 100);
  const c = round(int(rng, 5, 40) + int(rng, 1, 9) / 10);
  const answer = round(a + b - c);
  return {
    prompt: `${fmt(a)} + ${fmt(b)} − ${fmt(c)} = ?`,
    answer,
    wrong: [round(a + b + c), round(answer + 1), round(answer - 0.1)],
    method: `On sépare entiers et décimales : ${Math.trunc(a)} + ${Math.trunc(b)} − ${Math.trunc(c)}, puis on ajuste avec les virgules.`,
  };
}

function genMultiplication(rng: Rng, level: CalcLevel): RawQuestion {
  if (level === 1) {
    const a = int(rng, 6, 14);
    const b = int(rng, 4, 12);
    const answer = a * b;
    return {
      prompt: `${a} × ${b} = ?`,
      answer,
      wrong: [answer + a, answer - b, a + b],
      method: `Table étendue : ${a} × ${b} = ${a} × ${b - 1} + ${a}.`,
    };
  }
  if (level === 2) {
    const a = int(rng, 12, 48);
    const b = pick(rng, [11, 15, 25, 12, 9]);
    const answer = a * b;
    const trick =
      b === 11
        ? `× 11 = × 10 + une fois`
        : b === 15
          ? `× 15 = × 10 + la moitié de × 10`
          : b === 25
            ? `× 25 = × 100 ÷ 4`
            : b === 9
              ? `× 9 = × 10 − une fois`
              : `× 12 = × 10 + × 2`;
    return {
      prompt: `${a} × ${b} = ?`,
      answer,
      wrong: [answer + a, answer - a, a * (b + 1)],
      method: `On décompose : ${trick}. Ici ${a} × ${b} = ${answer}.`,
    };
  }
  const a = round(int(rng, 15, 60) / 10 + int(rng, 1, 8));
  const b = int(rng, 6, 24);
  const answer = round(a * b);
  return {
    prompt: `${fmt(a)} × ${b} = ?`,
    answer,
    wrong: [round(answer * 10), round(answer / 10), round(answer + b)],
    method: `On multiplie sans la virgule (${fmt(a * 10)} × ${b} = ${fmt(a * 10 * b)}), puis on la replace : ${fmt(answer)}.`,
  };
}

function genDivision(rng: Rng, level: CalcLevel): RawQuestion {
  if (level === 1) {
    const b = int(rng, 3, 12);
    const q = int(rng, 4, 15);
    const a = b * q;
    return {
      prompt: `${a} ÷ ${b} = ?`,
      answer: q,
      wrong: [q + 1, q - 1, round(b / q)],
      method: `On cherche le nombre qui multiplie ${b} pour donner ${a} : c’est ${q}.`,
    };
  }
  if (level === 2) {
    const b = pick(rng, [4, 5, 8, 25]);
    const q = int(rng, 6, 40);
    const a = b * q;
    const trick =
      b === 5
        ? `÷ 5 = × 2 ÷ 10`
        : b === 25
          ? `÷ 25 = × 4 ÷ 100`
          : b === 4
            ? `÷ 4 = deux moitiés`
            : `÷ 8 = trois moitiés`;
    return {
      prompt: `${a} ÷ ${b} = ?`,
      answer: q,
      wrong: [q * 2, round(q / 2), q + 5],
      method: `Raccourci : ${trick}. Ici ${a} ÷ ${b} = ${q}.`,
    };
  }
  const b = pick(rng, [0.5, 0.2, 0.25, 1.5]);
  const q = int(rng, 8, 60);
  const a = round(b * q);
  return {
    prompt: `${fmt(a)} ÷ ${fmt(b)} = ?`,
    answer: q,
    wrong: [round(a * b), round(q / 2), round(q * 10)],
    method: `Diviser par ${fmt(b)}, c’est multiplier par ${fmt(1 / b)} — le résultat est donc ${b < 1 ? "plus grand" : "plus petit"} que ${fmt(a)}.`,
  };
}

function genFourOps(rng: Rng, level: CalcLevel): RawQuestion {
  if (level === 3) {
    const a = int(rng, 12, 40);
    const b = int(rng, 8, 35);
    const c = int(rng, 2, 9);
    const answer = (a + b) * c;
    return {
      prompt: `(${a} + ${b}) × ${c} = ?`,
      answer,
      wrong: [a + b * c, answer + c, (a + b) * (c + 1)],
      method: `La parenthèse d’abord : ${a} + ${b} = ${a + b}, puis × ${c} = ${answer}. Sans la parenthèse on aurait ${a + b * c}.`,
    };
  }
  return pick(rng, [genAddSub, genMultiplication, genDivision])(rng, level);
}

/** Une grille cohérente, dont on masque une case (et parfois son total). */
function genGrid(rng: Rng, level: CalcLevel): RawQuestion {
  const max = level === 1 ? 18 : level === 2 ? 60 : 40;
  const decimals = level === 3 && rng() < 0.5;
  const value = () => (decimals ? round(int(rng, 10, max * 10) / 10) : int(rng, 1, max));

  const cells = Array.from({ length: 9 }, value);
  const rowTotals = [0, 1, 2].map((r) => round(cells[r * 3] + cells[r * 3 + 1] + cells[r * 3 + 2]));
  const colTotals = [0, 1, 2].map((c) => round(cells[c] + cells[c + 3] + cells[c + 6]));

  const missingIndex = int(rng, 0, 8);
  const row = Math.floor(missingIndex / 3);
  const col = missingIndex % 3;
  const answer = cells[missingIndex];

  // Niveau 3 : le total de la ligne disparaît aussi — le raccourci évident
  // est coupé, il faut passer par la colonne.
  const hideRowTotal = level === 3;
  const grid: CalcGrid = {
    cells: cells.map((v, i) => (i === missingIndex ? null : v)),
    rowTotals: rowTotals.map((t, i) => (hideRowTotal && i === row ? null : t)),
    colTotals,
    missingIndex,
  };

  const method = hideRowTotal
    ? `Le total de la ligne manque : on passe par la colonne ${col + 1}. ${fmt(colTotals[col])} − ${fmt(cells[col] === answer ? cells[col + 3] : cells[col])} − ${fmt(cells[col + 6] === answer ? cells[col + 3] : cells[col + 6])} = ${fmt(answer)}.`
    : `Par la ligne ${row + 1} : ${fmt(rowTotals[row])} moins les deux autres cases donne ${fmt(answer)}. La colonne ${col + 1} le confirme.`;

  return {
    prompt: "Quelle valeur manque dans la grille ?",
    answer,
    wrong: [round(answer + 1), round(answer - 1), round(rowTotals[row] - answer)],
    method,
    grid,
  };
}

/**
 * Ordres de grandeur — on ne demande pas le résultat exact. Les propositions
 * sont assez écartées pour que seul l'encadrement tranche, et la bonne est
 * toujours la plus proche du vrai résultat, sans ambiguïté possible.
 */
function genMagnitude(rng: Rng, level: CalcLevel): RawQuestion {
  let prompt: string;
  let exact: number;
  let method: string;

  if (level === 1) {
    const a = round(int(rng, 40, 99) / 10);
    const b = round(int(rng, 40, 130) / 10);
    exact = a * b;
    prompt = `${fmt(a)} × ${fmt(b)} ≈ ?`;
    method = `On encadre : ${Math.floor(a)} × ${Math.floor(b)} = ${Math.floor(a) * Math.floor(b)} et ${Math.ceil(a)} × ${Math.ceil(b)} = ${Math.ceil(a) * Math.ceil(b)}. Le résultat est entre les deux.`;
  } else if (level === 2) {
    const b = round(int(rng, 15, 95) / 10);
    const q = int(rng, 8, 40);
    // Le dividende s'affiche : on le garde à une décimale, sans quoi on
    // demanderait d'estimer un nombre plus précis que la réponse attendue.
    const a = Math.round(b * q * (1 + int(rng, -6, 6) / 100) * 10) / 10;
    exact = a / b;
    prompt = `${fmt(a)} ÷ ${fmt(b)} ≈ ?`;
    method = `On arrondit le diviseur à ${Math.round(b)} : ${fmt(a)} ÷ ${Math.round(b)} ≈ ${fmt(a / Math.round(b))}.`;
  } else {
    const p = pick(rng, [12, 18, 23, 27, 34, 43]);
    const n = int(rng, 220, 1800);
    exact = (n * p) / 100;
    prompt = `${p} % de ${n} ≈ ?`;
    method = `${p} %, c’est un peu ${p > 25 ? "plus" : "moins"} d’un quart : ${n} ÷ 4 = ${fmt(n / 4)}. On ajuste vers ${fmt(exact)}.`;
  }

  // Propositions espacées d'au moins 40 % — l'exactitude n'est pas le sujet,
  // et des nombres ronds le disent mieux que des décimales inutiles.
  const answer = roundish(exact);
  const wrong = [roundish(exact * 0.45), roundish(exact * 1.75), roundish(exact * 3)];
  return { prompt, answer, wrong, method };
}

function genFractions(rng: Rng, level: CalcLevel): RawQuestion {
  if (level === 1) {
    const [num, den] = pick(rng, [
      [1, 2],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
    ]);
    const base = den * int(rng, 4, 24);
    const answer = (base * num) / den;
    return {
      prompt: `${num}/${den} de ${base} = ?`,
      answer,
      wrong: [base / den, base - answer, answer * 2],
      method: `On divise par ${den} (${base} ÷ ${den} = ${fmt(base / den)}) puis on multiplie par ${num}.`,
    };
  }
  if (level === 2) {
    const p = pick(rng, [15, 20, 30, 12.5, 60, 75]);
    const base = int(rng, 8, 60) * 4;
    const answer = round((base * p) / 100);
    return {
      prompt: `${fmt(p)} % de ${base} = ?`,
      answer,
      wrong: [round((base * p) / 10), round(base - answer), round((base * (p + 10)) / 100)],
      method: `10 % de ${base} vaut ${fmt(base / 10)} ; on en déduit ${fmt(p)} % = ${fmt(answer)}.`,
    };
  }
  const base = int(rng, 20, 90) * 10;
  const up = pick(rng, [10, 20, 25, 30]);
  const down = pick(rng, [10, 20, 25, 30]);
  const answer = round(base * (1 + up / 100) * (1 - down / 100));
  return {
    prompt: `${base}, augmenté de ${up} % puis diminué de ${down} % = ?`,
    answer,
    wrong: [
      round(base * (1 + (up - down) / 100)),
      base,
      round(base * (1 - up / 100) * (1 + down / 100)),
    ],
    method: `Les pourcentages ne s’additionnent pas : on multiplie. ${base} × ${fmt(1 + up / 100)} × ${fmt(1 - down / 100)} = ${fmt(answer)} — et non ${fmt(base * (1 + (up - down) / 100))}.`,
  };
}

/**
 * Calculs du métier. Les facteurs employés sont ceux consignés dans les fiches
 * Fondamentaux : 1 nœud = 1,852 km/h, 1 pied = 0,3048 m, 1 mille marin =
 * 1852 m. Les règles d'estimation (1 en 60, pente à 3°) sont présentées comme
 * les approximations qu'elles sont.
 */
function genMetier(rng: Rng, level: CalcLevel): RawQuestion {
  if (level === 1) {
    const kind = pick(rng, ["kt", "ft", "temp"] as const);
    if (kind === "kt") {
      const kt = int(rng, 80, 480);
      const answer = round(kt * 1.852);
      return {
        prompt: `${kt} kt en km/h ≈ ?`,
        answer,
        wrong: [round(kt / 1.852), kt * 2, round(kt * 1.6)],
        method: `1 nœud = 1,852 km/h. On double et on retire un peu : ${kt} × 2 = ${kt * 2}, moins ${fmt(kt * 0.148)}.`,
      };
    }
    if (kind === "ft") {
      const ft = int(rng, 5, 39) * 1000;
      const answer = round(ft * 0.3048);
      return {
        prompt: `${ft} ft en mètres ≈ ?`,
        answer,
        wrong: [round(ft / 0.3048), round(ft * 0.5), round(ft * 0.1)],
        method: `1 pied = 0,3048 m, soit environ le tiers d’un mètre : ${ft} ÷ 3 ≈ ${fmt(ft / 3)}, un peu moins en réalité.`,
      };
    }
    const c = int(rng, -40, 35);
    const answer = round((c * 9) / 5 + 32);
    return {
      prompt: `${c} °C en °F = ?`,
      answer,
      wrong: [round((c - 32) * (5 / 9)), round(c * 2 + 32), round(c + 32)],
      method: `°F = °C × 9/5 + 32. De tête : on double, on retire un dixième, on ajoute 32.`,
    };
  }

  if (level === 2) {
    const kind = pick(rng, ["temps", "carburant"] as const);
    if (kind === "temps") {
      const speed = pick(rng, [120, 150, 180, 240, 300]);
      const minutes = pick(rng, [20, 30, 40, 45, 50]);
      const answer = round((speed * minutes) / 60);
      return {
        prompt: `À ${speed} kt, quelle distance en ${minutes} min ?`,
        answer,
        wrong: [speed, round((speed * minutes) / 100), round((speed * 60) / minutes)],
        method: `En une minute on parcourt ${fmt(speed / 60)} NM. En ${minutes} min : ${fmt(answer)} NM.`,
      };
    }
    const conso = pick(rng, [180, 240, 320, 450]);
    const minutes = pick(rng, [30, 45, 90, 120]);
    const answer = round((conso * minutes) / 60);
    return {
      prompt: `Une consommation de ${conso} L/h pendant ${minutes} min, cela fait ?`,
      answer,
      wrong: [conso, round((conso * minutes) / 100), round(conso / (minutes / 60))],
      method: `${minutes} min = ${fmt(minutes / 60)} h. ${conso} × ${fmt(minutes / 60)} = ${fmt(answer)} L.`,
    };
  }

  const kind = pick(rng, ["1en60", "pente"] as const);
  if (kind === "1en60") {
    const distance = pick(rng, [30, 45, 60, 90, 120]);
    const ecart = int(rng, 2, 8);
    const answer = round((ecart * distance) / 60);
    return {
      prompt: `Règle du 1 en 60 : ${ecart}° d’écart sur ${distance} NM, cela fait combien de milles de dérive ?`,
      answer,
      wrong: [ecart, round((ecart * 60) / distance), round(ecart * distance)],
      method: `1° d’écart vaut 1 NM à 60 NM. À ${distance} NM : ${ecart} × ${distance} ÷ 60 = ${fmt(answer)} NM. C’est une approximation, valable pour de petits angles.`,
    };
  }
  const nm = int(rng, 3, 25);
  const answer = nm * 300;
  return {
    prompt: `Descente à 3° : quelle perte d’altitude sur ${nm} NM ?`,
    answer,
    wrong: [nm * 100, nm * 500, round(nm * 300 * 10)],
    method: `Une pente de 3° vaut environ 300 ft par mille marin. ${nm} × 300 = ${answer} ft. Approximation standard, retenue pour sa commodité.`,
  };
}

const GENERATORS: Record<
  Exclude<CalcTheme, "melange">,
  (rng: Rng, level: CalcLevel) => RawQuestion
> = {
  "addition-soustraction": genAddSub,
  multiplication: genMultiplication,
  division: genDivision,
  "quatre-operations": genFourOps,
  matrices: genGrid,
  "ordres-de-grandeur": genMagnitude,
  "fractions-pourcentages": genFractions,
  metier: genMetier,
};

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------

export function generateCalcQuestion(
  seed: number,
  theme: CalcTheme,
  level: CalcLevel
): CalcQuestion {
  const rng = createRng(seed);
  const actual: Exclude<CalcTheme, "melange"> =
    theme === "melange" ? pick(rng, REAL_THEMES) : theme;
  const raw = GENERATORS[actual](rng, level);
  const { choices, correctIndex } = buildChoices(raw, seed);
  return {
    id: `calc.${actual}.${level}.${seed}`,
    theme: actual,
    level,
    prompt: raw.prompt,
    grid: raw.grid,
    choices,
    correctIndex,
    method: raw.method,
  };
}

/**
 * Les questions d'une session. Le format sans fin n'en produit pas des
 * milliers d'avance : on en fabrique à la demande, via `questionAt`.
 */
export function questionAt(
  sessionSeed: number,
  index: number,
  theme: CalcTheme,
  levelChoice: CalcLevelChoice,
  size: number | null
): CalcQuestion {
  const level = levelChoice === "progressif" ? levelAt(index, size) : levelChoice;
  return generateCalcQuestion(sessionSeed + index * 7717, theme, level);
}

export function buildCalcSession(
  sessionSeed: number,
  theme: CalcTheme,
  levelChoice: CalcLevelChoice,
  format: CalcFormatKey
): CalcQuestion[] {
  const { size } = CALC_FORMATS[format];
  if (size === null) return [];
  return Array.from({ length: size }, (_, i) =>
    questionAt(sessionSeed, i, theme, levelChoice, size)
  );
}

// ---------------------------------------------------------------------------
// Notation
// ---------------------------------------------------------------------------

export interface CalcScore {
  correct: number;
  answered: number;
  total: number;
  precision: number;
  /** Plus longue série de bonnes réponses consécutives. */
  bestStreak: number;
}

export function scoreCalcSession(
  questions: readonly CalcQuestion[],
  answers: readonly (number | null)[]
): CalcScore {
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
    if (answer === question.correctIndex) {
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
    precision: answered === 0 ? 0 : Math.round((correct / answered) * 100),
    bestStreak,
  };
}
