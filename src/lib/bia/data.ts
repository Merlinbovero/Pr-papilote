import type { FicheFile, Question } from "@/lib/content/content-schemas";

export type { BiaPlayerQuestion } from "./schema";
import { getFicheById, getFicheHref, getFiches, getQuestions } from "@/lib/content/fiches";
import { getBiaConfig } from "./config";
import { resolveBiaMatiere, type BiaConfig, type BiaPlayerQuestion } from "./schema";
import { buildBiaPools, type BiaPools } from "./exam";

/**
 * Assemblage serveur du parcours BIA (docs/editorial/module-bia.md) —
 * projections calculées au build à partir des chargeurs de contenu.
 * L'examen réel étant un QCM, les viviers d'entraînement et d'examen ne
 * retiennent que les formats compatibles (qcm, vrai-faux).
 */

/** Formats de questions jouables dans le player et fidèles au QCM du BIA. */
export function isQcmCompatible(question: Question): boolean {
  return question.kind === "qcm" || question.kind === "vrai-faux";
}

let fichesByMatiereCache: Map<string, FicheFile[]> | undefined;

/** Fiches du parcours, groupées par matière (épreuve facultative comprise). */
export function getBiaFichesByMatiere(): Map<string, FicheFile[]> {
  if (!fichesByMatiereCache) {
    const config = getBiaConfig();
    const index = new Map<string, FicheFile[]>();
    for (const fiche of getFiches()) {
      if (fiche.status !== "publie") {
        continue;
      }
      const matiere = resolveBiaMatiere(
        { id: fiche.id, module: fiche.module, category: fiche.category },
        config
      );
      if (!matiere) {
        continue;
      }
      const list = index.get(matiere);
      if (list) {
        list.push(fiche);
      } else {
        index.set(matiere, [fiche]);
      }
    }
    for (const list of index.values()) {
      list.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
    }
    fichesByMatiereCache = index;
  }
  return fichesByMatiereCache;
}

let poolsCache: BiaPools | undefined;

/** Viviers d'examen (QCM-compatibles uniquement), calculés une fois au build. */
export function getBiaExamPools(): BiaPools {
  if (!poolsCache) {
    const config = getBiaConfig();
    const fiches = getFiches().map((f) => ({ id: f.id, module: f.module, category: f.category }));
    poolsCache = buildBiaPools(getQuestions().filter(isQcmCompatible), fiches, config);
  }
  return poolsCache;
}

/** Projection d'une question de la banque vers le modèle du player. */
export function toBiaPlayerQuestion(question: Question, matiere: string): BiaPlayerQuestion {
  const furtherReading = question.evaluates.flatMap((ficheId) => {
    const fiche = getFicheById(ficheId);
    return fiche ? [{ label: fiche.title, href: getFicheHref(fiche) }] : [];
  });
  if (question.kind === "vrai-faux") {
    return {
      id: question.id,
      matiere,
      theme: question.theme,
      difficulty: question.difficulty,
      statement: question.statement,
      choices: [{ label: "Vrai" }, { label: "Faux" }],
      correctChoices: [question.answer ? 0 : 1],
      explanation: question.explanation,
      furtherReading,
    };
  }
  if (question.kind !== "qcm") {
    throw new Error(`Format non jouable dans le player BIA : ${question.kind} (${question.id})`);
  }
  return {
    id: question.id,
    matiere,
    theme: question.theme,
    difficulty: question.difficulty,
    statement: question.statement,
    choices: question.choices.map((label) => ({ label })),
    correctChoices: question.correctChoices,
    explanation: question.explanation,
    furtherReading,
  };
}

export interface BiaMatiereSummary {
  slug: string;
  name: string;
  description: string;
  ficheCount: number;
  questionCount: number;
  facultative: boolean;
}

/** Résumé des matières pour le hub (comptes réels, épreuve facultative incluse). */
export function getBiaMatiereSummaries(): BiaMatiereSummary[] {
  const config: BiaConfig = getBiaConfig();
  const fiches = getBiaFichesByMatiere();
  const pools = getBiaExamPools();
  const summaries: BiaMatiereSummary[] = config.matieres.map((m) => ({
    slug: m.slug,
    name: m.name,
    description: m.description,
    ficheCount: fiches.get(m.slug)?.length ?? 0,
    questionCount: pools.byMatiere.get(m.slug)?.length ?? 0,
    facultative: false,
  }));
  summaries.push({
    slug: config.epreuveFacultative.slug,
    name: config.epreuveFacultative.name,
    description: config.epreuveFacultative.description,
    ficheCount: fiches.get(config.epreuveFacultative.slug)?.length ?? 0,
    questionCount: pools.byMatiere.get(config.epreuveFacultative.slug)?.length ?? 0,
    facultative: true,
  });
  return summaries;
}
