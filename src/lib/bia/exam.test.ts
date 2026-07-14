import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/content/content-schemas";
import { resolveBiaMatiere, type BiaConfig, type BiaFicheRef } from "./config";
import { buildBiaPools, composeBiaExam, difficultyBand, gradeBiaExam } from "./exam";

/**
 * Tests du moteur d'examen blanc BIA (docs/editorial/module-bia.md) —
 * projection fiches → matières, composition (volumes, doublons,
 * déterminisme, pénuries honnêtes) et correction au format officiel.
 */

const config: BiaConfig = {
  matieres: [
    {
      slug: "meteo",
      name: "Météorologie",
      order: 1,
      description: "d",
      categories: ["meteorologie"],
    },
    {
      slug: "vol",
      name: "Principes du vol",
      order: 2,
      description: "d",
      categories: ["aerodynamique", "mecanique-du-vol"],
    },
  ],
  epreuveFacultative: {
    slug: "anglais",
    name: "Anglais",
    description: "d",
    categories: ["anglais-aeronautique"],
  },
  ficheOverrides: {
    "fondamentaux.mecanique-du-vol.la-propulsion": "meteo",
  },
  horsParcours: ["fondamentaux.meteorologie.hors-parcours"],
  horsExamen: ["fondamentaux.meteorologie.hors-examen"],
  examen: {
    questionsParMatiere: 4,
    dureeSecondes: 9000,
    seuilAdmission: 10,
    mentions: [
      { label: "Assez bien", min: 12 },
      { label: "Bien", min: 14 },
      { label: "Très bien", min: 16 },
    ],
    repartitionDifficulte: { facile: 0.5, moyen: 0.25, difficile: 0.25 },
  },
};

const fiches: BiaFicheRef[] = [
  { id: "fondamentaux.meteorologie.les-nuages", module: "fondamentaux", category: "meteorologie" },
  { id: "fondamentaux.meteorologie.hors-examen", module: "fondamentaux", category: "meteorologie" },
  {
    id: "fondamentaux.meteorologie.hors-parcours",
    module: "fondamentaux",
    category: "meteorologie",
  },
  { id: "fondamentaux.aerodynamique.portance", module: "fondamentaux", category: "aerodynamique" },
  {
    id: "fondamentaux.mecanique-du-vol.la-propulsion",
    module: "fondamentaux",
    category: "mecanique-du-vol",
  },
  { id: "eopan.appareils.rafale-m", module: "eopan", category: "appareils" },
];

function makeQuestion(id: string, ficheId: string, difficulty: number): Question {
  return {
    schemaVersion: 1,
    id,
    kind: "qcm",
    theme: "test",
    statement: `Énoncé de la question ${id} ?`,
    choices: ["A", "B", "C"],
    correctChoices: [0],
    explanation: "Explication pédagogique suffisamment longue pour le schéma.",
    evaluates: [ficheId],
    tags: [],
    competencies: [],
    concours: ["eopan"],
    difficulty,
    status: "publie",
  } as Question;
}

/** 6 questions météo (2 par bande) + 6 questions vol + parasites. */
function makeBank(): Question[] {
  const bank: Question[] = [];
  const meteoFiche = "fondamentaux.meteorologie.les-nuages";
  const volFiche = "fondamentaux.aerodynamique.portance";
  [1, 1, 2, 2, 3, 3].forEach((difficulty, i) => {
    bank.push(makeQuestion(`q.meteo-${i}`, meteoFiche, difficulty));
    bank.push(makeQuestion(`q.vol-${i}`, volFiche, difficulty));
  });
  bank.push(makeQuestion("q.hors-examen", "fondamentaux.meteorologie.hors-examen", 1));
  bank.push(makeQuestion("q.hors-parcours", "fondamentaux.meteorologie.hors-parcours", 1));
  bank.push(makeQuestion("q.militaire", "eopan.appareils.rafale-m", 1));
  return bank;
}

describe("projection fiche → matière", () => {
  it("suit la catégorie, la surcharge, et exclut le hors-périmètre", () => {
    expect(resolveBiaMatiere(fiches[0], config)).toBe("meteo");
    expect(resolveBiaMatiere(fiches[3], config)).toBe("vol");
    expect(resolveBiaMatiere(fiches[4], config)).toBe("meteo"); // surcharge
    expect(resolveBiaMatiere(fiches[2], config)).toBeUndefined(); // hors parcours
    expect(resolveBiaMatiere(fiches[5], config)).toBeUndefined(); // autre module
  });
});

describe("viviers par matière", () => {
  it("répartit la banque et exclut hors-examen, hors-parcours et hors-module", () => {
    const pools = buildBiaPools(makeBank(), fiches, config);
    expect(pools.byMatiere.get("meteo")).toHaveLength(6);
    expect(pools.byMatiere.get("vol")).toHaveLength(6);
    expect(pools.matiereOfQuestion.has("q.hors-examen")).toBe(false);
    expect(pools.matiereOfQuestion.has("q.hors-parcours")).toBe(false);
    expect(pools.matiereOfQuestion.has("q.militaire")).toBe(false);
  });
});

