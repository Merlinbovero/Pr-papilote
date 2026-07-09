import { describe, expect, it } from "vitest";
import { formatContentReport, runContentCheck, type ContentCheckInput } from "./content-check";
import type { DocumentNotice, FicheFile, Question } from "./content-schemas";
import { getAllContent } from "./fiches";

const TODAY = new Date("2026-07-09T00:00:00.000Z");

function fiche(over: Partial<FicheFile>): FicheFile {
  return {
    type: "concept",
    category: "concepts",
    verifiedAt: "2026-06-01",
    status: "publie",
    relations: { documents: [] },
    id: "eopan.concepts.exemple",
    ...over,
  } as FicheFile;
}

function question(evaluates: string[]): Question {
  return {
    id: "q.x.0001",
    evaluates,
    competencies: [],
    status: "publie",
  } as unknown as Question;
}

function baseInput(over: Partial<ContentCheckInput>): ContentCheckInput {
  return { fiches: [], documents: [], questions: [], today: TODAY, ...over };
}

describe("runContentCheck — règles éditoriales", () => {
  it("signale un document associé inexistant comme ERREUR", () => {
    const report = runContentCheck(
      baseInput({ fiches: [fiche({ relations: { documents: ["doc.absent"] } })] })
    );
    expect(report.errors.some((e) => e.code === "document-manquant")).toBe(true);
  });

  it("résout un document associé existant sans erreur", () => {
    const doc = { id: "doc.present", status: "publie", rights: "lien-seul" } as DocumentNotice;
    const report = runContentCheck(
      baseInput({
        fiches: [fiche({ relations: { documents: ["doc.present"] } })],
        documents: [doc],
      })
    );
    expect(report.errors).toHaveLength(0);
  });

  it("refuse une date de vérification dans le futur", () => {
    const report = runContentCheck(baseInput({ fiches: [fiche({ verifiedAt: "2027-01-01" })] }));
    expect(report.errors.some((e) => e.code === "verification-future")).toBe(true);
  });

  it("avertit d'une fiche publiée sans question associée", () => {
    const report = runContentCheck(baseInput({ fiches: [fiche({})] }));
    expect(report.warnings.some((w) => w.code === "sans-quiz")).toBe(true);
  });

  it("lève l'avertissement quiz dès qu'une question évalue la fiche", () => {
    const report = runContentCheck(
      baseInput({
        fiches: [fiche({ id: "eopan.concepts.couvert" })],
        questions: [question(["eopan.concepts.couvert"])],
      })
    );
    expect(report.warnings.some((w) => w.code === "sans-quiz")).toBe(false);
  });

  it("avertit d'une fraîcheur dépassée", () => {
    const report = runContentCheck(
      baseInput({
        fiches: [
          fiche({ type: "geopolitique", category: "geopolitique", verifiedAt: "2024-01-01" }),
        ],
        questions: [question(["eopan.concepts.exemple"])],
      })
    );
    expect(report.warnings.some((w) => w.code === "fraicheur-depassee")).toBe(true);
  });

  it("ne juge pas les brouillons sur la couverture pédagogique", () => {
    const report = runContentCheck(baseInput({ fiches: [fiche({ status: "brouillon" })] }));
    expect(report.warnings).toHaveLength(0);
  });
});

describe("contrôle du contenu réel (rapport éditorial)", () => {
  it("ne présente AUCUNE erreur bloquante", () => {
    const report = runContentCheck({ ...getAllContent(), today: new Date() });
    // Rapport visible via `npm run content:check`.
    console.info(`\n${formatContentReport(report)}\n`);
    expect(report.errors, formatContentReport(report)).toHaveLength(0);
  });
});
