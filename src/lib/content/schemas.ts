import { z } from "zod";

/**
 * Slug d'URL : minuscules, chiffres et tirets. Utilisé pour tous les
 * segments d'URL issus du contenu.
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug invalide (attendu : kebab-case)");

/**
 * Identifiant de contenu stable, gelé à vie (ex. "eopn.appareils.rafale-b").
 * C'est lui que la base utilisateur référence : il ne change JAMAIS,
 * même si le titre ou le slug évolue.
 */
export const contentIdSchema = z
  .string()
  .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, "identifiant invalide (attendu : segments.pointés)");

export const moduleKindSchema = z.enum(["concours", "transverse"]);

export const moduleSchema = z.object({
  id: slugSchema,
  slug: slugSchema,
  name: z.string().min(1),
  fullName: z.string().min(1).optional(),
  organization: z.string().min(1).optional(),
  kind: moduleKindSchema,
  order: z.number().int().positive(),
  description: z.string().min(1),
});

export const modulesFileSchema = z.array(moduleSchema).min(1);

export const categorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  order: z.number().int().positive(),
  description: z.string().min(1).optional(),
});

/**
 * Les trois modules concours partagent par construction la même liste de
 * catégories (clé "concours") : l'utilisateur ne réapprend jamais
 * l'interface en changeant de concours.
 */
export const categoriesFileSchema = z.object({
  concours: z.array(categorySchema).min(1),
  fondamentaux: z.array(categorySchema).min(1),
  psychotechnique: z.array(categorySchema).min(1),
  culture: z.array(categorySchema).min(1),
});

/**
 * Cote documentaire — `MODULE · F.C.NN` (docs/design-archetypes.md §1).
 *
 * Une cote se note sur un cahier et se retrouve six mois plus tard : elle est
 * donc **inscrite** dans `content/_referentiels/cotes.json`, jamais recalculée
 * au rendu. Le rendu ne dépend d'aucun tri courant, et ajouter une leçon ne
 * renumérote rien.
 */
export const coteSchema = z
  .string()
  .regex(
    /^[A-Z]{3,5} · [A-F]\.\d{1,2}\.\d{2}$/,
    "cote invalide (attendu : MODULE · F.C.NN, ex. « FOND · B.3.07 »)"
  );

export const cotesFileSchema = z.object({
  /** Commentaire de tête du fichier — ignoré par le chargeur. */
  _doc: z.array(z.string()).optional(),
  cours: z.record(slugSchema, coteSchema),
});

/**
 * Archétype documentaire d'une fiche — la famille visuelle dont elle relève
 * (docs/design-archetypes.md). Référentiel **fermé** : une valeur inconnue
 * fait échouer le build plutôt que de laisser passer une faute de frappe.
 */
export const archetypeSchema = z.enum(["identification", "lecon", "cahier", "situation"]);

export const archetypesFileSchema = z.object({
  /** Commentaire de tête du fichier — ignoré par le chargeur. */
  _doc: z.array(z.string()).optional(),
  /** Défaut par « module/categorie ». */
  defauts: z.record(z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/), archetypeSchema),
  /** Exception par identifiant de fiche — l'emporte sur le défaut. */
  exceptions: z.record(slugSchema, archetypeSchema),
});

export type Archetype = z.infer<typeof archetypeSchema>;

export type Module = z.infer<typeof moduleSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ModuleKind = z.infer<typeof moduleKindSchema>;
