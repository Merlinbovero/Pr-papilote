import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { videoSchema, type Video } from "./content-schemas";
import { getFicheById, getFicheHref } from "./fiches";

/**
 * Chargement et validation des articles de veille vidéo (rubrique
 * « une vidéo → des fiches »). Lecture au build uniquement. Un identifiant en
 * double, ou une fiche liée introuvable, FAIT ÉCHOUER LE BUILD : la rubrique ne
 * pointe jamais dans le vide.
 */

const VIDEOS_DIR = path.join(process.cwd(), "content", "videos");

const PUBLISHED = new Set(["publie", "a-mettre-a-jour"]);

let cache: Video[] | undefined;

function readVideos(): Video[] {
  if (!fs.existsSync(VIDEOS_DIR)) {
    return [];
  }
  const videos: Video[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const entry of fs.readdirSync(VIDEOS_DIR, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".yaml")) {
      continue;
    }
    const file = path.join(entry.parentPath, entry.name);
    const video = videoSchema.parse(parseYaml(fs.readFileSync(file, "utf-8")));
    if (ids.has(video.id)) {
      throw new Error(`Veille vidéo : identifiant en double « ${video.id} »`);
    }
    if (slugs.has(video.slug)) {
      throw new Error(`Veille vidéo : slug en double « ${video.slug} »`);
    }
    for (const ficheId of video.relatedFiches) {
      if (!getFicheById(ficheId)) {
        throw new Error(`Veille vidéo « ${video.id} » : fiche liée introuvable « ${ficheId} »`);
      }
    }
    ids.add(video.id);
    slugs.add(video.slug);
    videos.push(video);
  }
  // Plus récents d'abord (createdAt décroissant, puis titre pour la stabilité).
  return videos.sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.title.localeCompare(b.title)
      : b.createdAt.localeCompare(a.createdAt)
  );
}

/** Tous les articles de veille publiés, du plus récent au plus ancien. */
export function getVideos(): Video[] {
  if (!cache) {
    cache = readVideos();
  }
  return cache.filter((v) => PUBLISHED.has(v.status));
}

/** Un article de veille par slug, ou undefined. */
export function getVideoBySlug(slug: string): Video | undefined {
  return getVideos().find((v) => v.slug === slug);
}

/** Fiches liées résolues en liens (titre + href), ignorant les inconnues. */
export function resolveRelatedFiches(video: Video): { title: string; href: string }[] {
  return video.relatedFiches.flatMap((id) => {
    const fiche = getFicheById(id);
    return fiche ? [{ title: fiche.title, href: getFicheHref(fiche) }] : [];
  });
}
