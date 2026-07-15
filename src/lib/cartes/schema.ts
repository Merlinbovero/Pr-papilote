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
  "souverainete",
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
  souverainete: "Souveraineté",
  "etat-major": "État-major",
};

/** Zones géographiques (métropole + outre-mer) — pilotent le rendu en inset. */
export const IMPLANTATION_ZONES = [
  "metropole",
  "antilles",
  "guyane",
  "reunion",
  "mayotte",
  "nouvelle-caledonie",
  "polynesie",
] as const;

export const ZONE_LABELS: Record<(typeof IMPLANTATION_ZONES)[number], string> = {
  metropole: "Métropole",
  antilles: "Antilles",
  guyane: "Guyane",
  reunion: "La Réunion",
  mayotte: "Mayotte",
  "nouvelle-caledonie": "Nouvelle-Calédonie",
  polynesie: "Polynésie française",
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
  /** Zone géographique — « metropole » par défaut, sinon outre-mer (inset). */
  zone: z.enum(IMPLANTATION_ZONES).default("metropole"),
  /** Coordonnées de la COMMUNE (2 décimales) — jamais d'emprise précise. */
  lat: z.number().min(-25).max(52),
  lon: z.number().min(-180).max(180),
  ficheId: contentIdSchema.optional(),
  liens: z.array(contentIdSchema).default([]),
});

export const implantationsFileSchema = z.object({
  implantations: z.array(implantationSchema).min(1),
});

export type Implantation = z.infer<typeof implantationSchema>;

/**
 * Implantation enrichie (côté serveur) : liens résolus + position projetée
 * (x, y) sur le fond de carte, calculée par src/lib/cartes/geo.ts.
 */
export interface ImplantationView extends Implantation {
  ficheHref?: string;
  liensResolus: { label: string; href: string }[];
  x: number;
  y: number;
}
