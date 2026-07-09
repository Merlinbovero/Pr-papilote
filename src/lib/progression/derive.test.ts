import { describe, expect, it } from "vitest";
import { DEFAULT_MASTERY_CONFIG } from "./config";
import {
  journey,
  overallStats,
  recommendations,
  strengthsAndWeaknesses,
  themeMastery,
  weeklyTrend,
  type AttemptRecord,
  type StudySessionRecord,
} from "./derive";

function attempt(over: Partial<AttemptRecord>): AttemptRecord {
  return {
    questionId: "q.x.0001",
    theme: "meteorologie",
    moduleSlug: "fondamentaux",
    isCorrect: true,
    answeredAt: "2026-07-01T10:00:00.000Z",
    ...over,
  };
}

describe("overallStats", () => {
  it("calcule le taux de réussite et le temps moyen", () => {
    const stats = overallStats([
      attempt({ isCorrect: true, durationMs: 4000 }),
      attempt({ isCorrect: false, durationMs: 6000 }),
    ]);
    expect(stats.answered).toBe(2);
    expect(stats.correctRate).toBe(50);
    expect(stats.avgTimeMs).toBe(5000);
  });

  it("filtre par module", () => {
    const stats = overallStats(
      [attempt({ moduleSlug: "eopan" }), attempt({ moduleSlug: "eopn" })],
      "eopan"
    );
    expect(stats.answered).toBe(1);
  });

  it("reste sûr sans données", () => {
    expect(overallStats([]).correctRate).toBe(0);
  });
});

describe("themeMastery — seuils configurables", () => {
  const many = (theme: string, correct: number, total: number): AttemptRecord[] =>
    Array.from({ length: total }, (_, i) =>
      attempt({
        theme,
        isCorrect: i < correct,
        answeredAt: `2026-07-${String(i + 1).padStart(2, "0")}T10:00:00.000Z`,
      })
    );

  it("classe « à revoir » sous 60 %", () => {
    const mastery = themeMastery(many("meteo", 2, 10));
    expect(mastery[0].level).toBe("a-revoir");
  });

  it("classe « maîtrisé » à 80 % et plus", () => {
    const mastery = themeMastery(many("meteo", 9, 10));
    expect(mastery[0].level).toBe("maitrise");
  });

  it("classe « en cours » entre les deux", () => {
    const mastery = themeMastery(many("meteo", 7, 10));
    expect(mastery[0].level).toBe("en-cours");
  });

  it("ne juge jamais un thème sous le minimum de questions", () => {
    const mastery = themeMastery(many("meteo", 0, 3));
    expect(mastery[0].level).toBe("en-cours");
  });

  it("respecte une configuration alternative (jamais codé en dur)", () => {
    const strict = { ...DEFAULT_MASTERY_CONFIG, maitriseMin: 95, minQuestions: 1 };
    expect(themeMastery(many("meteo", 9, 10), strict)[0].level).toBe("en-cours");
  });
});

describe("points forts et faibles", () => {
  it("trie les thèmes du plus faible au plus fort", () => {
    const mastery = [
      { theme: "a", answered: 10, correctRate: 90, level: "maitrise" as const },
      { theme: "b", answered: 10, correctRate: 40, level: "a-revoir" as const },
    ];
    const { strengths, weaknesses } = strengthsAndWeaknesses(mastery, 1);
    expect(weaknesses[0].theme).toBe("b");
    expect(strengths[0].theme).toBe("a");
  });
});

describe("weeklyTrend", () => {
  it("agrège par semaine ISO", () => {
    const trend = weeklyTrend([
      attempt({ answeredAt: "2026-06-01T10:00:00.000Z", isCorrect: true }),
      attempt({ answeredAt: "2026-06-02T10:00:00.000Z", isCorrect: false }),
      attempt({ answeredAt: "2026-06-15T10:00:00.000Z", isCorrect: true }),
    ]);
    expect(trend).toHaveLength(2);
    expect(trend[0].answered).toBe(2);
    expect(trend[0].correctRate).toBe(50);
  });
});

describe("journey — le chemin parcouru", () => {
  const sessions: StudySessionRecord[] = [
    {
      moduleSlug: "eopan",
      startedAt: "2026-01-01T10:00:00.000Z",
      endedAt: "2026-01-01T11:00:00.000Z",
    },
    {
      moduleSlug: "eopan",
      startedAt: "2026-01-08T10:00:00.000Z",
      endedAt: "2026-01-08T11:30:00.000Z",
    },
  ];

  it("cumule les heures investies", () => {
    const j = journey([], sessions);
    expect(j.totalHours).toBe(2.5);
  });

  it("détermine depuis quand la préparation a commencé", () => {
    const j = journey([attempt({ answeredAt: "2025-12-01T10:00:00.000Z" })], sessions);
    expect(j.since).toBe("2025-12-01T10:00:00.000Z");
  });

  it("retient la dernière session", () => {
    expect(journey([], sessions).lastSessionAt).toBe("2026-01-08T11:30:00.000Z");
  });
});

describe("recommandations — règles explicables", () => {
  it("priorise la révision des erreurs dues", () => {
    const recs = recommendations([], 4);
    expect(recs[0].kind).toBe("reviser");
    expect(recs[0].reason).toContain("4");
  });

  it("propose de renforcer les thèmes faibles avec leur motif", () => {
    const recs = recommendations(
      [{ theme: "meteorologie", answered: 10, correctRate: 45, level: "a-revoir" }],
      0
    );
    expect(recs[0].kind).toBe("renforcer");
    expect(recs[0].reason).toContain("45 %");
  });

  it("propose de découvrir les thèmes non travaillés", () => {
    const recs = recommendations([], 0, ["navigation"]);
    expect(recs.some((r) => r.kind === "decouvrir" && r.theme === "navigation")).toBe(true);
  });
});
