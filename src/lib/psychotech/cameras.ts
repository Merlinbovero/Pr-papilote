import { createRng } from "@/features/quiz/engine";

/**
 * Test des appareils photos — génération et notation, logique pure sans rendu.
 *
 * Une scène contient quelques objets posés au sol et **trois appareils
 * numérotés**, chacun à une position et une orientation distinctes. Une seule
 * vue est montrée : laquelle des trois l'a prise ?
 *
 * Toute la difficulté du générateur tient en une phrase : **garantir qu'une
 * seule des trois réponses est défendable**. Trois caméras tirées au hasard
 * donnent vite deux vues quasi identiques — scène symétrique, objectifs trop
 * proches, objets alignés. La question devient alors indécidable, et le
 * candidat a raison de ne pas pouvoir trancher : c'est le générateur qui est
 * fautif. D'où la **signature de vue** ci-dessous, comparée entre les trois
 * caméras avant de retenir une question.
 */

export type Rng = () => number;

/** Formes disponibles — choisies pour être reconnaissables en silhouette. */
export type SceneShape = "cube" | "cone" | "cylindre" | "sphere" | "pyramide" | "tore";

export const SCENE_SHAPES: readonly SceneShape[] = [
  "cube",
  "cone",
  "cylindre",
  "sphere",
  "pyramide",
  "tore",
];

/** Un objet posé au sol. `x` et `z` sont les coordonnées au sol, `y` est la hauteur. */
export interface SceneObject {
  id: number;
  shape: SceneShape;
  x: number;
  z: number;
  /** Demi-largeur au sol — sert au calcul d'occultation. */
  radius: number;
  /** Hauteur de l'objet. */
  height: number;
  /** Index de teinte dans la palette du rendu (jamais une couleur brute ici). */
  tone: number;
}

/** Un appareil photo : sa position au sol et la direction qu'il vise. */
export interface SceneCamera {
  /** Numéro affiché au candidat (1, 2, 3). */
  label: number;
  x: number;
  z: number;
  /** Cap visé, en radians, dans le plan du sol. */
  yaw: number;
}

export type CameraLevel = 1 | 2 | 3;

export interface CameraPuzzle {
  level: CameraLevel;
  objects: SceneObject[];
  cameras: SceneCamera[];
  /** Index dans `cameras` de celui qui a pris la vue montrée. */
  answerIndex: number;
  /** Ce qui distingue la bonne vue des deux autres, pour la correction. */
  explanation: string;
}

/** Champ de vision horizontal des appareils (radians) — 60°, comme un 35 mm. */
export const CAMERA_FOV = (60 * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Signature de vue
// ---------------------------------------------------------------------------

/** Ce qu'un appareil voit d'un objet donné. */
export interface ObjectSighting {
  id: number;
  /** Écart angulaire au centre de visée : négatif à gauche, positif à droite. */
  bearing: number;
  /** Distance de l'objectif à l'objet. */
  distance: number;
  /** Demi-largeur apparente (radians). */
  halfWidth: number;
}

/**
 * Ce qui caractérise une vue, indépendamment du rendu :
 * l'ordre gauche-droite des objets visibles, et qui masque qui.
 */
export interface ViewSignature {
  /** Identifiants des objets visibles, de gauche à droite. */
  order: number[];
  /** Paires « A masque B », A étant devant. Triées, pour être comparables. */
  occlusions: string[];
}

/** Où se trouve un objet dans le champ d'un appareil. */
export function sightingFor(camera: SceneCamera, object: SceneObject): ObjectSighting {
  const dx = object.x - camera.x;
  const dz = object.z - camera.z;
  const distance = Math.hypot(dx, dz);
  // Angle de l'objet dans le repère de l'appareil : 0 droit devant.
  const absolute = Math.atan2(dx, dz);
  let bearing = absolute - camera.yaw;
  while (bearing > Math.PI) bearing -= 2 * Math.PI;
  while (bearing < -Math.PI) bearing += 2 * Math.PI;
  const halfWidth = distance > 0 ? Math.atan(object.radius / distance) : Math.PI / 2;
  return { id: object.id, bearing, distance, halfWidth };
}

/** Les objets réellement dans le champ, du plus à gauche au plus à droite. */
export function visibleSightings(
  camera: SceneCamera,
  objects: readonly SceneObject[]
): ObjectSighting[] {
  const half = CAMERA_FOV / 2;
  return (
    objects
      .map((object) => sightingFor(camera, object))
      // Un objet compte s'il est devant l'appareil et que son centre entre dans le champ.
      .filter((s) => Math.abs(s.bearing) < half && s.distance > 0.3)
      .sort((a, b) => a.bearing - b.bearing)
  );
}

/**
 * Deux objets se chevauchent à l'écran si leurs intervalles angulaires se
 * recoupent ; le plus proche masque l'autre. Le recouvrement doit être franc —
 * sinon on parlerait d'occultation pour deux silhouettes qui se frôlent.
 */
const OVERLAP_RATIO = 0.35;

export function occlusionPairs(sightings: readonly ObjectSighting[]): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < sightings.length; i += 1) {
    for (let j = i + 1; j < sightings.length; j += 1) {
      const a = sightings[i];
      const b = sightings[j];
      const gap = Math.abs(a.bearing - b.bearing);
      const reach = a.halfWidth + b.halfWidth;
      if (gap >= reach * (1 - OVERLAP_RATIO)) continue;
      const [front, back] = a.distance <= b.distance ? [a, b] : [b, a];
      pairs.push(`${front.id}>${back.id}`);
    }
  }
  return pairs.sort();
}

