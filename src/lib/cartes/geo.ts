import fs from "node:fs";
import path from "node:path";

/**
 * Fond de carte de France métropolitaine (design pass D3) — serveur uniquement.
 * Lit content/_referentiels/france-map.json (tracés SVG des régions + descripteur
 * de projection Mercator), généré par scripts/generate-france-map.mjs à partir
 * de données publiques (france-geojson / IGN). La projection ci-dessous est la
 * même que celle du script : les marqueurs tombent exactement sur le fond.
 */

interface FranceMapData {
  width: number;
  height: number;
  projection: { minX: number; maxY: number; scale: number; padX: number; padY: number };
  regions: { code: string; nom: string; path: string }[];
}

let cache: FranceMapData | undefined;

function load(): FranceMapData {
  if (!cache) {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "content", "_referentiels", "france-map.json"),
      "utf-8"
    );
    cache = JSON.parse(raw) as FranceMapData;
  }
  return cache;
}

export interface FranceMap {
  width: number;
  height: number;
  regions: { code: string; nom: string; path: string }[];
}

/** Fond de carte (dimensions + tracés des régions) à passer au composant client. */
export function getFranceMap(): FranceMap {
  const d = load();
  return { width: d.width, height: d.height, regions: d.regions };
}

const DEG2RAD = Math.PI / 180;

/** Projette (lat, lon) vers les coordonnées SVG du fond de carte. */
export function project(lat: number, lon: number): { x: number; y: number } {
  const { minX, maxY, scale, padX, padY } = load().projection;
  const x = padX + (lon * DEG2RAD - minX) * scale;
  const y = padY + (maxY - Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2))) * scale;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
