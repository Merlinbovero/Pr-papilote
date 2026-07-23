import { createRng, seededShuffle } from "@/features/quiz/engine";
import type { PsyFamily, PsyFamilyInfo, PsyInstrument, PsyQuestion } from "./types";

/**
 * Générateurs des familles psychotechniques — règles propres, documentées
 * dans docs/editorial/module-psychotechnique.md. Déterministes par graine
 * (rejouables, testables), originaux (aucune batterie copiée).
 *
 * Convention : chaque générateur reçoit (seed, difficulty) et produit une
 * PsyQuestion à 4 choix dont les distracteurs sont des erreurs PLAUSIBLES
 * (erreur de retenue, ±1, chiffres transposés…), jamais du bruit aléatoire.
 */

export const FAMILY_INFO: Record<PsyFamily, PsyFamilyInfo> = {
  "calcul-mental": {
    slug: "calcul-mental",
    name: "Calcul mental",
    consigne:
      "Calculez de tête, sans brouillon. Les distracteurs reproduisent les erreurs classiques — vérifiez l'ordre de grandeur avant de valider.",
    ficheHref: "/psychotechnique/exercices/le-calcul-mental",
    timeLimits: [15, 20, 30],
  },
  "suites-numeriques": {
    slug: "suites-numeriques",
    name: "Suites numériques",
    consigne:
      "Trouvez le terme suivant. Cherchez d'abord la nature de la règle — différence constante, multiplication, alternance, entrelacement.",
    ficheHref: "/psychotechnique/exercices/les-suites-logiques",
    timeLimits: [20, 25, 35],
  },
  "series-logiques": {
    slug: "series-logiques",
    name: "Séries logiques",
    consigne:
      "Complétez la série de lettres. Convertissez mentalement en positions dans l'alphabet (A=1 … Z=26) pour révéler la règle.",
    ficheHref: "/psychotechnique/exercices/les-suites-logiques",
    timeLimits: [20, 25, 35],
  },
  memoire: {
    slug: "memoire",
    name: "Mémoire",
    consigne:
      "Une liste s'affiche quelques secondes, puis disparaît — mémorisez-la (regroupez, verbalisez). La question porte sur son contenu.",
    ficheHref: "/psychotechnique/exercices/la-memoire",
    timeLimits: [15, 15, 15],
  },
  "empan-chiffres": {
    slug: "empan-chiffres",
    name: "Empan de chiffres",
    consigne:
      "Une courte séquence de chiffres s'affiche puis disparaît. Restituez-la À L'ENVERS — c'est la mémoire de travail, cœur des tests pilote, que l'on évalue ici.",
    ficheHref: "/psychotechnique/exercices/la-memoire",
    timeLimits: [15, 15, 20],
  },
  attention: {
    slug: "attention",
    name: "Attention",
    consigne:
      "Comptez les occurrences EXACTES du caractère cible dans la grille. Balayez ligne par ligne, à rythme régulier — la précipitation fait rater.",
    ficheHref: "/psychotechnique/exercices/l-attention-et-le-multitache",
    timeLimits: [30, 40, 50],
  },
  orientation: {
    slug: "orientation",
    name: "Orientation",
    consigne:
      "Caps et virages — raisonnez sur la rose des caps (0-360°). Un virage à droite augmente le cap, à gauche le diminue, modulo 360.",
    ficheHref: "/psychotechnique/exercices/la-vision-spatiale",
    timeLimits: [20, 25, 30],
  },
  rapidite: {
    slug: "rapidite",
    name: "Rapidité et précision",
    consigne:
      "Les deux chaînes sont-elles STRICTEMENT identiques ? Comparez caractère par caractère — les différences se cachent au milieu.",
    ficheHref: "/psychotechnique/exercices/l-attention-et-le-multitache",
    timeLimits: [10, 12, 15],
  },
  dominos: {
    slug: "dominos",
    name: "Dominos",
    consigne:
      "Trouvez le domino qui complète la série. Traitez le haut et le bas séparément : chaque moitié suit sa propre règle (le blanc vaut 0 et suit le 6).",
    ficheHref: "/psychotechnique/exercices/les-dominos",
    timeLimits: [25, 30, 40],
  },
  "rotation-mentale": {
    slug: "rotation-mentale",
    name: "Rotation mentale",
    consigne:
      "Faites pivoter mentalement le motif de flèches de l'angle indiqué, dans le bon sens. Un quart de tour à droite = un cran horaire par flèche.",
    ficheHref: "/psychotechnique/exercices/la-vision-spatiale",
    timeLimits: [20, 25, 30],
  },
  "double-tache": {
    slug: "double-tache",
    name: "Double tâche",
    consigne:
      "Deux consignes en même temps : retenez le premier indice (la lettre) et appliquez le calcul qu'il commande sur le second (le cap). L'attention partagée est ce que l'on évalue.",
    ficheHref: "/psychotechnique/exercices/l-attention-et-le-multitache",
    timeLimits: [20, 25, 30],
  },
  "dissociation-attention": {
    slug: "dissociation-attention",
    name: "Dissociation d'attention",
    consigne:
      "Chaque cadran a SA propre limite (min, max ou plage). Surveillez-les tous en même temps et repérez ceux qui sont sortis de leur tolérance — c'est l'attention répartie sur 4 à 5 paramètres, cœur du pilotage, que l'on évalue ici.",
    ficheHref: "/psychotechnique/exercices/la-dissociation-d-attention",
    timeLimits: [35, 45, 55],
  },
  "lecture-instruments": {
    slug: "lecture-instruments",
    name: "Lecture d'instruments",
    consigne:
      "Lisez le cadran affiché et donnez sa valeur. Compas puis anémomètre, enfin l'altimètre à deux aiguilles (grande = centaines de pieds, petite = milliers) — l'aptitude cockpit par excellence.",
    ficheHref: "/psychotechnique/exercices/la-lecture-d-instruments",
    timeLimits: [15, 18, 25],
  },
  "memoire-associative": {
    slug: "memoire-associative",
    name: "Mémoire associative",
    consigne:
      "Des paires « indicatif → nombre » s'affichent quelques secondes puis disparaissent. Mémorisez les associations : la question porte sur l'une d'elles. Reliez chaque paire par une image mentale.",
    ficheHref: "/psychotechnique/exercices/la-memoire-associative",
    timeLimits: [15, 18, 20],
  },
};

