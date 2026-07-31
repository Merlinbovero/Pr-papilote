import { z } from "zod";

/**
 * Le contrat de l'artefact d'index — lot M10.
 *
 * Il vit ici, et non dans le générateur ni dans le chargeur, parce que les deux
 * doivent valider **la même chose**. Un schéma dupliqué finirait par diverger,
 * et l'artefact passerait à la génération pour échouer dans le navigateur.
 */

/** Version du schéma. À incrémenter si la forme des entrées change. */
export const SCHEMA_RECHERCHE = 1;

export const artefactRechercheSchema = z.object({
  schema: z.literal(SCHEMA_RECHERCHE),
  entries: z
    .array(
      z
        .object({
          id: z.string().min(1),
          type: z.string().min(1),
          title: z.string().min(1),
          moduleName: z.string(),
          moduleSlug: z.string(),
          url: z.string().min(1),
        })
        .passthrough()
    )
    .min(1),
});

/** Le chemin public de l'artefact — une seule vérité, côté client comme script. */
export const CHEMIN_INDEX_RECHERCHE = "/generated/recherche-index.json";