export function viewSignature(camera: SceneCamera, objects: readonly SceneObject[]): ViewSignature {
  const sightings = visibleSightings(camera, objects);
  return { order: sightings.map((s) => s.id), occlusions: occlusionPairs(sightings) };
}

/**
 * De combien deux vues diffèrent. Zéro = indiscernables, donc question à
 * rejeter. On additionne trois écarts, du plus au moins évident :
 * objets présents ou absents, ordre gauche-droite, occultations.
 */
export function signatureDistance(a: ViewSignature, b: ViewSignature): number {
  const setA = new Set(a.order);
  const setB = new Set(b.order);
  let distance = 0;

  // 1. Un objet visible d'un côté et pas de l'autre : l'écart le plus lisible.
  for (const id of setA) if (!setB.has(id)) distance += 2;
  for (const id of setB) if (!setA.has(id)) distance += 2;

  // 2. Inversions dans l'ordre gauche-droite, sur les objets communs.
  const common = a.order.filter((id) => setB.has(id));
  const rankB = new Map(b.order.map((id, i) => [id, i]));
  for (let i = 0; i < common.length; i += 1) {
    for (let j = i + 1; j < common.length; j += 1) {
      const ri = rankB.get(common[i]);
      const rj = rankB.get(common[j]);
      if (ri !== undefined && rj !== undefined && ri > rj) distance += 1;
    }
  }

  // 3. Occultations propres à l'une des deux vues.
  const occA = new Set(a.occlusions);
  const occB = new Set(b.occlusions);
  for (const pair of occA) if (!occB.has(pair)) distance += 1;
  for (const pair of occB) if (!occA.has(pair)) distance += 1;

  return distance;
}

// ---------------------------------------------------------------------------
// Niveaux
// ---------------------------------------------------------------------------

export interface CameraLevelInfo {
  level: CameraLevel;
  label: string;
  hint: string;
  objects: number;
  /** Écart angulaire minimal entre deux appareils (degrés). */
  minSeparationDeg: number;
  /** Écart angulaire maximal — plus il est petit, plus les vues se ressemblent. */
  maxSeparationDeg: number;
  /** Distance de signature exigée entre la bonne vue et chaque distracteur. */
  minDistance: number;
}

export const CAMERA_LEVELS: Record<CameraLevel, CameraLevelInfo> = {
  1: {
    level: 1,
    label: "Appareils bien séparés",
    hint: "Les trois points de vue sont franchement distincts.",
    objects: 4,
    minSeparationDeg: 75,
    maxSeparationDeg: 150,
    minDistance: 4,
  },
  2: {
    level: 2,
    label: "Appareils rapprochés",
    hint: "Les points de vue se resserrent : l’ordre des objets départage.",
    objects: 5,
    minSeparationDeg: 40,
    maxSeparationDeg: 90,
    minDistance: 3,
  },
  3: {
    level: 3,
    label: "Vues voisines",
    hint: "Seule une occultation ou un détail d’alignement tranche.",
    objects: 6,
    minSeparationDeg: 22,
    maxSeparationDeg: 55,
    minDistance: 2,
  },
};