describe("composition de l'examen", () => {
  it("respecte le volume par matière, sans doublon, et reste déterministe", () => {
    const pools = buildBiaPools(makeBank(), fiches, config);
    const examA = composeBiaExam({ pools, config, seed: 42 });
    const examB = composeBiaExam({ pools, config, seed: 42 });

    expect(examA.questions).toHaveLength(8); // 2 matières × 4
    expect(examA.shortages).toHaveLength(0);
    const ids = examA.questions.map((q) => q.question.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(examB.questions.map((q) => q.question.id)).toEqual(ids);
  });

  it("vise la répartition de difficulté demandée", () => {
    const pools = buildBiaPools(makeBank(), fiches, config);
    const exam = composeBiaExam({ pools, config, seed: 7 });
    const meteo = exam.questions.filter((q) => q.matiere === "meteo");
    const bands = meteo.map((q) => difficultyBand(q.question.difficulty));
    // 4 questions : 2 faciles, 1 moyenne, 1 difficile.
    expect(bands.filter((b) => b === "facile")).toHaveLength(2);
    expect(bands.filter((b) => b === "moyen")).toHaveLength(1);
    expect(bands.filter((b) => b === "difficile")).toHaveLength(1);
  });

  it("complète depuis le vivier quand une bande manque, et déclare la pénurie sinon", () => {
    // Vivier météo réduit à 3 questions faciles : pas assez pour 4.
    const smallBank = [
      makeQuestion("q.a", "fondamentaux.meteorologie.les-nuages", 1),
      makeQuestion("q.b", "fondamentaux.meteorologie.les-nuages", 1),
      makeQuestion("q.c", "fondamentaux.meteorologie.les-nuages", 1),
    ];
    const pools = buildBiaPools(smallBank, fiches, config);
    const exam = composeBiaExam({ pools, config, seed: 1 });
    const meteo = exam.questions.filter((q) => q.matiere === "meteo");
    expect(meteo).toHaveLength(3);
    expect(exam.shortages).toEqual([
      { matiere: "meteo", requested: 4, provided: 3 },
      { matiere: "vol", requested: 4, provided: 0 },
    ]);
  });

  it("privilégie les questions jamais vues (renouvellement)", () => {
    const pools = buildBiaPools(makeBank(), fiches, config);
    // Toutes les questions météo « vues » sauf q.meteo-5.
    const history = new Map(
      [0, 1, 2, 3, 4].map((i) => [`q.meteo-${i}`, { lastAnsweredAt: "2026-07-01T00:00:00Z" }])
    );
    const exam = composeBiaExam({ pools, config, seed: 3, history });
    const meteoIds = exam.questions.filter((q) => q.matiere === "meteo").map((q) => q.question.id);
    expect(meteoIds).toContain("q.meteo-5");
  });
});

describe("correction au format officiel", () => {
  it("note sur 20 par matière, moyenne, admission et mention", () => {
    const pools = buildBiaPools(makeBank(), fiches, config);
    const exam = composeBiaExam({ pools, config, seed: 42 });
    // Toutes les réponses justes en météo, toutes fausses en vol.
    const answers = new Map(
      exam.questions.map(({ question, matiere }) => [
        question.id,
        { kind: "qcm" as const, choices: matiere === "meteo" ? [0] : [1] },
      ])
    );
    const report = gradeBiaExam(exam, answers, config);

    const meteo = report.parMatiere.find((m) => m.matiere === "meteo");
    const vol = report.parMatiere.find((m) => m.matiere === "vol");
    expect(meteo?.note20).toBe(20);
    expect(vol?.note20).toBe(0);
    expect(report.noteGlobale20).toBe(10);
    expect(report.admis).toBe(true);
    expect(report.mention).toBeUndefined();
    expect(report.erreurs).toHaveLength(4);
    expect(report.sansReponse).toHaveLength(0);
  });

  it("compte les sans-réponse comme erreurs sans les pénaliser autrement", () => {
    const pools = buildBiaPools(makeBank(), fiches, config);
    const exam = composeBiaExam({ pools, config, seed: 42 });
    const report = gradeBiaExam(exam, new Map(), config);
    expect(report.noteGlobale20).toBe(0);
    expect(report.admis).toBe(false);
    expect(report.sansReponse).toHaveLength(8);
    expect(report.erreurs).toHaveLength(8);
  });

  it("attribue la meilleure mention atteinte", () => {
    const exam = {
      questions: [0, 1, 2, 3].map((i) => ({
        question: makeQuestion(`q.m-${i}`, "fondamentaux.meteorologie.les-nuages", 1),
        matiere: "meteo",
      })),
    };
    // 3 justes sur 4 → 15/20 → mention Bien.
    const answers = new Map([
      ["q.m-0", { kind: "qcm" as const, choices: [0] }],
      ["q.m-1", { kind: "qcm" as const, choices: [0] }],
      ["q.m-2", { kind: "qcm" as const, choices: [0] }],
      ["q.m-3", { kind: "qcm" as const, choices: [1] }],
    ]);
    const report = gradeBiaExam(exam, answers, config);
    expect(report.noteGlobale20).toBe(15);
    expect(report.mention).toBe("Bien");
  });
});
