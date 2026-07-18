import type { Concours, Question } from "@/lib/content/content-schemas";
import {
  getFicheById,
  getFicheHref,
  getQuestions,
  getQuestionsForFiche,
} from "@/lib/content/fiches";
import type { PlayerQuestion } from "./quiz-player";

/**
 * Vivier de quiz d'une notion : les questions de la banque qui **évaluent**
 * la fiche, normalisées pour le player. Seuls les formats jouables au clic
 * (QCM et vrai-faux) sont retenus — les autres restent dans la banque mais
 * ne sont pas proposés en mini-quiz de fiche.
 */
function toPlayerQuestion(question: Question): PlayerQuestion | null {
  const furtherReading = question.evaluates.flatMap((ficheId) => {
    const fiche = getFicheById(ficheId);
    return fiche ? [{ label: fiche.title, href: getFicheHref(fiche) }] : [];
  });

  if (question.kind === "vrai-faux") {
    return {
      id: question.id,
      theme: question.theme,
      difficulty: question.difficulty,
      statement: question.statement,
      choices: [{ label: "Vrai" }, { label: "Faux" }],
      correctChoices: [question.answer ? 0 : 1],
      explanation: question.explanation,
      furtherReading,
    };
  }

  if (question.kind === "qcm") {
    return {
      id: question.id,
      theme: question.theme,
      difficulty: question.difficulty,
      statement: question.statement,
      choices: question.choices.map((label, index) => ({
        label,
        note: question.distractorNotes?.[String(index)],
      })),
      correctChoices: question.correctChoices,
      explanation: question.explanation,
      furtherReading,
    };
  }

  return null;
}

/** Vivier de mini-quiz d'une fiche (formats jouables uniquement). */
export function buildNotionPool(ficheId: string): PlayerQuestion[] {
  return getQuestionsForFiche(ficheId)
    .map(toPlayerQuestion)
    .filter((question): question is PlayerQuestion => question !== null);
}

/** Vivier de quiz d'un cours, à partir de la liste de ses questions référencées. */
export function buildCoursePool(questionIds: readonly string[]): PlayerQuestion[] {
  const wanted = new Set(questionIds);
  return getQuestions()
    .filter((q) => wanted.has(q.id))
    .map(toPlayerQuestion)
    .filter((question): question is PlayerQuestion => question !== null);
}

/**
 * Vivier d'entraînement d'un concours : toutes les questions de la banque
 * marquées pour ce concours (`concours`) et jouables au clic (QCM, vrai-faux).
 * C'est un mode d'entraînement libre — pas la reproduction d'un format officiel
 * (celui-ci relèverait du contrat `examSchema`, sourcé et daté).
 */
export function buildConcoursPool(concours: Concours): PlayerQuestion[] {
  return getQuestions()
    .filter((q) => q.concours.includes(concours))
    .map(toPlayerQuestion)
    .filter((question): question is PlayerQuestion => question !== null);
}

/**
 * Vivier d'anglais aéronautique : les questions évaluant la compétence
 * transversale « anglais-aeronautique » (phraséologie, vocabulaire, grammaire,
 * compréhension), jouables au clic. Alimente l'espace anglais dédié.
 */
export function buildEnglishPool(): PlayerQuestion[] {
  return getQuestions()
    .filter((q) => q.competencies.includes("anglais-aeronautique"))
    .map(toPlayerQuestion)
    .filter((question): question is PlayerQuestion => question !== null);
}
