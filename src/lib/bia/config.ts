import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * Référentiel du parcours BIA (content/_referentiels/bia.json) —
 * la projection du programme officiel sur les catégories Fondamentaux
 * (docs/editorial/module-bia.md). Lecture au build ; toute donnée
 * invalide fait échouer le build, comme les autres référentiels.
 */

const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
const contentIdSchema = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/);

export const biaMatiereSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  order: z.int().positive(),
  description: z.string().min(1),
  categories: z.array(slugSchema).min(1),
});

export const biaFileSchema = z.object({
  matieres: z.array(biaMatiereSchema).min(1),
  epreuveFacultative: biaMatiereSchema.omit({ order: true }),
  /** Fiches rattachées à une autre matière que celle de leur catégorie. */
  ficheOverrides: z.record(contentIdSchema, slugSchema),
  /** Fiches absentes de l'espace BIA (contenu spécifiquement militaire). */
  horsParcours: z.array(contentIdSchema),
  /** Fiches visibles dans le parcours mais jamais tirées à l'examen. */
  horsExamen: z.array(contentIdSchema),
  examen: z.object({
    questionsParMatiere: z.int().positive(),
    dureeSecondes: z.int().positive(),
    seuilAdmission: z.number().positive(),
    mentions: z.array(z.object({ label: z.string().min(1), min: z.number() })).min(1),
    repartitionDifficulte: z.object({
      facile: z.number().min(0).max(1),
      moyen: z.number().min(0).max(1),
      difficile: z.number().min(0).max(1),
    }),
  }),
});

export type BiaMatiere = z.infer<typeof biaMatiereSchema>;
export type BiaConfig = z.infer<typeof biaFileSchema>;

let configCache: BiaConfig | undefined;

/** Le référentiel BIA validé, matières triées par ordre officiel. */
export function getBiaConfig(): BiaConfig {
  if (!configCache) {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "content", "_referentiels", "bia.json"),
      "utf-8"
    );
    const parsed = biaFileSchema.parse(JSON.parse(raw));
    const slugs = new Set(parsed.matieres.map((m) => m.slug));
    if (slugs.size !== parsed.matieres.length) {
      throw new Error("Référentiel BIA : slugs de matières en double");
    }
    for (const [ficheId, matiere] of Object.entries(parsed.ficheOverrides)) {
      if (!slugs.has(matiere)) {
        throw new Error(`Référentiel BIA : surcharge « ${ficheId} » vers matière inconnue`);
      }
    }
    parsed.matieres = [...parsed.matieres].sort((a, b) => a.order - b.order);
    configCache = parsed;
  }
  return configCache;
}

/** Une matière par slug (épreuve facultative comprise), ou undefined. */
export function getBiaMatiere(slug: string): Omit<BiaMatiere, "order"> | undefined {
  const config = getBiaConfig();
  if (config.epreuveFacultative.slug === slug) {
    return config.epreuveFacultative;
  }
  return config.matieres.find((m) => m.slug === slug);
}

/** Résumé minimal d'une fiche pour la projection BIA (module + catégorie). */
export interface BiaFicheRef {
  id: string;
  module: string;
  category: string;
}

/**
 * Matière BIA d'une fiche — surcharge explicite d'abord, sinon catégorie.
 * Retourne undefined hors périmètre (autre module, hors parcours,
 * catégorie non couverte). L'épreuve facultative est une matière comme
 * une autre pour la projection.
 */
export function resolveBiaMatiere(fiche: BiaFicheRef, config: BiaConfig): string | undefined {
  if (fiche.module !== "fondamentaux" || config.horsParcours.includes(fiche.id)) {
    return undefined;
  }
  const override = config.ficheOverrides[fiche.id];
  if (override) {
    return override;
  }
  if (config.epreuveFacultative.categories.includes(fiche.category)) {
    return config.epreuveFacultative.slug;
  }
  return config.matieres.find((m) => m.categories.includes(fiche.category))?.slug;
}
