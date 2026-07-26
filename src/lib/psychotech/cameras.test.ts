import { describe, expect, it } from "vitest";

import {
  buildCameraSession,
  CAMERA_FORMATS,
  CAMERA_LEVEL_LIST,
  CAMERA_LEVELS,
  generateCameraPuzzle,
  levelForPosition,
  occlusionPairs,
  scoreCameraSession,
  sightingFor,
  signatureDistance,
  viewSignature,
  visibleSightings,
  type CameraLevel,
  type CameraPuzzle,
  type SceneCamera,
  type SceneObject,
} from "@/lib/psychotech/cameras";

const LEVELS: CameraLevel[] = [1, 2, 3];

function sample(level: CameraLevel, count = 60): CameraPuzzle[] {
  return Array.from({ length: count }, (_, i) => generateCameraPuzzle(i * 37 + level, level));
}

function object(id: number, x: number, z: number, radius = 0.5): SceneObject {
  return { id, shape: "cube", x, z, radius, height: 1, tone: id };
}

/** Un appareil posé sur l'axe des z négatifs, visant l'origine. */
function camera(label: number, x: number, z: number): SceneCamera {
  return { label, x, z, yaw: Math.atan2(-x, -z) };
}

describe("géométrie de la prise de vue", () => {
  it("place droit devant un objet aligné avec la visée", () => {
    const sighting = sightingFor(camera(1, 0, -10), object(1, 0, 0));
    expect(Math.abs(sighting.bearing)).toBeLessThan(1e-9);
    expect(sighting.distance).toBeCloseTo(10);
  });

  it("met à droite ce qui est à droite de l’objectif", () => {
    // Appareil en (0,-10) regardant vers +z : un objet en x positif est à droite.
    const sighting = sightingFor(camera(1, 0, -10), object(1, 3, 0));
    expect(sighting.bearing).toBeGreaterThan(0);
  });

  it("et à gauche ce qui est à gauche", () => {
    const sighting = sightingFor(camera(1, 0, -10), object(1, -3, 0));
    expect(sighting.bearing).toBeLessThan(0);
  });

  it("rend un objet lointain plus étroit qu’un objet proche", () => {
    const near = sightingFor(camera(1, 0, -10), object(1, 0, -5));
    const far = sightingFor(camera(1, 0, -10), object(2, 0, 5));
    expect(near.halfWidth).toBeGreaterThan(far.halfWidth);
  });

  it("écarte du champ ce qui est derrière l’objectif", () => {
    const seen = visibleSightings(camera(1, 0, -10), [object(1, 0, -14), object(2, 0, 0)]);
    expect(seen.map((s) => s.id)).toEqual([2]);
  });

  it("trie les objets de gauche à droite", () => {
    const seen = visibleSightings(camera(1, 0, -10), [
      object(1, 2, 0),
      object(2, -2, 0),
      object(3, 0, 0),
    ]);
    expect(seen.map((s) => s.id)).toEqual([2, 3, 1]);
  });
});

describe("occultations", () => {
  it("déclare que le plus proche masque le plus lointain quand ils s’alignent", () => {
    const cam = camera(1, 0, -10);
    const seen = visibleSightings(cam, [object(1, 0, -2), object(2, 0, 4)]);
    expect(occlusionPairs(seen)).toEqual(["1>2"]);
  });

  it("ne voit pas d’occultation entre deux objets bien écartés", () => {
    const cam = camera(1, 0, -10);
    const seen = visibleSightings(cam, [object(1, -3, 0), object(2, 3, 0)]);
    expect(occlusionPairs(seen)).toEqual([]);
  });
});

describe("signature de vue", () => {
  it("ne distingue pas une vue d’elle-même", () => {
    const objects = [object(1, -2, 0), object(2, 2, 0), object(3, 0, 3)];
    const signature = viewSignature(camera(1, 0, -10), objects);
    expect(signatureDistance(signature, signature)).toBe(0);
  });

  it("sépare deux appareils opposés — l’ordre gauche-droite s’inverse", () => {
    const objects = [object(1, -2, 0), object(2, 2, 0)];
    const a = viewSignature(camera(1, 0, -10), objects);
    const b = viewSignature(camera(2, 0, 10), objects);
    expect(a.order).toEqual([1, 2]);
    expect(b.order).toEqual([2, 1]);
    expect(signatureDistance(a, b)).toBeGreaterThan(0);
  });

  it("compte comme écart un objet visible d’un seul des deux appareils", () => {
    const objects = [object(1, 0, 0), object(2, 0, 20)];
    const a = viewSignature(camera(1, 0, -10), objects);
    const b = viewSignature(camera(2, 0, 24), objects);
    expect(signatureDistance(a, b)).toBeGreaterThanOrEqual(2);
  });
});

