/**
 * Registre des modèles 3D du site.
 *
 * Règle éditoriale (comme pour les photos, cf. `src/lib/photos.ts`) : chaque
 * modèle 3D provient d'une source de libre réutilisation vérifiée, avec une
 * licence compatible (CC0, CC BY, CC BY-SA). L'auteur, la licence et la page
 * source sont consignés ici et affichés sur /credits-photos afin d'honorer
 * l'obligation d'attribution des licences CC BY.
 *
 * Les modèles sont utilisés par le test d'orientation spatiale
 * (`/psychotechnique/orientation`), rendus en 3D par Three.js.
 */

export interface Site3DModel {
  /** Chemin public du fichier .glb. */
  src: string;
  /** Intitulé court pour la page des crédits. */
  title: string;
  author: string;
  license: string;
  /** Absent pour le domaine public. */
  licenseUrl?: string;
  /** Page de description du modèle sur la plateforme source. */
  sourceUrl: string;
}

export const SITE_3D_MODELS = {
  jet: {
    src: "/models/jet.glb",
    title: "Jet (chasseur low-poly)",
    author: "jeremy (via Poly Pizza)",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    sourceUrl: "https://poly.pizza/m/6fyLMORhgGK",
  },
  biplane: {
    src: "/models/biplane.glb",
    title: "Airplane (biplan low-poly)",
    author: "Poly by Google (via Poly Pizza)",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    sourceUrl: "https://poly.pizza/m/8VysVKMXN2J",
  },
} as const satisfies Record<string, Site3DModel>;

export type ModelKey = keyof typeof SITE_3D_MODELS;

export function getAll3DModels(): Site3DModel[] {
  return Object.values(SITE_3D_MODELS);
}