type Rng = () => number;

/** Entier uniforme dans [min, max]. */
function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pickOne<T>(rng: Rng, items: readonly T[]): T {
  return items[int(rng, 0, items.length - 1)];
}

/** Assemble 4 choix uniques (bonne réponse + distracteurs), ordre mélangé par graine. */
function buildChoices(
  rng: Rng,
  seed: number,
  correct: string,
  distractors: string[]
): { choices: string[]; correctIndex: number } {
  const unique = [...new Set([correct, ...distractors])];
  // Complète si des distracteurs se sont télescopés avec la bonne réponse.
  let filler = 1;
  while (unique.length < 4) {
    const candidate = `${correct}${" ".repeat(filler)}`.trim() + `·${filler}`;
    unique.push(candidate);
    filler += 1;
  }
  const choices = seededShuffle(unique.slice(0, 4), seed);
  return { choices, correctIndex: choices.indexOf(correct) };
}

// ---------------------------------------------------------------------------
// calcul-mental
// ---------------------------------------------------------------------------

function genCalcul(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  let prompt: string;
  let value: number;
  let unit = "";
  let method: string;

  if (difficulty === 1) {
    const a = int(rng, 17, 89);
    const b = int(rng, 13, 78);
    if (rng() < 0.5) {
      prompt = `${a} + ${b} = ?`;
      value = a + b;
      method = `Additionnez les dizaines (${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10}) puis les unités — et vérifiez la retenue.`;
    } else {
      const [hi, lo] = a >= b ? [a, b] : [b, a];
      prompt = `${hi} − ${lo} = ?`;
      value = hi - lo;
      method = `Passez par le complément — de ${lo} pour aller à ${hi}, comptez d'abord jusqu'à la dizaine supérieure.`;
    }
  } else if (difficulty === 2) {
    if (rng() < 0.5) {
      const a = int(rng, 12, 29);
      const b = int(rng, 3, 9);
      prompt = `${a} × ${b} = ?`;
      value = a * b;
      method = `Décomposez — ${a} × ${b} = ${Math.floor(a / 10) * 10} × ${b} + ${a % 10} × ${b}.`;
    } else {
      const b = int(rng, 3, 9);
      const q = int(rng, 12, 25);
      prompt = `${b * q} ÷ ${b} = ?`;
      value = q;
      method = `Cherchez le facteur — combien de fois ${b} dans ${b * q} ? Appuyez-vous sur la table de ${b}.`;
    }
  } else {
    const kind = int(rng, 0, 2);
    if (kind === 0) {
      const minutes = pickOne(rng, [12, 15, 20, 24, 30, 36, 45]);
      const speed = pickOne(rng, [120, 180, 240, 300, 360]);
      prompt = `À ${speed} kt, quelle distance parcourt-on en ${minutes} minutes (en NM) ?`;
      value = (speed / 60) * minutes;
      unit = " NM";
      method = `Le facteur de base — ${speed} kt = ${speed / 60} NM par minute, puis × ${minutes}.`;
    } else if (kind === 1) {
      const conso = pickOne(rng, [8, 10, 12, 15, 20]);
      const heures = pickOne(rng, [1.5, 2, 2.5, 3]);
      prompt = `Consommation ${conso} L/h — quel carburant pour ${heures} h de vol (en L) ?`;
      value = conso * heures;
      unit = " L";
      method = `Multiplication directe — ${conso} × ${heures} ; pour les demi-heures, ajoutez la moitié de la consommation horaire.`;
    } else {
      const h = int(rng, 1, 3);
      const m = pickOne(rng, [10, 20, 30, 40, 50]);
      const add = pickOne(rng, [25, 35, 45, 50]);
      const total = h * 60 + m + add;
      prompt = `Il est ${h} h ${String(m).padStart(2, "0")}. Quelle heure sera-t-il dans ${add} minutes (format h min) ?`;
      value = total;
      unit = "";
      const hh = Math.floor(total / 60);
      const mm = total % 60;
      const correct = `${hh} h ${String(mm).padStart(2, "0")}`;
      const distractors = [
        `${hh} h ${String((mm + 10) % 60).padStart(2, "0")}`,
        `${hh - 1} h ${String(mm).padStart(2, "0")}`,
        `${hh} h ${String(Math.abs(mm - 10)).padStart(2, "0")}`,
      ];
      const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
      return {
        id: `psy.calcul.${seed}`,
        family: "calcul-mental",
        difficulty,
        prompt,
        choices,
        correctIndex,
        method:
          "Ajoutez d'abord ce qui amène à l'heure ronde, puis le reste — les minutes au-delà de 60 basculent l'heure.",
        timeLimitSeconds: FAMILY_INFO["calcul-mental"].timeLimits[difficulty - 1],
      };
    }
  }

  const correct = `${value}${unit}`;
  const distractors = [
    `${value + (difficulty === 3 ? 5 : 10)}${unit}`,
    `${Math.max(1, value - (difficulty === 3 ? 5 : 10))}${unit}`,
    `${value + 1}${unit}`,
  ];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.calcul.${seed}`,
    family: "calcul-mental",
    difficulty,
    prompt,
    choices,
    correctIndex,
    method,
    timeLimitSeconds: FAMILY_INFO["calcul-mental"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// suites-numeriques
// ---------------------------------------------------------------------------

function genSuite(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  let terms: number[] = [];
  let next = 0;
  let method: string;

  if (difficulty === 1) {
    const start = int(rng, 2, 20);
    const r = pickOne(rng, [3, 4, 6, 7, 8, 9, 11]);
    terms = [0, 1, 2, 3].map((i) => start + i * r);
    next = start + 4 * r;
    method = `Suite arithmétique — chaque terme augmente de ${r}.`;
  } else if (difficulty === 2) {
    if (rng() < 0.5) {
      const start = int(rng, 2, 6);
      const k = pickOne(rng, [2, 3]);
      terms = [start, start * k, start * k * k, start * k * k * k];
      next = start * k ** 4;
      method = `Suite géométrique — chaque terme est multiplié par ${k}.`;
    } else {
      const start = int(rng, 10, 30);
      const a = int(rng, 4, 9);
      const b = int(rng, 1, 3);
      terms = [start, start + a, start + a - b, start + 2 * a - b, start + 2 * a - 2 * b];
      next = start + 3 * a - 2 * b;
      method = `Alternance — on ajoute ${a}, puis on retire ${b}, en boucle.`;
    }
  } else {
    // Deux suites entrelacées (positions paires et impaires indépendantes).
    const s1 = int(rng, 3, 12);
    const r1 = pickOne(rng, [4, 5, 6]);
    const s2 = int(rng, 20, 40);
    const r2 = pickOne(rng, [-3, -4, -5]);
    terms = [s1, s2, s1 + r1, s2 + r2, s1 + 2 * r1, s2 + 2 * r2];
    next = s1 + 3 * r1;
    method = `Deux suites entrelacées — les positions impaires suivent +${r1}, les paires ${r2}. Le terme demandé appartient à la première.`;
  }

  const correct = String(next);
  const distractors = [String(next + 1), String(next - 2), String(next + 5)];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.suite.${seed}`,
    family: "suites-numeriques",
    difficulty,
    prompt: `${terms.join(" ; ")} ; … — quel est le terme suivant ?`,
    choices,
    correctIndex,
    method,
    timeLimitSeconds: FAMILY_INFO["suites-numeriques"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// series-logiques (lettres)
// ---------------------------------------------------------------------------

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function letterAt(position: number): string {
  return ALPHABET[((position % 26) + 26) % 26];
}

function genSerieLogique(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const start = int(rng, 0, 12);
  let terms: string[];
  let next: string;
  let method: string;

  if (difficulty === 1) {
    const step = pickOne(rng, [1, 2, 3]);
    terms = [0, 1, 2, 3].map((i) => letterAt(start + i * step));
    next = letterAt(start + 4 * step);
    method = `Chaque lettre avance de ${step} rang${step > 1 ? "s" : ""} dans l'alphabet.`;
  } else if (difficulty === 2) {
    const a = pickOne(rng, [2, 3]);
    const b = pickOne(rng, [1, 4]);
    const positions = [start, start + a, start + a + b, start + 2 * a + b, start + 2 * a + 2 * b];
    terms = positions.slice(0, 4).map(letterAt);
    next = letterAt(positions[4]);
    method = `Alternance de pas — +${a}, puis +${b}, en boucle.`;
  } else {
    const step1 = pickOne(rng, [1, 2]);
    const step2 = pickOne(rng, [3, 4]);
    terms = [0, 1, 2].map(
      (i) => `${letterAt(start + i * step1)}${letterAt(start + 10 + i * step2)}`
    );
    next = `${letterAt(start + 3 * step1)}${letterAt(start + 10 + 3 * step2)}`;
    method = `Deux règles en parallèle — la première lettre avance de ${step1}, la seconde de ${step2}.`;
  }

  const correct = next;
  const shift = (s: string, d: number) =>
    s
      .split("")
      .map((c) => letterAt(ALPHABET.indexOf(c) + d))
      .join("");
  const distractors = [shift(next, 1), shift(next, -1), shift(next, 2)];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.serie.${seed}`,
    family: "series-logiques",
    difficulty,
    prompt: `${terms.join(" ; ")} ; … — que vient-il ensuite ?`,
    choices,
    correctIndex,
    method,
    timeLimitSeconds: FAMILY_INFO["series-logiques"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// memoire
// ---------------------------------------------------------------------------

const MEMO_WORDS = [
  "CAP",
  "PISTE",
  "VENT",
  "AILE",
  "ROTOR",
  "RADAR",
  "BALISE",
  "PHARE",
  "TOUR",
  "VIRAGE",
  "NUAGE",
  "FLOTTE",
];

function genMemoire(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const count = difficulty === 1 ? 5 : difficulty === 2 ? 7 : 8;
  const seconds = difficulty === 3 ? 3 : 4;
  const items = seededShuffle(MEMO_WORDS, seed).slice(0, count);

  const position = int(rng, 1, count);
  const correct = items[position - 1];
  const distractors = seededShuffle(
    items.filter((w) => w !== correct),
    seed + 3
  ).slice(0, 3);

  return {
    id: `psy.memoire.${seed}`,
    family: "memoire",
    difficulty,
    exposure: { lines: [items.join("   ")], seconds },
    prompt: `Quel était le ${position}${position === 1 ? "er" : "e"} mot de la liste ?`,
    choices: seededShuffle([correct, ...distractors], seed + 7),
    correctIndex: -1, // recalculé ci-dessous
    method:
      "Regroupez les mots par paquets de 2-3 et verbalisez-les en une phrase absurde — la position se retrouve en « rejouant » la phrase.",
    timeLimitSeconds: FAMILY_INFO.memoire.timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// empan-chiffres (mémoire de travail : restituer une séquence à l'envers)
// ---------------------------------------------------------------------------

function genEmpan(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const length = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
  const seconds = difficulty === 1 ? 4 : 5;

  // Séquence de chiffres sans répétition consécutive (lisibilité de l'exposition).
  const digits: number[] = [];
  let prev = -1;
  for (let i = 0; i < length; i += 1) {
    let d = int(rng, 0, 9);
    while (d === prev) d = int(rng, 0, 9);
    digits.push(d);
    prev = d;
  }
  // Évite un palindrome (la version « à l'endroit » doit rester un distracteur valide).
  const reversed = [...digits].reverse();
  if (reversed.join("") === digits.join("")) {
    digits[length - 1] = (digits[length - 1] + 1) % 10;
    reversed[0] = digits[length - 1];
  }

  const correct = reversed.join(" ");
  const original = digits.join(" "); // erreur classique : oubli d'inverser
  const swapped = [...reversed];
  const s = int(rng, 0, length - 2);
  [swapped[s], swapped[s + 1]] = [swapped[s + 1], swapped[s]];
  const changed = [...reversed];
  const c = int(rng, 0, length - 1);
  changed[c] = (changed[c] + 1 + int(rng, 0, 8)) % 10;

  const { choices, correctIndex } = buildChoices(rng, seed + 11, correct, [
    original,
    swapped.join(" "),
    changed.join(" "),
  ]);

  return {
    id: `psy.empan-chiffres.${seed}`,
    family: "empan-chiffres",
    difficulty,
    exposure: { lines: [digits.join("   ")], seconds },
    prompt: "Quelle est la séquence lue À L'ENVERS (du dernier au premier chiffre) ?",
    choices,
    correctIndex,
    method:
      "Répétez la séquence à voix basse en la remontant du dernier au premier chiffre ; regroupez-la par paires pour tenir toute la longueur en mémoire de travail.",
    timeLimitSeconds: FAMILY_INFO["empan-chiffres"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// attention (comptage en grille)
// ---------------------------------------------------------------------------

const CONFUSABLE_SETS = [
  { target: "b", fillers: ["d", "p", "q"] },
  { target: "6", fillers: ["9", "8", "0"] },
  { target: "O", fillers: ["0", "Q", "D"] },
  { target: "n", fillers: ["m", "u", "h"] },
];

function genAttention(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const set = pickOne(rng, CONFUSABLE_SETS);
  const [rows, cols] = difficulty === 1 ? [4, 8] : difficulty === 2 ? [5, 10] : [6, 12];
  const cells = rows * cols;
  const targetCount = int(rng, Math.floor(cells * 0.15), Math.floor(cells * 0.3));

  const flat: string[] = [];
  for (let i = 0; i < cells; i += 1) {
    flat.push(i < targetCount ? set.target : pickOne(rng, set.fillers));
  }
  const mixed = seededShuffle(flat, seed + 1);
  const gridLines: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    gridLines.push(mixed.slice(r * cols, (r + 1) * cols).join(" "));
  }

  const correct = String(targetCount);
  const distractors = [String(targetCount + 1), String(targetCount - 1), String(targetCount + 2)];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.attention.${seed}`,
    family: "attention",
    difficulty,
    prompt: `Combien de fois le caractère « ${set.target} » apparaît-il dans la grille ?`,
    gridLines,
    choices,
    correctIndex,
    method:
      "Balayez ligne par ligne en comptant par paquets — ne revenez jamais en arrière, la relecture crée les doubles comptes.",
    timeLimitSeconds: FAMILY_INFO.attention.timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// orientation (caps et virages)
// ---------------------------------------------------------------------------

function fmtCap(cap: number): string {
  const c = ((cap % 360) + 360) % 360;
  return String(c === 0 ? 360 : c).padStart(3, "0");
}

function genOrientation(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const cap = int(rng, 1, 36) * 10;
  let prompt: string;
  let correctValue: string;
  let method: string;
  let distractors: string[];

  if (difficulty === 1) {
    const droite = rng() < 0.5;
    const angle = pickOne(rng, [90, 180]);
    const result = droite ? cap + angle : cap - angle;
    prompt = `Vous êtes au cap ${fmtCap(cap)}. Vous virez de ${angle}° à ${droite ? "droite" : "gauche"}. Quel est votre nouveau cap ?`;
    correctValue = fmtCap(result);
    method = `Droite = on ajoute, gauche = on retire — ${fmtCap(cap)} ${droite ? "+" : "−"} ${angle}, modulo 360.`;
    distractors = [
      fmtCap(droite ? cap - angle : cap + angle),
      fmtCap(result + 10),
      fmtCap(result - 10),
    ];
  } else if (difficulty === 2) {
    const droite = rng() < 0.5;
    const angle = pickOne(rng, [40, 70, 110, 140, 160]);
    const result = droite ? cap + angle : cap - angle;
    prompt = `Cap actuel ${fmtCap(cap)} — virage de ${angle}° par la ${droite ? "droite" : "gauche"}. Nouveau cap ?`;
    correctValue = fmtCap(result);
    method = `${fmtCap(cap)} ${droite ? "+" : "−"} ${angle} = ${fmtCap(result)} — pensez au passage du nord (au-delà de 360, retranchez 360 ; en dessous de 0, ajoutez 360).`;
    distractors = [
      fmtCap(droite ? cap - angle : cap + angle),
      fmtCap(result + 20),
      fmtCap(result + 180),
    ];
  } else {
    if (rng() < 0.5) {
      prompt = `Quel est le cap réciproque (opposé) du cap ${fmtCap(cap)} ?`;
      correctValue = fmtCap(cap + 180);
      method = `Réciproque = ±180. Astuce sans dépasser 360 — ajoutez 200 puis retirez 20 (ou l'inverse).`;
      distractors = [fmtCap(cap + 90), fmtCap(cap - 90), fmtCap(cap + 160)];
    } else {
      const target = ((cap + pickOne(rng, [140, 150, 200, 220])) % 360) + (0 as number);
      const diff = ((target - cap + 540) % 360) - 180;
      const side = diff >= 0 ? "droite" : "gauche";
      prompt = `Du cap ${fmtCap(cap)} vers le cap ${fmtCap(target)} — de quel côté vire-t-on au plus court ?`;
      correctValue = `Par la ${side} (${Math.abs(diff)}°)`;
      method =
        "Calculez l'écart signé — (cible − actuel) ramené entre −180 et +180 : positif = droite, négatif = gauche.";
      distractors = [
        `Par la ${side === "droite" ? "gauche" : "droite"} (${Math.abs(diff)}°)`,
        `Par la ${side} (${360 - Math.abs(diff)}°)`,
        `Par la ${side === "droite" ? "gauche" : "droite"} (${360 - Math.abs(diff)}°)`,
      ];
    }
  }

  const { choices, correctIndex } = buildChoices(rng, seed + 7, correctValue, distractors);
  return {
    id: `psy.orientation.${seed}`,
    family: "orientation",
    difficulty,
    prompt,
    choices,
    correctIndex,
    method,
    timeLimitSeconds: FAMILY_INFO.orientation.timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// rapidite (comparaison de chaînes)
// ---------------------------------------------------------------------------

const CALLSIGN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function genRapidite(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const length = difficulty === 1 ? 6 : difficulty === 2 ? 9 : 12;
  const chars: string[] = [];
  for (let i = 0; i < length; i += 1) {
    chars.push(CALLSIGN_CHARS[int(rng, 0, CALLSIGN_CHARS.length - 1)]);
  }
  const original = `F-${chars.join("")}`;

  const identiques = rng() < 0.5;
  let variant = original;
  if (!identiques) {
    // Substitution par un caractère visuellement proche, au milieu.
    const pairs: Record<string, string> = {
      O: "0",
      "0": "O",
      "1": "L",
      L: "1",
      B: "8",
      "8": "B",
      S: "5",
      "5": "S",
      Z: "2",
      "2": "Z",
    };
    const idx = int(rng, 2, original.length - 2);
    const original_char = original[idx];
    const replacement =
      pairs[original_char] ??
      CALLSIGN_CHARS[(CALLSIGN_CHARS.indexOf(original_char) + 1) % CALLSIGN_CHARS.length];
    variant = original.slice(0, idx) + replacement + original.slice(idx + 1);
  }

  const correct = identiques ? "Identiques" : "Différentes";
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, [
    identiques ? "Différentes" : "Identiques",
    "Impossible à déterminer",
    "Les deux sont vides",
  ]);
  return {
    id: `psy.rapidite.${seed}`,
    family: "rapidite",
    difficulty,
    prompt: `Ces deux chaînes sont-elles identiques ?\n${original}\n${variant}`,
    choices,
    correctIndex,
    method:
      "Comparez par tranches de 3 caractères — les substitutions pièges (O/0, B/8, S/5) se logent au milieu, jamais aux extrémités.",
    timeLimitSeconds: FAMILY_INFO.rapidite.timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// dominos (progressions sur les deux moitiés, arithmétique modulo 7)
// ---------------------------------------------------------------------------

/** Valeur de moitié de domino ramenée dans [0 ; 6] (le blanc vaut 0). */
function half(value: number): number {
  return ((value % 7) + 7) % 7;
}

function domino(top: number, bottom: number): string {
  return `[${half(top)}|${half(bottom)}]`;
}

function genDominos(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const t0 = int(rng, 0, 6);
  const b0 = int(rng, 0, 6);
  let terms: string[];
  let nextTop: number;
  let nextBottom: number;
  let method: string;

  if (difficulty === 1) {
    const st = pickOne(rng, [1, 2]);
    const sb = pickOne(rng, [1, 2]);
    terms = [0, 1, 2].map((i) => domino(t0 + i * st, b0 + i * sb));
    nextTop = t0 + 3 * st;
    nextBottom = b0 + 3 * sb;
    method = `Chaque moitié suit sa propre progression — le haut avance de ${st}, le bas de ${sb} (le blanc suit le 6).`;
  } else if (difficulty === 2) {
    const st = pickOne(rng, [1, 2, 3]);
    const sb = pickOne(rng, [-1, -2, -3]);
    terms = [0, 1, 2, 3].map((i) => domino(t0 + i * st, b0 + i * sb));
    nextTop = t0 + 4 * st;
    nextBottom = b0 + 4 * sb;
    method = `Le haut monte de ${st}, le bas descend de ${Math.abs(sb)} — au-delà de 6 on repart à 0, en dessous de 0 on repart à 6.`;
  } else {
    // Haut entrelacé (+a puis +b en alternance), bas à pas constant.
    const a = pickOne(rng, [1, 2]);
    const b = pickOne(rng, [3, 4]);
    const sb = pickOne(rng, [1, 2]);
    const tops = [t0, t0 + a, t0 + a + b, t0 + 2 * a + b];
    terms = tops.map((t, i) => domino(t, b0 + i * sb));
    nextTop = t0 + 2 * a + 2 * b;
    nextBottom = b0 + 4 * sb;
    method = `Deux règles à mener de front — le haut alterne +${a} puis +${b}, pendant que le bas avance de ${sb}.`;
  }

  const correct = domino(nextTop, nextBottom);
  const distractors = [
    domino(nextBottom, nextTop),
    domino(nextTop + 1, nextBottom),
    domino(nextTop, nextBottom - 1),
  ];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.dominos.${seed}`,
    family: "dominos",
    difficulty,
    prompt: `${terms.join("  ")}  [ ? ] — quel domino complète la série ?`,
    choices,
    correctIndex,
    method,
    timeLimitSeconds: FAMILY_INFO.dominos.timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// rotation-mentale (rotation de flèches, 8 directions)
// ---------------------------------------------------------------------------

/** Huit directions dans le sens horaire — un cran = 45°. */
const DIRS8 = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

function rotateArrows(pattern: string, steps: number): string {
  return [...pattern]
    .map((ch) => {
      const index = DIRS8.indexOf(ch);
      return index === -1 ? ch : DIRS8[(index + steps + 8) % 8];
    })
    .join("");
}

function genRotation(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const length = difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3;
  const pattern = Array.from({ length }, () => pickOne(rng, DIRS8)).join("");
  // 90° droite = +2 crans ; 180° = +4 ; 90° gauche (270° droite) = +6.
  const rotations =
    difficulty === 1
      ? [
          { label: "90° vers la droite", steps: 2 },
          { label: "180°", steps: 4 },
        ]
      : [
          { label: "90° vers la droite", steps: 2 },
          { label: "180°", steps: 4 },
          { label: "90° vers la gauche", steps: 6 },
        ];
  const rotation = pickOne(rng, rotations);
  const correct = rotateArrows(pattern, rotation.steps);
  const distractors = [
    rotateArrows(pattern, (rotation.steps + 4) % 8),
    rotateArrows(pattern, (rotation.steps + 2) % 8),
    pattern,
  ];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.rotation.${seed}`,
    family: "rotation-mentale",
    difficulty,
    prompt: `Motif : ${pattern} — après une rotation de ${rotation.label}, qu'obtient-on ?`,
    choices,
    correctIndex,
    method:
      "Faites tourner CHAQUE flèche du même angle : un quart de tour à droite = deux crans dans le sens horaire (↑→→→↓→←→↑). Tournez toujours dans le bon sens.",
    timeLimitSeconds: FAMILY_INFO["rotation-mentale"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// double-tache (attention partagée : retenir un indice, calculer sur un autre)
// ---------------------------------------------------------------------------

// Y volontairement exclu (ambigu) : la consigne reste sans équivoque.
const VOWELS = "AEIOU";

function genDoubleTache(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const letter = ALPHABET[int(rng, 0, 25)];
  const cap = int(rng, 1, 36) * 10;
  const isVowel = VOWELS.includes(letter);
  const angle = difficulty === 1 ? 90 : pickOne(rng, [30, 40, 60, 110, 150]);

  // Règle : voyelle → cap réciproque ; consonne → cap + angle.
  const branchVowel = fmtCap(cap + 180);
  const branchConsonant = fmtCap(cap + angle);
  const correctValue = isVowel ? branchVowel : branchConsonant;
  const other = isVowel ? branchConsonant : branchVowel;

  const distractors = [other, fmtCap(cap - angle), fmtCap(cap + 180 + 10)];
  const { choices, correctIndex } = buildChoices(rng, seed + 7, correctValue, distractors);
  return {
    id: `psy.double.${seed}`,
    family: "double-tache",
    difficulty,
    prompt: `Indicatif « ${letter} », cap ${fmtCap(cap)}.\nSi la lettre est une VOYELLE, répondez le cap réciproque ; sinon, le cap + ${angle}°.`,
    choices,
    correctIndex,
    method:
      "Deux tâches à tenir ensemble : identifiez d'abord la nature de la lettre (voyelle/consonne), gardez-la en tête, puis appliquez le bon calcul de cap — ne lâchez jamais le premier indice.",
    timeLimitSeconds: FAMILY_INFO["double-tache"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// dissociation-attention (surveiller 4-5 cadrans, chacun avec sa propre règle)
// ---------------------------------------------------------------------------

type PanelRule =
  | { kind: "min"; limit: number }
  | { kind: "max"; limit: number }
  | { kind: "band"; lo: number; hi: number };

interface PanelSpec {
  label: string;
  unit: string;
  rule: PanelRule;
  /** Plage physique affichable [min, max] — bornes multiples de `step`. */
  span: [number, number];
  step: number;
}

/** Catalogue d'instruments — plages linéaires (pas de cap cyclique ici). */
const PANEL_INSTRUMENTS: PanelSpec[] = [
  {
    label: "ALTITUDE",
    unit: "ft",
    rule: { kind: "max", limit: 2500 },
    span: [1600, 3200],
    step: 50,
  },
  { label: "VITESSE", unit: "kt", rule: { kind: "min", limit: 180 }, span: [140, 260], step: 5 },
  { label: "CARBURANT", unit: "%", rule: { kind: "min", limit: 25 }, span: [8, 60], step: 1 },
  { label: "RÉGIME", unit: "%", rule: { kind: "band", lo: 85, hi: 100 }, span: [72, 108], step: 1 },
  { label: "T° HUILE", unit: "°C", rule: { kind: "max", limit: 110 }, span: [80, 132], step: 1 },
  { label: "PRESSION", unit: "psi", rule: { kind: "min", limit: 30 }, span: [18, 55], step: 1 },
];

function panelRuleLabel(rule: PanelRule): string {
  if (rule.kind === "min") return `min ${rule.limit}`;
  if (rule.kind === "max") return `max ${rule.limit}`;
  return `${rule.lo}–${rule.hi}`;
}

/** Valeur (sur la grille du pas) DANS ou HORS de la tolérance de l'instrument. */
function panelReading(rng: Rng, spec: PanelSpec, out: boolean): number {
  const { step, rule } = spec;
  const toGrid = (x: number) => Math.round(x / step);
  const loG = toGrid(spec.span[0]);
  const hiG = toGrid(spec.span[1]);
  let vg: number;
  if (rule.kind === "min") {
    const L = toGrid(rule.limit);
    vg = out ? int(rng, loG, L - 1) : int(rng, L, hiG);
  } else if (rule.kind === "max") {
    const L = toGrid(rule.limit);
    vg = out ? int(rng, L + 1, hiG) : int(rng, loG, L);
  } else {
    const lo = toGrid(rule.lo);
    const hi = toGrid(rule.hi);
    if (out) {
      vg = rng() < 0.5 && lo - 1 >= loG ? int(rng, loG, lo - 1) : int(rng, hi + 1, hiG);
    } else {
      vg = int(rng, lo, hi);
    }
  }
  return vg * step;
}

/** 4 choix numériques uniques autour de `correct`, bornés à [0, maxCount]. */
function buildCountChoices(
  seed: number,
  correct: number,
  maxCount: number
): { choices: string[]; correctIndex: number } {
  const values = new Set<number>([correct]);
  for (const d of [1, -1, 2, -2, 3, -3]) {
    if (values.size >= 4) break;
    const v = correct + d;
    if (v >= 0 && v <= maxCount) values.add(v);
  }
  for (let v = 0; values.size < 4 && v <= maxCount; v += 1) {
    values.add(v);
  }
  const choices = seededShuffle([...values].slice(0, 4).map(String), seed);
  return { choices, correctIndex: choices.indexOf(String(correct)) };
}

function genDissociation(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const count = difficulty === 1 ? 4 : 5;
  const chosen = seededShuffle(PANEL_INSTRUMENTS, seed).slice(0, count);

  const nbOut = difficulty === 1 ? int(rng, 0, 2) : difficulty === 2 ? int(rng, 1, 3) : 1;
  const outOrder = seededShuffle(
    chosen.map((_, i) => i),
    seed + 5
  );
  const outFlags = chosen.map((_, i) => outOrder.indexOf(i) < nbOut);

  const gridLines = chosen.map((spec, i) => {
    const value = panelReading(rng, spec, outFlags[i]);
    const reading = `${value} ${spec.unit}`;
    return `${spec.label.padEnd(10)} ${reading.padStart(9)}   (${panelRuleLabel(spec.rule)})`;
  });

  const method =
    "Balayez chaque cadran avec SA propre règle — min, max ou plage : un critère uniforme ne suffit pas. Vérifiez-les tous avant de valider, l'attention se perd si l'on s'arrête au premier écart.";
  const timeLimitSeconds = FAMILY_INFO["dissociation-attention"].timeLimits[difficulty - 1];

  if (difficulty === 3) {
    const outLabel = chosen[outOrder[0]].label;
    const distractors = seededShuffle(
      chosen.filter((s) => s.label !== outLabel).map((s) => s.label),
      seed + 9
    ).slice(0, 3);
    const { choices, correctIndex } = buildChoices(rng, seed + 7, outLabel, distractors);
    return {
      id: `psy.dissociation.${seed}`,
      family: "dissociation-attention",
      difficulty,
      prompt: "Un seul paramètre est sorti de sa limite. Lequel ?",
      gridLines,
      choices,
      correctIndex,
      method,
      timeLimitSeconds,
    };
  }

  const { choices, correctIndex } = buildCountChoices(seed + 7, nbOut, count);
  return {
    id: `psy.dissociation.${seed}`,
    family: "dissociation-attention",
    difficulty,
    prompt: "Combien de paramètres sont HORS de leur limite ?",
    gridLines,
    choices,
    correctIndex,
    method,
    timeLimitSeconds,
  };
}

// ---------------------------------------------------------------------------
// lecture-instruments (lire un cadran de vol — compas, anémomètre, altimètre)
// ---------------------------------------------------------------------------

function genInstruments(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  let instrument: PsyInstrument;
  let correct: string;
  let distractors: string[];
  let prompt: string;
  let method: string;

  if (difficulty === 1) {
    // Compas : lire le cap au sommet du cadran.
    const cap = int(rng, 0, 35) * 10;
    instrument = { kind: "cap", value: cap };
    correct = `${fmtCap(cap)}°`;
    prompt = "Quel cap indique le compas ?";
    method =
      "Le cap se lit au repère fixe, en haut du cadran. N = 360/000, E = 090, S = 180, W = 270 ; les chiffres valent des dizaines de degrés (3 = 030, 12 = 120).";
    distractors = [`${fmtCap(cap + 180)}°`, `${fmtCap(cap + 30)}°`, `${fmtCap(cap - 20)}°`];
  } else if (difficulty === 2) {
    // Anémomètre : lire la vitesse indiquée.
    const speed = int(rng, 6, 32) * 10;
    instrument = { kind: "anemometre", value: speed };
    correct = `${speed} kt`;
    prompt = "Quelle vitesse indique l'anémomètre ?";
    method =
      "L'aiguille pointe la vitesse indiquée. Repérez d'abord la graduation majeure la plus proche (tous les 40 kt), puis comptez les petites graduations (20 kt) jusqu'à l'aiguille.";
    distractors = [`${speed + 20} kt`, `${speed - 20} kt`, `${speed + 40} kt`];
  } else {
    // Altimètre à deux aiguilles : grande = centaines, petite = milliers.
    const value = int(rng, 2, 98) * 100;
    instrument = { kind: "altimetre", value };
    correct = `${value} ft`;
    prompt = "Quelle altitude indique l'altimètre (deux aiguilles) ?";
    method =
      "Petite aiguille = milliers de pieds, grande aiguille = centaines. Lisez d'abord la petite (le millier atteint), puis la grande pour les centaines — l'erreur classique est d'inverser les deux.";
    // Distracteur-piège : inversion milliers/centaines.
    const thousands = Math.floor(value / 1000);
    const hundreds = Math.floor((value % 1000) / 100);
    const swapped = hundreds * 1000 + thousands * 100;
    distractors = [`${swapped} ft`, `${value + 1000} ft`, `${Math.max(0, value - 100)} ft`];
  }

  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.instruments.${seed}`,
    family: "lecture-instruments",
    difficulty,
    prompt,
    instrument,
    choices,
    correctIndex,
    method,
    timeLimitSeconds: FAMILY_INFO["lecture-instruments"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// memoire-associative (mémoriser des paires indicatif → nombre, puis restituer)
// ---------------------------------------------------------------------------

const CALLSIGNS = [
  "ALPHA",
  "BRAVO",
  "CHARLIE",
  "DELTA",
  "ECHO",
  "FOXTROT",
  "GOLF",
  "HOTEL",
  "INDIA",
  "JULIETT",
  "KILO",
  "LIMA",
  "MIKE",
  "NOVEMBER",
  "OSCAR",
  "PAPA",
  "QUEBEC",
  "ROMEO",
  "SIERRA",
  "TANGO",
];

function genAssociative(seed: number, difficulty: 1 | 2 | 3): PsyQuestion {
  const rng = createRng(seed);
  const count = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  const seconds = difficulty === 3 ? 4 : 5;

  const words = seededShuffle(CALLSIGNS, seed).slice(0, count);
  const nums: number[] = [];
  while (nums.length < count) {
    const n = int(rng, 10, 99);
    if (!nums.includes(n)) nums.push(n);
  }
  const pairs = words.map((word, i) => ({ word, num: nums[i] }));
  const exposure = { lines: pairs.map((p) => `${p.word}   →   ${p.num}`), seconds };

  const target = pairs[int(rng, 0, count - 1)];
  let prompt: string;
  let correct: string;
  let distractors: string[];

  if (difficulty === 3) {
    // Sens inverse : nombre → indicatif (mémorisation bidirectionnelle).
    prompt = `Quel indicatif était associé au nombre ${target.num} ?`;
    correct = target.word;
    distractors = seededShuffle(
      words.filter((w) => w !== target.word),
      seed + 3
    ).slice(0, 3);
  } else {
    // Sens direct : indicatif → nombre.
    prompt = `Quel nombre était associé à « ${target.word} » ?`;
    correct = String(target.num);
    distractors = seededShuffle(nums.filter((n) => n !== target.num).map(String), seed + 3).slice(
      0,
      3
    );
    // Complète avec des nombres inédits si moins de 3 distracteurs (niveau 1).
    while (distractors.length < 3) {
      let n = int(rng, 10, 99);
      while (nums.includes(n) || distractors.includes(String(n))) {
        n = int(rng, 10, 99);
      }
      distractors.push(String(n));
    }
  }

  const { choices, correctIndex } = buildChoices(rng, seed + 7, correct, distractors);
  return {
    id: `psy.associative.${seed}`,
    family: "memoire-associative",
    difficulty,
    exposure,
    prompt,
    choices,
    correctIndex,
    method:
      "Reliez chaque paire par une image mentale — un mot et un nombre qui racontent une mini-scène. Au rappel, retrouvez l'image pour restituer l'association, dans un sens comme dans l'autre.",
    timeLimitSeconds: FAMILY_INFO["memoire-associative"].timeLimits[difficulty - 1],
  };
}

// ---------------------------------------------------------------------------
// Point d'entrée
// ---------------------------------------------------------------------------

const GENERATORS: Record<PsyFamily, (seed: number, d: 1 | 2 | 3) => PsyQuestion> = {
  "calcul-mental": genCalcul,
  "suites-numeriques": genSuite,
  "series-logiques": genSerieLogique,
  memoire: genMemoire,
  "empan-chiffres": genEmpan,
  attention: genAttention,
  orientation: genOrientation,
  rapidite: genRapidite,
  dominos: genDominos,
  "rotation-mentale": genRotation,
  "double-tache": genDoubleTache,
  "dissociation-attention": genDissociation,
  "lecture-instruments": genInstruments,
  "memoire-associative": genAssociative,
};

/** Génère une question d'une famille — déterministe par (famille, graine, difficulté). */
export function generateQuestion(
  family: PsyFamily,
  seed: number,
  difficulty: 1 | 2 | 3
): PsyQuestion {
  const question = GENERATORS[family](seed, difficulty);
  // Cas mémoire : l'index correct est recalculé après le mélange des choix.
  if (question.correctIndex === -1 && question.exposure) {
    const position = Number(question.prompt.match(/(\d+)/)?.[1] ?? 1);
    const items = question.exposure.lines[0].split(/\s+/);
    const correct = items[position - 1];
    question.correctIndex = question.choices.indexOf(correct);
  }
  return question;
}
