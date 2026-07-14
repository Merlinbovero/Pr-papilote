import type { Question } from "@/lib/content/content-schemas";
import { isCorrect, seededShuffle, type AnswerInput } from "@/features/quiz/engine";
import { resolveBiaMatiere, type BiaConfig, type BiaFicheRef } from "./schema";

/**
 * Moteur d'examen blanc BIA — fonctions pures (docs/editorial/module-bia.md).
 * Composition d'un examen de 100 questions (20 par matière, bandes de
 * difficulté, sans doublon, jamais-vues d'abord) et correction au format
 * officiel (note sur 20 par matière, moyenne, admission à 10, mentions).
 *
 * La composition et la notation sont GÉNÉRIQUES (id + difficulté, et un
 * prédicat de correction fourni par l'appelant) : elles tournent aussi
 * bien au build (objets Question complets) que dans le navigateur (modèle
 * du player sérialisé) — une seule source de vérité pour les deux.
 */

// ---------------------------------------------------------------------------
// Viviers par matière
// ---------------------------------------------------------------------------

export interface BiaPools {
  /** matière → questions éligibles à l'examen. */
  byMatiere: Map<string, Question[]>;
  /** question → matière (pour la correction et le carnet d'erreurs). */
  matiereOfQuestion: Map<string, string>;
}

/**
 * Répartit la banque en viviers par matière : une question suit sa
 * première fiche évaluée ; les fiches hors examen n'alimentent aucun
 * vivier. Une question est comptée dans une seule matière.
 */
export function buildBiaPools(
  questions: readonly Question[],
  fiches: readonly BiaFicheRef[],
  config: BiaConfig
): BiaPools {
  const ficheById = new Map(fiches.map((f) => [f.id, f]));
  const byMatiere = new Map<string, Question[]>();
  const matiereOfQuestion = new Map<string, string>();

  for (const question of questions) {
    const ficheId = question.evaluates[0];
    if (!ficheId || config.horsExamen.includes(ficheId)) {
      continue;
    }
    const fiche = ficheById.get(ficheId);
    if (!fiche) {
      continue;
    }
    const matiere = resolveBiaMatiere(fiche, config);
    if (!matiere) {
      continue;
    }
    matiereOfQuestion.set(question.id, matiere);
    const pool = byMatiere.get(matiere);
    if (pool) {
      pool.push(question);
    } else {
      byMatiere.set(matiere, [question]);
    }
  }
  return { byMatiere, matiereOfQuestion };
}

// ---------------------------------------------------------------------------
// Composition de l'examen (générique : id + difficulté suffisent)
// ---------------------------------------------------------------------------

/** Le minimum requis d'une question pour composer un examen. */
export interface ComposableQuestion {
  id: string;
  difficulty: number;
}

/** Bandes de difficulté du barème BIA (échelle interne 1-5). */
export function difficultyBand(difficulty: number): "facile" | "moyen" | "difficile" {
  if (difficulty <= 1) {
    return "facile";
  }
  if (difficulty === 2) {
    return "moyen";
  }
  return "difficile";
}

export interface BiaExamQuestion<T extends ComposableQuestion = Question> {
  question: T;
  matiere: string;
}

export interface BiaExamShortage {
  matiere: string;
  requested: number;
  provided: number;
}

export interface BiaExam<T extends ComposableQuestion = Question> {
  questions: BiaExamQuestion<T>[];
  /** Matières dont le vivier n'a pas suffi — jamais masqué. */
  shortages: BiaExamShortage[];
  seed: number;
  dureeSecondes: number;
}

interface ComposeInput<T extends ComposableQuestion> {
  pools: { byMatiere: ReadonlyMap<string, readonly T[]> };
  config: BiaConfig;
  seed: number;
  /** Identifiants des questions déjà rencontrées (renouvellement). */
  seenIds?: ReadonlySet<string>;
  /** Surcharge du volume par matière (défaut : config.examen). */
  questionsParMatiere?: number;
}

/** Tirage déterministe : jamais-vues d'abord, mélange par graine. */
function pick<T extends ComposableQuestion>(
  candidates: readonly T[],
  count: number,
  seed: number,
  seenIds: ReadonlySet<string> | undefined
): T[] {
  if (count <= 0 || candidates.length === 0) {
    return [];
  }
  const unseen = candidates.filter((q) => !seenIds?.has(q.id));
  const seen = candidates.filter((q) => seenIds?.has(q.id));
  return [...seededShuffle(unseen, seed), ...seededShuffle(seen, seed + 1)].slice(0, count);
}

/**
 * Compose l'examen : pour chaque matière (ordre officiel), vise la
 * répartition de difficulté configurée, complète depuis le reste du
 * vivier si une bande manque, sans jamais dupliquer une question.
 */
