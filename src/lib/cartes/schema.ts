import { z } from "zod";

/**
 * Contrat des implantations cartographiées
 * (docs/editorial/cartes-des-bases.md). Données publiques, localisation
 * COMMUNALE uniquement — le module pur est importable côté client.
 */

const slugSchema = z.string().regex(/^[a-z0-9-]+$/);
const contentIdSchema = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/);

export const IMPLANTATION_ROLES = [
  "ecole",
  "chasse",
  "transport",
  "helicopteres",
  "patrouille-maritime",
  "ravitaillement",
  "essais",
  "soutien",
  "etat-major",
] as const;

export const ROLE_LABELS: Record<(typeof IMPLANTATION_ROLES)[number], string> = {
  ecole: "École",
  chasse: "Chasse",
  transport: "Transport",
  helicopteres: "Hélicoptères",
  "patrouille-maritime": "Patrouille maritime",
  ravitaillement: "Ravitaillement",
  essais: "Essais et expérimentation",
  soutien: "Soutien",
  "etat-major": "État-major",
};

export const implantationSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  code: z.string().min(1),
  ville: z.string().min(1),
  departement: z.string().min(1),
  armee: z.enum(["marine", "air", "terre"]),
  statut: z.enum(["active", "historique"]),
  roles: z.array(z.enum(IMPLANTATION_ROLES)).min(1),
  /** Coordonnées de la COMMUNE (2 décimales) — jamais d'emprise précise. */
  lat: z.number().min(41).max(52),
  lon: z.number().min(-6).max(10),
  ficheId: contentIdSchema.optional(),
  liens: z.array(contentIdSchema).default([]),
});

export const implantationsFileSchema = z.object({
  implantations: z.array(implantationSchema).min(1),
});

export type Implantation = z.infer<typeof implantationSchema>;

/** Implantation enrichie des libellés de liens résolus (côté serveur). */
export interface ImplantationView extends Implantation {
  ficheHref?: string;
  liensResolus: { label: string; href: string }[];
}

// ---------------------------------------------------------------------------
// Projection — équirectangulaire corrigée en latitude, boîte métropole.
// ---------------------------------------------------------------------------

export const MAP_WIDTH = 600;
export const MAP_HEIGHT = 620;

const LAT_MIN = 41.2;
const LAT_MAX = 51.3;
const LON_MIN = -5.4;
const LON_MAX = 9.8;
const COS_MID = Math.cos((46.25 * Math.PI) / 180);

/** Projette (lat, lon) vers les coordonnées SVG de la carte. */
export function project(lat: number, lon: number): { x: number; y: number } {
  const spanLon = (LON_MAX - LON_MIN) * COS_MID;
  const spanLat = LAT_MAX - LAT_MIN;
  const scale = Math.min(MAP_WIDTH / spanLon, MAP_HEIGHT / spanLat);
  const x = (lon - LON_MIN) * COS_MID * scale;
  const y = (LAT_MAX - lat) * scale;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/**
 * Contour très simplifié de la métropole (côtes et frontières approchées
 * par des points de repère publics, dans l'ordre du tracé) — un fond
 * pédagogique original, pas une carte de précision.
 */
const OUTLINE_POINTS: [number, number][] = [
  [51.05, 2.37], // Dunkerque
  [50.95, 1.85], // Calais
  [50.1, 1.45], // Baie de Somme
  [49.49, 0.11], // Le Havre
  [49.39, -0.9], // Côte du Calvados
  [49.67, -1.62], // Cherbourg
  [48.84, -1.6], // Baie du Mont-Saint-Michel
  [48.65, -2.02], // Saint-Malo
  [48.73, -3.46], // Côte de granit rose
  [48.45, -4.8], // Pointe de Corsen (Brest)
  [48.03, -4.73], // Pointe du Raz
  [47.8, -4.35], // Pays bigouden
  [47.65, -3.15], // Lorient
  [47.27, -2.35], // Saint-Nazaire
  [46.9, -2.15], // Vendée
  [46.15, -1.25], // La Rochelle
  [45.6, -1.25], // Estuaire de la Gironde
  [44.65, -1.25], // Bassin d'Arcachon
  [43.48, -1.56], // Biarritz
  [43.3, -0.9], // Piémont pyrénéen ouest
  [42.85, -0.1], // Pyrénées centrales
  [42.5, 1.95], // Pyrénées orientales
  [42.45, 3.16], // Cerbère
  [43.0, 3.05], // Narbonne
  [43.55, 3.9], // Montpellier
  [43.35, 4.85], // Camargue
  [43.3, 5.37], // Marseille
  [43.05, 6.15], // Toulon
  [43.55, 7.02], // Esterel
  [43.7, 7.27], // Nice
  [43.78, 7.53], // Menton
  [44.35, 6.9], // Alpes du Sud
  [45.1, 6.75], // Alpes (Maurienne)
  [45.9, 6.8], // Mont-Blanc
  [46.3, 6.25], // Léman
  [46.95, 6.95], // Jura
  [47.59, 7.59], // Bâle
  [48.58, 7.8], // Strasbourg
  [48.97, 8.23], // Lauterbourg
  [49.2, 6.7], // Sarre
  [49.47, 5.98], // Luxembourg
  [49.8, 4.9], // Ardennes
  [50.17, 4.1], // Sambre
  [50.63, 3.06], // Lille
  [50.87, 2.6], // Flandre
];

const CORSICA_POINTS: [number, number][] = [
  [43.0, 9.42], // Cap Corse
  [42.55, 9.53], // Bastia
  [41.95, 9.4], // Côte orientale
  [41.4, 9.22], // Bonifacio
  [41.85, 8.75], // Ajaccio
  [42.35, 8.55], // Golfe de Porto
  [42.68, 9.3], // Saint-Florent
];

function toPath(points: [number, number][]): string {
  return (
    points
      .map(([lat, lon], index) => {
        const { x, y } = project(lat, lon);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ") + " Z"
  );
}

export const FRANCE_OUTLINE_PATH = toPath(OUTLINE_POINTS);
export const CORSICA_OUTLINE_PATH = toPath(CORSICA_POINTS);
