import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/content/content-schemas";
import {
  createRng,
  filterQuestions,
  isCorrect,
  scoreEpreuve,
  seededShuffle,
  selectQuestions,
  type QuestionHistory,
} from "./engine";

const base = {
  schemaVersion: 1 as const,
  theme: "meteorologie",
  explanation: "Explication pédagogique de démonstration, suffisamment longue.",
  evaluates: ["fondamentaux.meteorologie.exemple"],
  tags: [],
  concours: ["eopan" as const],
  status: "publie" as const,
};

const qcm: Question = {
  ...base,
  id: "q.meteo.0001",
  kind: "qcm",
  statement: "Quel nuage est associé aux orages ?",
  choices: ["Cirrus", "Cumulonimbus", "Stratus"],
  correctChoices: [1],
  difficulty: 2,
};

describe("aléa déterministe", () => {
  it("produit le même ordre pour la même graine", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(seededShuffle(items, 42)).toEqual(seededShuffle(items, 42));
  });

  it("produit un ordre différent pour une graine différente", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(seededShuffle(items, 1)).not.toEqual(seededShuffle(items, 2));
  });

  it("conserve tous les éléments (permutation)", () => {
    const items = [1, 2, 3, 4, 5];
    expect([...seededShuffle(items, 7)].sort()).toEqual(items);
  });

  it("createRng est reproductible", () => {
    const a = createRng(123);
    const b = createRng(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("scoring par format", () => {
  it("QCM choix unique : exact requis", () => {
    expect(isCorrect(qcm, { kind: "qcm", choices: [1] })).toBe(true);
    expect(isCorrect(qcm, { kind: "qcm", choices: [0] })).toBe(false);
    expect(isCorrect(qcm, { kind: "qcm", choices: [1, 2] })).toBe(false);
  });

  it("QCM choix multiple : ensemble exact, ordre indifférent", () => {
    const multi: Question = { ...qcm, id: "q.meteo.0002", correctChoices: [0, 2] };
    expect(isCorrect(multi, { kind: "qcm", choices: [2, 0] })).toBe(true);
    expect(isCorrect(multi, { kind: "qcm", choices: [0] })).toBe(false);
  });

  it("vrai-faux", () => {
    const vf: Question = {
      ...base,
      id: "q.meteo.0003",
      kind: "vrai-faux",
      statement: "Le cumulonimbus est un nuage d'orage.",
      answer: true,
      difficulty: 1,
    };
    expect(isCorrect(vf, { kind: "vrai-faux", answer: true })).toBe(true);
    expect(isCorrect(vf, { kind: "vrai-faux", answer: false })).toBe(false);
  });

  it("calcul : tolérance respectée", () => {
    const calc: Question = {
      ...base,
      id: "q.maths.0001",
      kind: "calcul",
      statement: "Convertir 100 kt en km/h (approx).",
      answerValue: 185,
      tolerance: 2,
      difficulty: 3,
    };
    expect(isCorrect(calc, { kind: "calcul", value: 186 })).toBe(true);
    expect(isCorrect(calc, { kind: "calcul", value: 190 })).toBe(false);
  });

  it("ordre : séquence exacte", () => {
    const ordre: Question = {
      ...base,
      id: "q.histoire.0001",
      kind: "ordre",
      statement: "Classer par ordre chronologique.",
      items: ["A", "B", "C"],
      difficulty: 3,
    };
    expect(isCorrect(ordre, { kind: "ordre", order: [0, 1, 2] })).toBe(true);
    expect(isCorrect(ordre, { kind: "ordre", order: [1, 0, 2] })).toBe(false);
  });

  it("texte à trous : réponses acceptées, accents et casse ignorés", () => {
    const trous: Question = {
      ...base,
      id: "q.meteo.0004",
      kind: "texte-a-trous",
      statement: "Compléter.",
      text: "Le nuage d'orage est le {{1}}.",
      gaps: [{ accepted: ["cumulonimbus", "Cb"] }],
      difficulty: 2,
    };
    expect(isCorrect(trous, { kind: "texte-a-trous", values: ["Cumulonimbus"] })).toBe(true);
    expect(isCorrect(trous, { kind: "texte-a-trous", values: ["cirrus"] })).toBe(false);
  });

  it("un format ne valide jamais un autre format", () => {
    expect(isCorrect(qcm, { kind: "vrai-faux", answer: true })).toBe(false);
  });
});

describe("sélection sur la banque", () => {
  const bank: Question[] = [
    qcm,
    { ...qcm, id: "q.meteo.0010", difficulty: 4 },
    { ...qcm, id: "q.nav.0001", theme: "navigation", difficulty: 2 },
  ];

  it("filtre par thème et par difficulté", () => {
    const result = filterQuestions(bank, {
      selector: { themes: ["meteorologie"], difficulty: [1, 3], count: 10 },
    });
    expect(result.map((q) => q.id)).toEqual(["q.meteo.0001"]);
  });

  it("respecte le nombre demandé", () => {
    const result = selectQuestions(bank, {
      selector: { themes: ["meteorologie"], count: 1 },
      seed: 5,
    });
    expect(result).toHaveLength(1);
  });

  it("fait passer les questions jamais vues avant les anciennes", () => {
    const history = new Map<string, QuestionHistory>([
      ["q.meteo.0001", { lastAnsweredAt: "2026-01-01" }],
    ]);
    const result = selectQuestions(bank, {
      selector: { themes: ["meteorologie"], count: 2 },
      seed: 3,
      history,
    });
    // q.meteo.0010 (jamais vue) doit précéder q.meteo.0001 (déjà vue)
    expect(result[0]?.id).toBe("q.meteo.0010");
  });

  it("sélection déterministe pour la même graine", () => {
    const a = selectQuestions(bank, { selector: { count: 3 }, seed: 9 });
    const b = selectQuestions(bank, { selector: { count: 3 }, seed: 9 });
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});

describe("barème d'examen", () => {
  const bareme = { pointsParBonne: 1, penaliteParFausse: 0.5 };

  it("bonnes × points − fausses × pénalité", () => {
    expect(scoreEpreuve({ correct: 10, incorrect: 2, skipped: 0 }, bareme)).toBe(9);
  });

  it("ne pénalise jamais les questions sautées", () => {
    expect(scoreEpreuve({ correct: 5, incorrect: 0, skipped: 5 }, bareme)).toBe(5);
  });

  it("plancher à zéro (jamais de score négatif)", () => {
    expect(scoreEpreuve({ correct: 1, incorrect: 10, skipped: 0 }, bareme)).toBe(0);
  });
});
