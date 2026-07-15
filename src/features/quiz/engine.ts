import type { ExamEpreuve, Question, QuizSelector } from "@/lib/content/content-schemas";
import { normalizeText } from "@/features/search/normalize";

/**
 * Moteur pédagogique — fonctions pures (docs/editorial/moteur-pedagogique.md).
 * Sélection sur la banque, mélange DÉTERMINISTE par graine (rejouable,
 * testable), scoring par format, barème d'examen. Aucune dépendance UI.
 */

// ---------------------------------------------------------------------------
// Aléa déterministe
// ---------------------------------------------------------------------------

/** PRNG mulberry32 : rapide, reproductible, suffisant pour du mélange. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates par graine — même graine, même ordre. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = createRng(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Sélection sur la banque
// ---------------------------------------------------------------------------

/** Historique minimal par question (pondération du tirage). */
export interface QuestionHistory {
  lastAnsweredAt?: string;
}

interface SelectInput {
  selector: Pick<QuizSelector, "themes" | "tags" | "concours" | "difficulty" | "count">;
  seed: number;
  /** Question → familles des fiches évaluées (fourni par l'appelant). */
  familiesOf?: (question: Question) => string[];
  families?: string[];
  history?: Map<string, QuestionHistory>;
}

export function filterQuestions(
  bank: Question[],
  input: Omit<SelectInput, "seed" | "history">
): Question[] {
  const { selector, families, familiesOf } = input;
  return bank.filter((question) => {
    if (selector.themes && !selector.themes.includes(question.theme)) {
      return false;
    }
    if (selector.tags && !selector.tags.some((tag) => question.tags.includes(tag))) {
      return false;
    }
    if (
      selector.concours &&
      !selector.concours.some((concours) => question.concours.includes(concours))
    ) {
      return false;
    }
    if (selector.difficulty) {
      const [min, max] = selector.difficulty;
      if (question.difficulty < min || question.difficulty > max) {
        return false;
      }
    }
    if (families && familiesOf && !familiesOf(question).some((f) => families.includes(f))) {
      return false;
    }
    return true;
  });
}

/**
 * Tirage pondéré déterministe : les questions jamais vues passent avant
 * les anciennes, qui passent avant les récentes — puis mélange par graine
 * à l'intérieur de chaque groupe.
 */
export function selectQuestions(bank: Question[], input: SelectInput): Question[] {
  const filtered = filterQuestions(bank, input);
  const { history, seed } = input;

  const unseen: Question[] = [];
  const seen: { question: Question; lastAnsweredAt: string }[] = [];
  for (const question of filtered) {
    const entry = history?.get(question.id);
    if (entry?.lastAnsweredAt) {
      seen.push({ question, lastAnsweredAt: entry.lastAnsweredAt });
    } else {
      unseen.push(question);
    }
  }
  seen.sort((a, b) => a.lastAnsweredAt.localeCompare(b.lastAnsweredAt));

  const ordered = [...seededShuffle(unseen, seed), ...seen.map((s) => s.question)];
  return ordered.slice(0, input.selector.count);
}

// ---------------------------------------------------------------------------
// Scoring par format
// ---------------------------------------------------------------------------

export type AnswerInput =
  | { kind: "qcm"; choices: number[] }
  | { kind: "vrai-faux"; answer: boolean }
  | { kind: "association"; pairs: [number, number][] }
  | { kind: "legende-schema"; labels: Record<string, string> }
  | { kind: "calcul"; value: number }
  | { kind: "ordre"; order: number[] }
  | { kind: "texte-a-trous"; values: string[] };

/** Une réponse est correcte ou ne l'est pas — jamais de demi-point caché. */
export function isCorrect(question: Question, answer: AnswerInput): boolean {
  if (question.kind !== answer.kind) {
    return false;
  }
  switch (question.kind) {
    case "qcm": {
      const given = answer.kind === "qcm" ? answer.choices : [];
      const expected = new Set(question.correctChoices);
      return given.length === expected.size && given.every((choice) => expected.has(choice));
    }
    case "vrai-faux":
      return answer.kind === "vrai-faux" && answer.answer === question.answer;
    case "association": {
      if (answer.kind !== "association" || answer.pairs.length !== question.pairs.length) {
        return false;
      }
      return answer.pairs.every(([left, right]) => left === right);
    }
    case "legende-schema": {
      if (answer.kind !== "legende-schema") {
        return false;
      }
      return question.zones.every(
        (zone) => normalizeText(answer.labels[zone.zoneId] ?? "") === normalizeText(zone.label)
      );
    }
    case "calcul":
      return (
        answer.kind === "calcul" &&
        Math.abs(answer.value - question.answerValue) <= question.tolerance
      );
    case "ordre":
      return (
        answer.kind === "ordre" &&
        answer.order.length === question.items.length &&
        answer.order.every((position, index) => position === index)
      );
    case "texte-a-trous": {
      if (answer.kind !== "texte-a-trous" || answer.values.length !== question.gaps.length) {
        return false;
      }
      return question.gaps.every((gap, index) =>
        gap.accepted.some(
          (accepted) => normalizeText(accepted) === normalizeText(answer.values[index] ?? "")
        )
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Barème d'examen
// ---------------------------------------------------------------------------

export interface EpreuveResult {
  correct: number;
  incorrect: number;
  /** Questions laissées sans réponse (jamais pénalisées). */
  skipped: number;
}

/** Points d'une épreuve : bonnes × points − fausses × pénalité, plancher 0. */
export function scoreEpreuve(result: EpreuveResult, bareme: ExamEpreuve["bareme"]): number {
  const raw = result.correct * bareme.pointsParBonne - result.incorrect * bareme.penaliteParFausse;
  return Math.max(0, Math.round(raw * 100) / 100);
}