export const CAMERA_LEVEL_LIST: readonly CameraLevelInfo[] = [
  CAMERA_LEVELS[1],
  CAMERA_LEVELS[2],
  CAMERA_LEVELS[3],
];

// ---------------------------------------------------------------------------
// Génération
// ---------------------------------------------------------------------------

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function range(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Rayon du cercle sur lequel les appareils sont posés. */
const CAMERA_RING = 9;
/** Étendue au sol dans laquelle les objets sont dispersés. */
const SCENE_SPREAD = 3.4;
/** Écart minimal entre deux objets, pour qu'aucun n'en avale un autre. */
const MIN_OBJECT_GAP = 1.5;

function placeObjects(rng: Rng, count: number): SceneObject[] {
  const objects: SceneObject[] = [];
  const shapes = [...SCENE_SHAPES];
  let attempts = 0;
  while (objects.length < count && attempts < 400) {
    attempts += 1;
    const x = range(rng, -SCENE_SPREAD, SCENE_SPREAD);
    const z = range(rng, -SCENE_SPREAD, SCENE_SPREAD);
    if (objects.some((o) => Math.hypot(o.x - x, o.z - z) < MIN_OBJECT_GAP)) continue;
    const shapeIndex = int(rng, 0, shapes.length - 1);
    const [shape] = shapes.splice(shapeIndex, 1);
    objects.push({
      id: objects.length + 1,
      shape,
      x: Number(x.toFixed(3)),
      z: Number(z.toFixed(3)),
      radius: Number(range(rng, 0.42, 0.62).toFixed(3)),
      height: Number(range(rng, 0.8, 1.7).toFixed(3)),
      tone: objects.length,
    });
  }
  return objects;
}

/** Trois appareils sur l'anneau, séparés dans la fourchette du niveau. */
function placeCameras(rng: Rng, info: CameraLevelInfo): SceneCamera[] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const start = rng() * Math.PI * 2;
  const gapA = toRad(range(rng, info.minSeparationDeg, info.maxSeparationDeg));
  const gapB = toRad(range(rng, info.minSeparationDeg, info.maxSeparationDeg));
  const angles = [start, start + gapA, start + gapA + gapB];
  return angles.map((angle, i) => {
    const x = Math.sin(angle) * CAMERA_RING;
    const z = Math.cos(angle) * CAMERA_RING;
    // Chaque appareil vise le centre de la scène, à un léger décentrage près.
    const jitter = range(rng, -0.12, 0.12);
    return {
      label: i + 1,
      x: Number(x.toFixed(3)),
      z: Number(z.toFixed(3)),
      yaw: Math.atan2(-x, -z) + jitter,
    };
  });
}

/** Ce qui distingue la bonne vue des deux autres — texte de correction. */
function explain(
  puzzleObjects: readonly SceneObject[],
  cameras: readonly SceneCamera[],
  answerIndex: number
): string {
  const good = viewSignature(cameras[answerIndex], puzzleObjects);
  const others = cameras
    .map((camera, i) => ({ i, signature: viewSignature(camera, puzzleObjects) }))
    .filter((entry) => entry.i !== answerIndex);

  const reasons: string[] = [];
  for (const other of others) {
    const label = cameras[other.i].label;
    const missing = good.order.filter((id) => !other.signature.order.includes(id));
    const extra = other.signature.order.filter((id) => !good.order.includes(id));
    if (missing.length > 0) {
      reasons.push(
        `l’appareil ${label} ne voit pas l’objet ${missing[0]}, pourtant présent sur la vue`
      );
    } else if (extra.length > 0) {
      reasons.push(`l’appareil ${label} verrait aussi l’objet ${extra[0]}, absent de la vue`);
    } else if (good.order.join() !== other.signature.order.join()) {
      // On nomme le premier objet qui bouge : « un autre ordre » n'apprend rien.
      const pivot = good.order.findIndex((id, i) => other.signature.order[i] !== id);
      reasons.push(
        pivot >= 0
          ? `depuis l’appareil ${label}, ce serait l’objet ${other.signature.order[pivot]} qui occuperait cette place, pas l’objet ${good.order[pivot]}`
          : `depuis l’appareil ${label}, les objets se présenteraient dans un autre ordre`
      );
    } else {
      const diff = good.occlusions.filter((p) => !other.signature.occlusions.includes(p));
      reasons.push(
        diff.length > 0
          ? `depuis l’appareil ${label}, l’objet ${diff[0].split(">")[1]} ne serait pas masqué`
          : `l’appareil ${label} donnerait un alignement différent`
      );
    }
  }
  return `Ce que vous voyez ne peut venir que de l’appareil ${cameras[answerIndex].label} : ${reasons.join(" ; ")}.`;
}

