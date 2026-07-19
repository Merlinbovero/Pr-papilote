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

export type Module = z.infer<typeof moduleSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ModuleKind = z.infer<typeof moduleKindSchema>;
