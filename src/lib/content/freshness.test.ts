import { describe, expect, it } from "vitest";
import { getReviewIntervalMonths, isReviewOverdue } from "./freshness";

describe("getReviewIntervalMonths", () => {
  it("applique 6 mois à la géopolitique et aux RETEX", () => {
    expect(getReviewIntervalMonths({ type: "geopolitique", category: "geopolitique" })).toBe(6);
    expect(getReviewIntervalMonths({ type: "retex", category: "retex" })).toBe(6);
  });

  it("applique 6 mois aux conditions de concours quel que soit le type", () => {
    expect(getReviewIntervalMonths({ type: "notion-bia", category: "conditions" })).toBe(6);
    expect(getReviewIntervalMonths({ type: "procedure", category: "selection" })).toBe(6);
  });

  it("applique 12 mois aux forces vives (appareils, unités, bases, navires)", () => {
    expect(getReviewIntervalMonths({ type: "appareil", category: "appareils" })).toBe(12);
    expect(getReviewIntervalMonths({ type: "navire", category: "appareils" })).toBe(12);
    expect(getReviewIntervalMonths({ type: "flottille", category: "bases" })).toBe(12);
  });

  it("applique 24 mois par défaut aux notions techniques", () => {
    expect(getReviewIntervalMonths({ type: "notion-meteo", category: "meteorologie" })).toBe(24);
    expect(
      getReviewIntervalMonths({ type: "personnage-historique", category: "culture-militaire" })
    ).toBe(24);
  });

  it("retient toujours la règle la plus courte", () => {
    expect(getReviewIntervalMonths({ type: "appareil", category: "conditions" })).toBe(6);
  });
});

describe("isReviewOverdue", () => {
  const fiche = {
    type: "geopolitique",
    category: "geopolitique",
    verifiedAt: "2026-01-01",
  } as const;

  it("signale une fiche géopolitique vérifiée il y a plus de 6 mois", () => {
    expect(isReviewOverdue(fiche, new Date("2026-07-08"))).toBe(true);
  });

  it("ne signale pas une fiche dans les délais", () => {
    expect(isReviewOverdue(fiche, new Date("2026-06-01"))).toBe(false);
  });
});
