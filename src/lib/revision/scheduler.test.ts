import { describe, expect, it } from "vitest";
import {
  BOX_INTERVAL_DAYS,
  MAX_BOX,
  buildReviewQueue,
  isDueReview,
  nextReview,
  reviewStats,
  type ReviewState,
} from "./scheduler";

const NOW = new Date("2026-07-17T10:00:00.000Z");
const daysLater = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

describe("nextReview", () => {
  it("monte d'une boîte et repousse l'échéance sur une bonne réponse", () => {
    const first = nextReview(undefined, true, NOW);
    expect(first.box).toBe(1);
    expect(new Date(first.dueAt).getTime()).toBe(daysLater(BOX_INTERVAL_DAYS[1]).getTime());

    const second = nextReview(first, true, NOW);
    expect(second.box).toBe(2);
    expect(new Date(second.dueAt).getTime()).toBe(daysLater(BOX_INTERVAL_DAYS[2]).getTime());
  });

  it("plafonne à la boîte maximale", () => {
    const item = nextReview({ box: MAX_BOX, dueAt: NOW.toISOString() }, true, NOW);
    expect(item.box).toBe(MAX_BOX);
  });

  it("renvoie en boîte 1 sur une mauvaise réponse", () => {
    const item = nextReview({ box: 4, dueAt: NOW.toISOString() }, false, NOW);
    expect(item.box).toBe(1);
    expect(new Date(item.dueAt).getTime()).toBe(daysLater(BOX_INTERVAL_DAYS[1]).getTime());
  });
});

describe("isDueReview", () => {
  it("est faux pour une question jamais vue", () => {
    expect(isDueReview(undefined, NOW)).toBe(false);
  });
  it("est vrai quand l'échéance est atteinte", () => {
    expect(isDueReview({ box: 1, dueAt: daysLater(-1).toISOString() }, NOW)).toBe(true);
    expect(isDueReview({ box: 1, dueAt: daysLater(1).toISOString() }, NOW)).toBe(false);
  });
});

describe("buildReviewQueue", () => {
  it("réunit les revues échues puis un nombre borné de nouvelles", () => {
    const state: ReviewState = {
      q1: { box: 1, dueAt: daysLater(-1).toISOString() }, // échue
      q2: { box: 3, dueAt: daysLater(2).toISOString() }, // pas échue
    };
    const queue = buildReviewQueue(["q1", "q2", "q3", "q4", "q5"], state, {
      now: NOW,
      newLimit: 2,
    });
    expect(queue.due).toEqual(["q1"]);
    expect(queue.fresh).toEqual(["q3", "q4"]); // q5 exclue par le plafond
  });
});

describe("reviewStats", () => {
  it("répartit le vivier candidat", () => {
    const state: ReviewState = {
      q1: { box: 1, dueAt: daysLater(-1).toISOString() }, // échue
      q2: { box: 3, dueAt: daysLater(2).toISOString() }, // à jour
      q3: { box: MAX_BOX, dueAt: daysLater(10).toISOString() }, // acquise
    };
    const stats = reviewStats(["q1", "q2", "q3", "q4"], state, NOW);
    expect(stats).toEqual({ neverSeen: 1, dueNow: 1, upcoming: 2, mastered: 1 });
  });
});
