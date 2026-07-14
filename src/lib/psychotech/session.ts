import { createRng, seededShuffle } from "@/features/quiz/engine";
import { generateQuestion } from "./generators";
import type {
  PsyAnswerEvent,
  PsyFamily,
  PsyFamilyScore,
  PsyQuestion,
  PsySessionConfig,
  PsySessionScore,
} from "./types";

/**
 * Composition et notation d'une session psychotechnique — fonctions pures
 * (docs/editorial/module-psychotechnique.md).
 */

export const SESSION_SIZES = {
  courte: 10,
  standard: 20,
  longue: 40,
} as const;

/**
 * Compose une session : répartition équilibrée entre les familles
 * demandées, ordre mélangé par graine, difficulté PROGRESSIVE (1 sur le
 * premier tiers, 2 sur le deuxième, 3 sur le dernier).
 */
export function composeSession(config: PsySessionConfig): PsyQuestion[] {
  const { families, size, seed } = config;
  if (families.length === 0 || size <= 0) {
    return [];
  }
  const rng = createRng(seed);

  // Attribution des familles : équitable, reliquat réparti par la graine.
  const slots: PsyFamily[] = [];
  const base = Math.floor(size / families.length);
  for (const family of families) {
    for (let i = 0; i < base; i += 1) {
      slots.push(family);
    }
  }
  const extras = seededShuffle(families, seed + 1);
  for (let i = 0; slots.length < size; i += 1) {
    slots.push(extras[i % extras.length]);
  }

  const ordered = seededShuffle(slots, seed + 2);
  return ordered.map((family, index) => {
    const third = index / size;
    const difficulty: 1 | 2 | 3 = third < 1 / 3 ? 1 : third < 2 / 3 ? 2 : 3;
    // Graine distincte par position — deux occurrences d'une même famille
    // dans la même session produisent des questions différentes.
    const questionSeed = Math.floor(rng() * 2147483647) + index;
    return generateQuestion(family, questionSeed, difficulty);
  });
}

/** Score d'une session à partir des événements de réponse. */
export function scoreSession(events: readonly PsyAnswerEvent[]): PsySessionScore {
  const byFamily = new Map<PsyFamily, PsyAnswerEvent[]>();
  for (const event of events) {
    const list = byFamily.get(event.family);
    if (list) {
      list.push(event);
    } else {
      byFamily.set(event.family, [event]);
    }
  }

  const parFamille: PsyFamilyScore[] = [...byFamily.entries()].map(([family, list]) => {
    const answered = list.filter((e) => e.correct !== undefined);
    const correct = answered.filter((e) => e.correct).length;
    const avgMs =
      answered.length > 0
        ? Math.round(answered.reduce((sum, e) => sum + e.elapsedMs, 0) / answered.length)
        : 0;
    return {
      family,
      asked: list.length,
      answered: answered.length,
      correct,
      precision: answered.length > 0 ? correct / answered.length : 0,
      avgMs,
    };
  });

  const asked = events.length;
  const answeredEvents = events.filter((e) => e.correct !== undefined);
  const correct = answeredEvents.filter((e) => e.correct).length;
  const avgMs =
    answeredEvents.length > 0
      ? Math.round(answeredEvents.reduce((sum, e) => sum + e.elapsedMs, 0) / answeredEvents.length)
      : 0;

  return {
    asked,
    answered: answeredEvents.length,
    correct,
    precision: answeredEvents.length > 0 ? correct / answeredEvents.length : 0,
    avgMs,
    parFamille,
    aRetravailler: parFamille
      .filter((f) => f.asked >= 3 && f.answered > 0 && f.precision < 0.6)
      .map((f) => f.family),
  };
}