describe("génération des questions", () => {
  it.each(LEVELS)("niveau %i : trois appareils numérotés 1, 2, 3", (level) => {
    for (const puzzle of sample(level)) {
      expect(puzzle.cameras).toHaveLength(3);
      expect(puzzle.cameras.map((c) => c.label)).toEqual([1, 2, 3]);
    }
  });

  it.each(LEVELS)("niveau %i : la réponse désigne un appareil existant", (level) => {
    for (const puzzle of sample(level)) {
      expect(puzzle.answerIndex).toBeGreaterThanOrEqual(0);
      expect(puzzle.answerIndex).toBeLessThan(3);
    }
  });

  it.each(LEVELS)("niveau %i : le bon appareil voit au moins trois objets", (level) => {
    for (const puzzle of sample(level)) {
      const seen = viewSignature(puzzle.cameras[puzzle.answerIndex], puzzle.objects);
      expect(seen.order.length).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(LEVELS)("niveau %i : aucune question indécidable", (level) => {
    for (const puzzle of sample(level, 120)) {
      const good = viewSignature(puzzle.cameras[puzzle.answerIndex], puzzle.objects);
      for (let i = 0; i < 3; i += 1) {
        if (i === puzzle.answerIndex) continue;
        const other = viewSignature(puzzle.cameras[i], puzzle.objects);
        expect(signatureDistance(good, other)).toBeGreaterThan(0);
      }
    }
  });

  it("respecte l’exigence de netteté propre au niveau, sauf repli assumé", () => {
    for (const level of LEVELS) {
      const puzzles = sample(level, 60);
      const meets = puzzles.filter((puzzle) => {
        const good = viewSignature(puzzle.cameras[puzzle.answerIndex], puzzle.objects);
        const distances = puzzle.cameras
          .map((camera, i) =>
            i === puzzle.answerIndex
              ? Infinity
              : signatureDistance(good, viewSignature(camera, puzzle.objects))
          )
          .filter((d) => Number.isFinite(d));
        return Math.min(...distances) >= CAMERA_LEVELS[level].minDistance;
      });
      // On tolère quelques replis, jamais une majorité.
      expect(meets.length / puzzles.length).toBeGreaterThan(0.9);
    }
  });

  it.each(LEVELS)("niveau %i : le bon nombre d’objets, tous distincts de forme", (level) => {
    for (const puzzle of sample(level)) {
      expect(puzzle.objects).toHaveLength(CAMERA_LEVELS[level].objects);
      const shapes = puzzle.objects.map((o) => o.shape);
      expect(new Set(shapes).size).toBe(shapes.length);
    }
  });

  it.each(LEVELS)("niveau %i : aucun objet n’en chevauche un autre au sol", (level) => {
    for (const puzzle of sample(level)) {
      for (let i = 0; i < puzzle.objects.length; i += 1) {
        for (let j = i + 1; j < puzzle.objects.length; j += 1) {
          const a = puzzle.objects[i];
          const b = puzzle.objects[j];
          expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThan(a.radius + b.radius);
        }
      }
    }
  });

  it("resserre les points de vue à mesure que le niveau monte", () => {
    const spread = (level: CameraLevel) => {
      const puzzles = sample(level, 40);
      const gaps = puzzles.flatMap((puzzle) => {
        const angles = puzzle.cameras.map((c) => Math.atan2(c.x, c.z));
        return [Math.abs(angles[1] - angles[0]), Math.abs(angles[2] - angles[1])];
      });
      return gaps.reduce((a, b) => a + b, 0) / gaps.length;
    };
    expect(spread(1)).toBeGreaterThan(spread(3));
  });

  it("donne la même question pour la même graine", () => {
    expect(generateCameraPuzzle(123, 2)).toEqual(generateCameraPuzzle(123, 2));
    expect(generateCameraPuzzle(123, 2)).not.toEqual(generateCameraPuzzle(124, 2));
  });

  it("explique toujours pourquoi les deux autres appareils sont exclus", () => {
    for (const level of LEVELS) {
      for (const puzzle of sample(level, 30)) {
        expect(puzzle.explanation).toContain(
          `appareil ${puzzle.cameras[puzzle.answerIndex].label}`
        );
        expect(puzzle.explanation.length).toBeGreaterThan(40);
      }
    }
  });
});

describe("formats et notation", () => {
  it("annonce le format officiel des sélections", () => {
    expect(CAMERA_FORMATS.officiel.size).toBe(30);
    expect(CAMERA_FORMATS.officiel.durationSeconds).toBe(480);
  });

  it("garde la même cadence en format court", () => {
    const pace = (f: { size: number; durationSeconds: number }) => f.durationSeconds / f.size;
    expect(pace(CAMERA_FORMATS.court)).toBeCloseTo(pace(CAMERA_FORMATS.officiel), 0);
  });

  it("monte en difficulté au fil de la session", () => {
    expect(levelForPosition(0, 30)).toBe(1);
    expect(levelForPosition(15, 30)).toBe(2);
    expect(levelForPosition(29, 30)).toBe(3);
  });

  it("compose une session complète", () => {
    const session = buildCameraSession(9, "court");
    expect(session).toHaveLength(10);
    expect(session[0].level).toBe(1);
    expect(session[9].level).toBe(3);
  });

  it("rejoue la même session pour la même graine", () => {
    expect(buildCameraSession(2026, "court")).toEqual(buildCameraSession(2026, "court"));
  });

  it("compte les bonnes réponses et les questions traitées", () => {
    const puzzles = buildCameraSession(5, "court");
    const answers = puzzles.map((p, i) => (i < 6 ? p.answerIndex : null));
    const score = scoreCameraSession(puzzles, answers);
    expect(score.total).toBe(10);
    expect(score.correct).toBe(6);
    expect(score.answered).toBe(6);
    expect(score.precision).toBe(60);
  });

  it("ne crédite rien pour une session laissée vide", () => {
    const puzzles = buildCameraSession(5, "court");
    expect(scoreCameraSession(puzzles, []).correct).toBe(0);
  });

  it("décrit trois niveaux, du plus au moins tranché", () => {
    expect(CAMERA_LEVEL_LIST).toHaveLength(3);
    expect(CAMERA_LEVEL_LIST[0].minSeparationDeg).toBeGreaterThan(
      CAMERA_LEVEL_LIST[2].minSeparationDeg
    );
  });
});
