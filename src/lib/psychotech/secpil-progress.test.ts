import { describe, expect, it } from "vitest";

import {
  addSession,
  adviseAfter,
  bestFor,
  buildEntry,
  configKey,
  configLabel,
  deltaVsBest,
  levelMatters,
  modeSummaries,
  nextMode,
  progressionSeries,
  SECPIL_HISTORY_LIMIT,
  SECPIL_MASTERY_SCORE,
  SECPIL_MASTERY_SESSIONS,
  trend,
  type SecpilSessionEntry,
} from "@/lib/psychotech/secpil-progress";
import { SECPIL_MODES, type SecpilMode } from "@/lib/psychotech/secpil";

function entry(mode: SecpilMode, level: number, overall: number, day = 1): SecpilSessionEntry {
  return {
    date: `2026-07-${String(day).padStart(2, "0")}T10:00:00.000Z`,
    mode,
    level,
    manche: overall,
    palonnier: null,
    calcul: null,
    overall,
  };
}

describe("configuration comparable", () => {
  it("ne retient le niveau que si le calcul est actif", () => {
    expect(levelMatters("palonnier")).toBe(false);
    expect(levelMatters("manche")).toBe(false);
    expect(levelMatters("calcul")).toBe(true);
    expect(levelMatters("manche-calcul")).toBe(true);
    expect(levelMatters("tout")).toBe(true);
  });

  it("ignore le niveau là où il ne change rien", () => {
    expect(configKey("manche", 1)).toBe(configKey("manche", 5));
    expect(configLabel("manche", 3)).toBe("Le « 8 » seul");
  });

  it("sépare les niveaux là où ils changent quelque chose", () => {
    expect(configKey("tout", 1)).not.toBe(configKey("tout", 2));
    expect(configLabel("tout", 4)).toBe("Tout ensemble · niveau 4");
  });

  it("ne compare jamais deux modes différents", () => {
    expect(configKey("manche", 1)).not.toBe(configKey("palonnier", 1));
  });
});

describe("historique", () => {
  it("empile la plus récente en tête", () => {
    const h = addSession(addSession([], entry("tout", 1, 50)), entry("tout", 1, 60));
    expect(h.map((e) => e.overall)).toEqual([60, 50]);
  });

  it("borne l'historique sans muter l'entrée d'origine", () => {
    const base = Array.from({ length: SECPIL_HISTORY_LIMIT }, () => entry("tout", 1, 10));
    const h = addSession(base, entry("tout", 1, 99));
    expect(h).toHaveLength(SECPIL_HISTORY_LIMIT);
    expect(h[0].overall).toBe(99);
    expect(base).toHaveLength(SECPIL_HISTORY_LIMIT);
  });

  it("construit une entrée à partir d'un score de session", () => {
    const e = buildEntry(
      "tout",
      3,
      { manche: 70, palonnier: 80, calcul: 90 },
      new Date("2026-07-26T12:00:00.000Z")
    );
    expect(e.overall).toBe(80);
    expect(e.level).toBe(3);
    expect(e.date).toBe("2026-07-26T12:00:00.000Z");
  });
});

describe("comparaison à la même configuration", () => {
  const history = [
    entry("tout", 1, 70),
    entry("tout", 2, 90),
    entry("manche", 1, 55),
    entry("manche", 5, 65),
  ];

  it("ne prend le meilleur que dans la configuration jouée", () => {
    expect(bestFor(history, "tout", 1)).toBe(70);
    expect(bestFor(history, "tout", 2)).toBe(90);
  });

  it("regroupe les niveaux sans objet sur un même mode", () => {
    expect(bestFor(history, "manche", 1)).toBe(65);
  });

  it("renvoie null pour une configuration jamais jouée", () => {
    expect(bestFor(history, "palonnier", 1)).toBeNull();
  });

  it("ne compare rien lors de la première session", () => {
    expect(deltaVsBest([], entry("tout", 1, 78))).toBeNull();
  });

  it("mesure l'écart au meilleur score antérieur, signe compris", () => {
    expect(deltaVsBest(history, entry("tout", 1, 76))).toBe(6);
    expect(deltaVsBest(history, entry("tout", 1, 64))).toBe(-6);
  });
});

