import { z } from "zod";
import { contentIdSchema, slugSchema } from "./schemas";

/**
 * Contrat machine du système éditorial (docs/editorial/).
 *
 * Chaque entité de contenu est validée par ces schémas au chargement :
 * un contenu invalide fait échouer le build. Les clés sont en anglais
 * (convention code) ; la correspondance avec le vocabulaire éditorial
 * français est indiquée en commentaire.
 */

export const CONTENT_SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Vocabulaires fermés
// ---------------------------------------------------------------------------

export const concoursSchema = z.enum(["eopan", "eopn", "alat"]);

/** Statut de validation : seul « publie » sort au build. */
export const contentStatusSchema = z.enum(["brouillon", "relecture", "publie", "a-reverifier"]);

/** Les 16 types de fiches (le terme de dictionnaire est une entité à part). */
export const ficheTypeSchema = z.enum([
  // Famille objet (avec infobox)
  "appareil",
  "base-aerienne",
  "ban",
  "regiment",
  "escadron",
  "armement",
  // Famille notion (pédagogique)
  "notion-bia",
  "notion-meteo",
  "notion-navigation",
  "notion-aerodynamique",
  // Famille processus
  "procedure",
  "mission",
  "retex",
  // Famille contexte
  "geopolitique",
  "evenement-historique",
  "personnage-historique",
]);
export type FicheType = z.infer<typeof ficheTypeSchema>;

export type FicheFamily = "objet" | "notion" | "processus" | "contexte";

export const FICHE_FAMILIES: Record<FicheType, FicheFamily> = {
  appareil: "objet",
  "base-aerienne": "objet",
  ban: "objet",
  regiment: "objet",
  escadron: "objet",
  armement: "objet",
  "notion-bia": "notion",
  "notion-meteo": "notion",
  "notion-navigation": "notion",
  "notion-aerodynamique": "notion",
  procedure: "processus",
  mission: "processus",
  retex: "processus",
  geopolitique: "contexte",
  "evenement-historique": "contexte",
  "personnage-historique": "contexte",
};

/** Clés d'infobox exigées par type de fiche-objet (modeles-de-fiches.md). */
export const INFOBOX_REQUIRED_KEYS: Partial<Record<FicheType, readonly string[]>> = {
  appareil: ["constructeur", "role", "armees", "miseEnService", "statut", "equipage"],
  "base-aerienne": ["nomComplet", "code", "localisation", "armee"],
  ban: ["nomComplet", "code", "localisation"],
  regiment: ["appellation", "garnison", "appareils", "missions"],
  escadron: ["appellation", "base", "appareils", "missions"],
  armement: ["type", "guidage", "portee", "porteurs"],
};

// ---------------------------------------------------------------------------
// Briques communes
// ---------------------------------------------------------------------------

const isoDateSchema = z.iso.date();

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url().optional(),
  kind: z.enum(["officiel", "institutionnel", "presse", "ouvrage"]),
  consultedAt: isoDateSchema,
});

/**
 * Relations typées déclarées (relations-et-quiz.md).
 * prerequisites = « prérequis » · related = « complémentaire » ·
 * specializes = « approfondit » · variantOf = « variante-de » ·
 * documents = relation « source » vers des notices.
 */
export const ficheRelationsSchema = z
  .object({
    prerequisites: z.array(contentIdSchema).default([]),
    related: z.array(contentIdSchema).default([]),
    specializes: z.array(contentIdSchema).default([]),
    variantOf: z.array(contentIdSchema).default([]),
    documents: z.array(contentIdSchema).default([]),
  })
  .partial();

const infoboxValueSchema = z.union([z.string().min(1), z.number(), z.array(z.string().min(1))]);

// ---------------------------------------------------------------------------
// Fiche
// ---------------------------------------------------------------------------

export const ficheMetadataSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    id: contentIdSchema,
    type: ficheTypeSchema,
    title: z.string().min(1),
    slug: slugSchema,
    summary: z.string().min(20).max(300),
    module: slugSchema,
    category: slugSchema,
    subcategory: slugSchema.optional(),
    tags: z.array(slugSchema).default([]),
    concours: z.array(concoursSchema).default([]),
    /** 1 découverte · 2 concours · 3 expert */
    level: z.int().min(1).max(3),
    createdAt: isoDateSchema,
    /** Posée à chaque vérification humaine ; affichée sur la fiche. */
    verifiedAt: isoDateSchema,
    author: z.string().min(1),
    /** ≥ 1 source ; la première est la source principale. */
    sources: z.array(sourceSchema).min(1),
    status: contentStatusSchema,
    relations: ficheRelationsSchema.default({}),
    /** Données structurées des fiches-objet (exigences par type). */
    infobox: z.record(z.string(), infoboxValueSchema).optional(),
  })
  .superRefine((fiche, ctx) => {
    const requiredKeys = INFOBOX_REQUIRED_KEYS[fiche.type];
    if (requiredKeys) {
      if (!fiche.infobox) {
        ctx.addIssue({
          code: "custom",
          path: ["infobox"],
          message: `Le type « ${fiche.type} » (famille objet) exige une infobox.`,
        });
        return;
      }
      for (const key of requiredKeys) {
        if (!(key in fiche.infobox)) {
          ctx.addIssue({
            code: "custom",
            path: ["infobox", key],
            message: `Clé d'infobox obligatoire manquante pour « ${fiche.type} » : ${key}.`,
          });
        }
      }
    }
  });