export function composeBiaExam<T extends ComposableQuestion>(input: ComposeInput<T>): BiaExam<T> {
  const { pools, config, seed, seenIds } = input;
  const perMatiere = input.questionsParMatiere ?? config.examen.questionsParMatiere;
  const repartition = config.examen.repartitionDifficulte;

  const questions: BiaExamQuestion<T>[] = [];
  const shortages: BiaExamShortage[] = [];

  for (const matiere of config.matieres) {
    const pool = pools.byMatiere.get(matiere.slug) ?? [];
    const taken = new Map<string, T>();

    // Objectifs par bande (le reliquat d'arrondi va au « moyen »).
    const facile = Math.round(perMatiere * repartition.facile);
    const difficile = Math.round(perMatiere * repartition.difficile);
    const moyen = perMatiere - facile - difficile;
    const bands: { band: ReturnType<typeof difficultyBand>; count: number }[] = [
      { band: "facile", count: facile },
      { band: "moyen", count: moyen },
      { band: "difficile", count: difficile },
    ];

    for (const { band, count } of bands) {
      const candidates = pool.filter(
        (q) => difficultyBand(q.difficulty) === band && !taken.has(q.id)
      );
      for (const question of pick(candidates, count, seed + matiere.order, seenIds)) {
        taken.set(question.id, question);
      }
    }

    // Repli : compléter depuis tout le vivier si des bandes ont manqué.
    if (taken.size < perMatiere) {
      const remaining = pool.filter((q) => !taken.has(q.id));
      for (const question of pick(
        remaining,
        perMatiere - taken.size,
        seed + matiere.order + 1000,
        seenIds
      )) {
        taken.set(question.id, question);
      }
    }

    if (taken.size < perMatiere) {
      shortages.push({ matiere: matiere.slug, requested: perMatiere, provided: taken.size });
    }
    for (const question of taken.values()) {
      questions.push({ question, matiere: matiere.slug });
    }
  }

  return { questions, shortages, seed, dureeSecondes: config.examen.dureeSecondes };
}

// ---------------------------------------------------------------------------
// Correction au format officiel (générique via prédicat de correction)
// ---------------------------------------------------------------------------

export interface BiaMatiereScore {
  matiere: string;
  total: number;
  correct: number;
  /** Note proportionnelle sur 20, arrondie au dixième. */
  note20: number;
}

export interface BiaExamReport {
  parMatiere: BiaMatiereScore[];
  /** Moyenne des matières, arrondie au dixième. */
  noteGlobale20: number;
  admis: boolean;
  mention?: string;
  /** Questions ratées (pour le carnet d'erreurs) et laissées sans réponse. */
  erreurs: string[];
  sansReponse: string[];
}

/**
 * Corrige un examen composé : l'appelant fournit le verdict par question
 * (true = juste, false = faux, undefined = sans réponse). Note sur 20 par
 * matière, moyenne, admission au seuil, meilleure mention atteinte.
 */
export function gradeComposedExam<T extends ComposableQuestion>(
  exam: Pick<BiaExam<T>, "questions">,
  verdictOf: (question: T) => boolean | undefined,
  config: BiaConfig
): BiaExamReport {
  const byMatiere = new Map<string, { total: number; correct: number }>();
  const erreurs: string[] = [];
  const sansReponse: string[] = [];

  for (const { question, matiere } of exam.questions) {
    const bucket = byMatiere.get(matiere) ?? { total: 0, correct: 0 };
    bucket.total += 1;
    const verdict = verdictOf(question);
    if (verdict === undefined) {
      sansReponse.push(question.id);
      erreurs.push(question.id);
    } else if (verdict) {
      bucket.correct += 1;
    } else {
      erreurs.push(question.id);
    }
    byMatiere.set(matiere, bucket);
  }

  const parMatiere: BiaMatiereScore[] = config.matieres
    .filter((m) => byMatiere.has(m.slug))
    .map((m) => {
      const { total, correct } = byMatiere.get(m.slug)!;
      return { matiere: m.slug, total, correct, note20: round1((correct / total) * 20) };
    });

  const noteGlobale20 =
    parMatiere.length > 0
      ? round1(parMatiere.reduce((sum, m) => sum + m.note20, 0) / parMatiere.length)
      : 0;
  const admis = noteGlobale20 >= config.examen.seuilAdmission;
  const mention = admis
    ? [...config.examen.mentions].sort((a, b) => b.min - a.min).find((m) => noteGlobale20 >= m.min)
        ?.label
    : undefined;

  return { parMatiere, noteGlobale20, admis, mention, erreurs, sansReponse };
}

/** Correction sur objets Question complets (build, tests). */
export function gradeBiaExam(
  exam: Pick<BiaExam<Question>, "questions">,
  answers: ReadonlyMap<string, AnswerInput>,
  config: BiaConfig
): BiaExamReport {
  return gradeComposedExam(
    exam,
    (question) => {
      const answer = answers.get(question.id);
      return answer === undefined ? undefined : isCorrect(question, answer);
    },
    config
  );
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