/**
 * Une question entièrement déterminée par sa graine. La boucle rejette les
 * scènes dont deux vues se ressemblent trop : mieux vaut retirer que servir
 * une question sans réponse défendable.
 */
export function generateCameraPuzzle(seed: number, level: CameraLevel): CameraPuzzle {
  const info = CAMERA_LEVELS[level];
  let fallback: CameraPuzzle | null = null;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const rng = createRng(seed + attempt * 7919);
    const objects = placeObjects(rng, info.objects);
    if (objects.length < info.objects) continue;
    const cameras = placeCameras(rng, info);
    const answerIndex = int(rng, 0, 2);

    const signatures = cameras.map((camera) => viewSignature(camera, objects));
    // Une vue vide ou presque ne se compare à rien.
    if (signatures[answerIndex].order.length < 3) continue;

    const distances = signatures
      .map((signature, i) =>
        i === answerIndex ? Infinity : signatureDistance(signatures[answerIndex], signature)
      )
      .filter((d) => Number.isFinite(d));

    const puzzle: CameraPuzzle = {
      level,
      objects,
      cameras,
      answerIndex,
      explanation: explain(objects, cameras, answerIndex),
    };

    if (Math.min(...distances) >= info.minDistance) return puzzle;
    // On garde la moins mauvaise au cas où la graine serait très défavorable.
    if (!fallback && Math.min(...distances) > 0) fallback = puzzle;
  }

  // Repli : une question un peu moins tranchée vaut mieux qu'aucune question,
  // et le niveau 1 y échappe de toute façon.
  return fallback ?? generateCameraPuzzle(seed + 104_729, level === 3 ? 2 : level);
}

// ---------------------------------------------------------------------------
// Formats et notation
// ---------------------------------------------------------------------------

export type CameraFormatKey = "officiel" | "court";

export interface CameraFormat {
  key: CameraFormatKey;
  label: string;
  size: number;
  durationSeconds: number;
  hint: string;
}

/**
 * Le format officiel est serré : **30 questions en 8 minutes**, soit 16 s
 * l'unité. Le format court garde exactement la même cadence — seule la
 * longueur change, si bien qu'un score reste comparable d'un format à l'autre.
 */
export const CAMERA_FORMATS: Record<CameraFormatKey, CameraFormat> = {
  officiel: {
    key: "officiel",
    label: "Test officiel",
    size: 30,
    durationSeconds: 8 * 60,
    hint: "Le format des sélections : 30 vues en 8 minutes.",
  },
  court: {
    key: "court",
    label: "Format court",
    size: 10,
    durationSeconds: 160,
    hint: "Même rythme, session express — pour s’échauffer.",
  },
};

/**
 * La difficulté monte au fil de la session, comme au test réel : le premier
 * tiers sépare franchement les appareils, le dernier les resserre.
 */
export function levelForPosition(index: number, size: number): CameraLevel {
  const third = size / 3;
  if (index < third) return 1;
  if (index < third * 2) return 2;
  return 3;
}

export function buildCameraSession(seed: number, format: CameraFormatKey): CameraPuzzle[] {
  const { size } = CAMERA_FORMATS[format];
  return Array.from({ length: size }, (_, i) =>
    generateCameraPuzzle(seed + i * 1301, levelForPosition(i, size))
  );
}

export interface CameraScore {
  correct: number;
  answered: number;
  total: number;
  /** Pourcentage de bonnes réponses sur l'ensemble des questions. */
  precision: number;
}

export function scoreCameraSession(
  puzzles: readonly CameraPuzzle[],
  answers: readonly (number | null)[]
): CameraScore {
  let correct = 0;
  let answered = 0;
  puzzles.forEach((puzzle, i) => {
    const answer = answers[i];
    if (answer === null || answer === undefined) return;
    answered += 1;
    if (answer === puzzle.answerIndex) correct += 1;
  });
  const total = puzzles.length;
  return {
    correct,
    answered,
    total,
    precision: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}