describe("courbe de progression", () => {
  it("va du plus ancien au plus récent", () => {
    const history = [entry("tout", 1, 80), entry("tout", 1, 70), entry("tout", 1, 60)];
    expect(progressionSeries(history, "tout", 1)).toEqual([60, 70, 80]);
  });

  it("se limite au nombre de points demandé, les plus récents", () => {
    const history = Array.from({ length: 20 }, (_, i) => entry("tout", 1, i));
    expect(progressionSeries(history, "tout", 1, 3)).toEqual([2, 1, 0]);
  });

  it("écarte les sessions d'une autre configuration", () => {
    const history = [entry("tout", 1, 80), entry("tout", 2, 10), entry("manche", 1, 20)];
    expect(progressionSeries(history, "tout", 1)).toEqual([80]);
  });

  it("ne prononce pas de tendance sans recul suffisant", () => {
    expect(trend([10, 90, 10])).toBeNull();
  });

  it("compare la seconde moitié à la première", () => {
    expect(trend([50, 50, 60, 60])).toBe(10);
    expect(trend([60, 60, 50, 50])).toBe(-10);
  });
});

describe("synthèse par mode", () => {
  it("liste tous les modes, y compris ceux jamais joués", () => {
    const rows = modeSummaries([entry("manche", 1, 70)]);
    expect(rows).toHaveLength(SECPIL_MODES.length);
    expect(rows.map((r) => r.mode)).toEqual(SECPIL_MODES.map((m) => m.mode));
    const jamais = rows.find((r) => r.mode === "tout");
    expect(jamais?.sessions).toBe(0);
    expect(jamais?.best).toBeNull();
    expect(jamais?.lastDate).toBeNull();
  });

  it("agrège les niveaux d'un même mode et retient la dernière date", () => {
    const rows = modeSummaries([entry("tout", 1, 60, 3), entry("tout", 2, 85, 9)]);
    const tout = rows.find((r) => r.mode === "tout");
    expect(tout?.sessions).toBe(2);
    expect(tout?.best).toBe(85);
    expect(tout?.lastDate).toBe("2026-07-09T10:00:00.000Z");
  });

  it("ne déclare un mode acquis qu'au bout d'assez de bonnes sessions", () => {
    const deux = Array.from({ length: 2 }, () => entry("manche", 1, SECPIL_MASTERY_SCORE));
    expect(modeSummaries(deux).find((r) => r.mode === "manche")?.mastered).toBe(false);
    const assez = Array.from({ length: SECPIL_MASTERY_SESSIONS }, () =>
      entry("manche", 1, SECPIL_MASTERY_SCORE)
    );
    expect(modeSummaries(assez).find((r) => r.mode === "manche")?.mastered).toBe(true);
  });
});

describe("conseil de progression", () => {
  it("suit l'ordre déclaré des modes", () => {
    expect(nextMode("palonnier")).toBe("manche");
    expect(nextMode("tout")).toBeNull();
  });

  it("ne conseille rien tant qu'on manque de recul", () => {
    const h = [entry("manche", 1, 95), entry("manche", 1, 95)];
    expect(adviseAfter(h, "manche", 1).kind).toBe("keep-going");
  });

  it("invite à consolider quand les scores restent sous le repère", () => {
    const h = Array.from({ length: 4 }, () => entry("manche", 1, SECPIL_MASTERY_SCORE - 1));
    expect(adviseAfter(h, "manche", 1).kind).toBe("consolidate");
  });

  it("propose le mode suivant une fois le repère tenu", () => {
    const h = Array.from({ length: SECPIL_MASTERY_SESSIONS }, () =>
      entry("manche", 1, SECPIL_MASTERY_SCORE)
    );
    const advice = adviseAfter(h, "manche", 1);
    expect(advice.kind).toBe("step-up");
    expect(advice.suggested).toBe("calcul");
  });

  it("n'envoie nulle part au-delà du dernier mode", () => {
    const h = Array.from({ length: SECPIL_MASTERY_SESSIONS }, () => entry("tout", 5, 90));
    expect(adviseAfter(h, "tout", 5).kind).toBe("max-level");
  });

  it("ne mélange pas les configurations pour conseiller", () => {
    const h = Array.from({ length: 5 }, () => entry("tout", 1, 95));
    expect(adviseAfter(h, "tout", 2).kind).toBe("keep-going");
  });
});