export type FicheMetadata = z.infer<typeof ficheMetadataSchema>;

// ---------------------------------------------------------------------------
// Question (banque centrale)
// ---------------------------------------------------------------------------

const questionIdSchema = z
  .string()
  .regex(/^q\.[a-z0-9-]+\.[a-z0-9-]+$/, "identifiant attendu : q.domaine.numero");

const questionBaseShape = {
  schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
  id: questionIdSchema,
  statement: z.string().min(10),
  /** L'explication enseigne : obligatoire et substantielle. */
  explanation: z.string().min(20),
  /** Toute question évalue au moins une fiche (relation « évalue »). */
  evaluates: z.array(contentIdSchema).min(1),
  difficulty: z.int().min(1).max(5),
  tags: z.array(slugSchema).default([]),
  concours: z.array(concoursSchema).default([]),
  source: sourceSchema.optional(),
  status: contentStatusSchema,
  /** Question issue de la génération assistée (validée humainement comme les autres). */
  generator: z.string().optional(),
};

export const questionSchema = z.discriminatedUnion("kind", [
  z.object({
    ...questionBaseShape,
    kind: z.literal("qcm"),
    choices: z.array(z.string().min(1)).min(3).max(6),
    correctChoices: z.array(z.int().min(0)).min(1),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal("vrai-faux"),
    answer: z.boolean(),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal("association"),
    pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).min(3),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal("legende-schema"),
    schemaId: contentIdSchema,
    zones: z.array(z.object({ zoneId: z.string().min(1), label: z.string().min(1) })).min(2),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal("calcul"),
    answerValue: z.number(),
    tolerance: z.number().min(0).default(0),
    unit: z.string().optional(),
  }),
]);

export type Question = z.infer<typeof questionSchema>;

// ---------------------------------------------------------------------------
// Quiz : une règle (sélecteur) ou une liste explicite, jamais les deux
// ---------------------------------------------------------------------------

export const quizSelectorSchema = z.object({
  module: slugSchema.optional(),
  categories: z.array(slugSchema).optional(),
  subcategories: z.array(slugSchema).optional(),
  tags: z.array(slugSchema).optional(),
  concours: z.array(concoursSchema).optional(),
  difficulty: z.tuple([z.int().min(1).max(5), z.int().min(1).max(5)]).optional(),
  count: z.int().min(1).max(200),
});

export const quizSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    id: z.string().regex(/^quiz\.[a-z0-9-]+$/),
    title: z.string().min(1),
    description: z.string().optional(),
    module: slugSchema,
    /** Liste explicite (formats officiels à reproduire fidèlement)… */
    questions: z.array(questionIdSchema).min(1).optional(),
    /** …ou sélecteur sur la banque (cas général). */
    selector: quizSelectorSchema.optional(),
    /** Durée en secondes (concours blancs chronométrés). */
    timingSeconds: z.int().positive().optional(),
    status: contentStatusSchema,
  })
  .refine((quiz) => Boolean(quiz.questions) !== Boolean(quiz.selector), {
    message: "Un quiz définit soit « questions », soit « selector » — exactement l'un des deux.",
  });

export type Quiz = z.infer<typeof quizSchema>;

// ---------------------------------------------------------------------------
// Terme du dictionnaire (vocabulaire canonique du site)
// ---------------------------------------------------------------------------

export const termeSchema = z.object({
  schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
  id: z.string().regex(/^terme\.[a-z0-9-]+$/),
  title: z.string().min(1),
  /** 1 à 3 phrases, affichée en infobulle partout. */
  definition: z.string().min(20).max(600),
  sigleExpansion: z.string().optional(),
  english: z.string().optional(),
  synonyms: z.array(z.string().min(1)).default([]),
  /** Renvoi vers la fiche complète si elle existe. */
  ficheId: contentIdSchema.optional(),
  tags: z.array(slugSchema).default([]),
  status: contentStatusSchema,
});

export type Terme = z.infer<typeof termeSchema>;

// ---------------------------------------------------------------------------
// Notice de document public
// ---------------------------------------------------------------------------

export const documentNoticeSchema = z
  .object({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    id: z.string().regex(/^doc\.[a-z0-9-]+$/),
    title: z.string().min(1),
    issuer: z.string().min(1),
    publishedAt: isoDateSchema,
    kind: z.enum(["arrete", "rapport", "brochure", "documentation", "communique", "autre"]),
    officialUrl: z.url(),
    /**
     * lien-seul (défaut) : on pointe vers la source, on ne rediffuse pas.
     * Le binaire ne va dans Storage que si le droit est établi.
     */
    rights: z.enum(["lien-seul", "rediffusion-autorisee", "rediffusion-accordee"]),
    storagePath: z.string().min(1).optional(),
    modules: z.array(slugSchema).default([]),
    tags: z.array(slugSchema).default([]),
    status: contentStatusSchema,
  })
  .refine((doc) => doc.rights !== "lien-seul" || doc.storagePath === undefined, {
    message: "Un document « lien-seul » ne peut pas avoir de binaire dans Storage.",
    path: ["storagePath"],
  });

export type DocumentNotice = z.infer<typeof documentNoticeSchema>;
