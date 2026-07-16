import { z } from "zod";
import { contentIdSchema, slugSchema } from "./schemas";
import { contentStatusSchema, revisionSchema, sourceSchema } from "./content-schemas";

/**
 * Contrat de l'objet « cours » (docs/editorial/cours.md).
 *
 * Un cours est une SÉQUENCE PÉDAGOGIQUE : il n'embarque aucun texte de fiche,
 * il ne fait que RÉFÉRENCER des objets canoniques (fiches, termes, exercices,
 * questions, interactions). Le même cours est donc consultable depuis les
 * Fondamentaux (sa catégorie scientifique) et depuis le parcours BIA (sa
 * matière officielle) sans la moindre duplication : la progression ne connaît
 * qu'un seul identifiant canonique.
 *
 * Le modèle est volontairement GÉNÉRIQUE (pas spécifique à la mécanique du
 * vol) : il accueillera météorologie, navigation, aéronefs, histoire, anglais.
 */

const isoDate = z.iso.date();
const termeIdSchema = z.string().regex(/^terme\.[a-z0-9-]+$/);
const exerciceIdSchema = z.string().regex(/^exercice\.[a-z0-9-]+$/);
const questionIdSchema = z.string().regex(/^q\.[a-z0-9-]+(\.[a-z0-9-]+)*$/);
const courseIdSchema = z.string().regex(/^cours\.[a-z0-9-]+$/);

/** Intervalle de pages du PDF source (traçabilité pédagogique). */
export const pdfPageRangeSchema = z
  .object({ from: z.int().min(1), to: z.int().min(1) })
  .refine((r) => r.to >= r.from, { message: "intervalle de pages inversé (to < from)" });

/**
 * Une étape de la séquence pédagogique. `ref` pointe vers un objet déjà
 * référencé par le cours (fiche, interaction, exercice) ; `quiz` et
 * `revision` sont des étapes internes (vivier de questions / résumé du cours).
 * `obligatoire` détermine ce qui compte pour le statut « étudié ».
 */
export const courseStepSchema = z.object({
  kind: z.enum(["fiche", "interaction", "exercice", "quiz", "revision"]),
  /** Requis pour fiche/interaction/exercice ; absent pour quiz/revision. */
  ref: z.string().min(1).optional(),
  title: z.string().min(1),
  obligatoire: z.boolean().default(true),
});
export type CourseStep = z.infer<typeof courseStepSchema>;

export const courseSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: courseIdSchema,
    slug: slugSchema,
    title: z.string().min(1),
    description: z.string().min(20).max(400),
    /** Module documentaire canonique (Fondamentaux pour l'instant). */
    module: slugSchema,
    /** Catégorie scientifique dans les Fondamentaux. */
    categorieFondamentaux: slugSchema,
    /** Matière officielle du BIA (référence, pas de copie). */
    matiereBia: slugSchema,
    objectifs: z.array(z.string().min(5)).min(1),
    /** Cours prérequis (identifiants canoniques). */
    prerequisites: z.array(courseIdSchema).default([]),
    /** Ordre dans le parcours (unique par matière BIA). */
    ordre: z.int().min(1),
    niveau: z.int().min(1).max(3),
    dureeEstimeeMin: z.int().min(1),
    /** Pages du PDF source (traçabilité). */
    pdfPages: z.array(pdfPageRangeSchema).default([]),
    competencies: z.array(slugSchema).default([]),
    /** Références (aucune duplication de contenu). */
    fiches: z.array(contentIdSchema).min(1),
    termes: z.array(termeIdSchema).default([]),
    exercices: z.array(exerciceIdSchema).default([]),
    questions: z.array(questionIdSchema).default([]),
    interactions: z.array(slugSchema).default([]),
    /** Séquence pédagogique ordonnée. */
    sequence: z.array(courseStepSchema).min(1),
    /** Résumé de révision (la « fiche de révision » du cours). */
    resumeRevision: z.array(z.string().min(3)).min(1),
    sources: z.array(sourceSchema).default([]),
    status: contentStatusSchema,
    author: z.string().min(1),
    createdAt: isoDate,
    verifiedAt: isoDate,
    revisions: z.array(revisionSchema).min(1),
  })
  .strict();

export type Course = z.infer<typeof courseSchema>;

/**
 * Exercice guidé — objet canonique référencé par un cours. Chaque exercice
 * porte consigne, données, méthode, correction, interprétation aéronautique
 * et la notion liée (fiche), conformément au processus éditorial.
 */
export const exerciceSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: exerciceIdSchema,
    title: z.string().min(1),
    consigne: z.string().min(1),
    /** Données de l'énoncé (facultatif pour un exercice qualitatif). */
    donnees: z.string().min(1).optional(),
    methode: z.string().min(1),
    correction: z.string().min(1),
    /** Interprétation aéronautique du résultat. */
    interpretation: z.string().min(1),
    /** Notion liée (fiche à revoir). */
    notionLiee: contentIdSchema,
    difficulty: z.int().min(1).max(3),
    competencies: z.array(slugSchema).default([]),
    status: contentStatusSchema,
  })
  .strict();

export type Exercice = z.infer<typeof exerciceSchema>;
