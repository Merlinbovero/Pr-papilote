import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { readingSchema, type Reading } from "./content-schemas";
import { getFicheById, getFicheHref } from "./fiches";

/**
 * Chargement et validation des articles de veille lecture (rubrique
 * « une lecture → des fiches »). Lecture au build uniquement. Un identifiant en
 * double, ou une fiche liée introuvable, FAIT ÉCHOUER LE BUILD : la rubrique ne
 * pointe jamais dans le vide.
 */

const READINGS_DIR = path.join(process.cwd(), "content", "lectures");

const PUBLISHED = new Set(["publie", "a-mettre-a-jour"]);

let cache: Reading[] | undefined;

function readReadings(): Reading[] {
  if (!fs.existsSync(READINGS_DIR)) {
    return [];
  }
  const readings: Reading[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const entry of fs.readdirSync(READINGS_DIR, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".yaml")) {
      continue;
    }
    const file = path.join(entry.parentPath, entry.name);
    const reading = readingSchema.parse(parseYaml(fs.readFileSync(file, "utf-8")));
    if (ids.has(reading.id)) {
      throw new Error(`Veille lecture : identifiant en double « ${reading.id} »`);
    }
    if (slugs.has(reading.slug)) {
      throw new Error(`Veille lecture : slug en double « ${reading.slug} »`);
    }
    for (const ficheId of reading.relatedFiches) {
      if (!getFicheById(ficheId)) {
        throw new Error(`Veille lecture « ${reading.id} » : fiche liée introuvable « ${ficheId} »`);
      }
    }
    ids.add(reading.id);
    slugs.add(reading.slug);
    readings.push(reading);
  }
  // Plus récents d'abord (createdAt décroissant, puis titre pour la stabilité).
  return readings.sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.title.localeCompare(b.title)
      : b.createdAt.localeCompare(a.createdAt)
  );
}

/** Toutes les lectures publiées, de la plus récente à la plus ancienne. */
export function getReadings(): Reading[] {
  if (!cache) {
    cache = readReadings();
  }
  return cache.filter((r) => PUBLISHED.has(r.status));
}

/** Une lecture par slug, ou undefined. */
export function getReadingBySlug(slug: string): Reading | undefined {
  return getReadings().find((r) => r.slug === slug);
}

/** Fiches liées résolues en liens (titre + href), ignorant les inconnues. */
export function resolveReadingFiches(reading: Reading): { title: string; href: string }[] {
  return reading.relatedFiches.flatMap((id) => {
    const fiche = getFicheById(id);
    return fiche ? [{ title: fiche.title, href: getFicheHref(fiche) }] : [];
  });
}

/** Libellés lisibles des natures de lecture. */
export const READING_KIND_LABELS: Record<Reading["kind"], string> = {
  livre: "Livre",
  article: "Article",
  revue: "Revue",
  rapport: "Rapport",
  autre: "Lecture",
};
