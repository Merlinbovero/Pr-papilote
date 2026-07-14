import fs from "node:fs";
import path from "node:path";
import { biaFileSchema, type BiaConfig, type BiaMatiere } from "./schema";

/**
 * Chargeur du référentiel BIA (content/_referentiels/bia.json) —
 * serveur uniquement (lecture au build, comme les autres référentiels).
 * Le contrat et les projections pures vivent dans ./schema.
 */

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
