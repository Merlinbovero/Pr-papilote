/**
 * Génère le fond de carte de France métropolitaine (design pass D3) à partir
 * d'un GeoJSON public des régions (données ouvertes, france-geojson / IGN).
 *
 * Projection Mercator fermée (closed-form) : le même calcul sert ici pour les
 * tracés SVG et, au runtime, pour placer les marqueurs (src/lib/cartes/geo.ts).
 * Sortie : content/_referentiels/france-map.json (autonome, sans réseau au
 * build). Régénération : node scripts/generate-france-map.mjs <geojson>.
 *
 * Source des données : https://github.com/gregoiredavid/france-geojson
 * (regions-version-simplifiee.geojson) — licence ouverte.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DEG2RAD = Math.PI / 180;
const mercX = (lon) => lon * DEG2RAD;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2));

const src = process.argv[2] ?? "/tmp/regions.geojson";
const geo = JSON.parse(readFileSync(src, "utf8"));

/** Aplatit les anneaux d'une géométrie Polygon/MultiPolygon en liste d'anneaux. */
function ringsOf(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

// 1) Bornes projetées sur toute la métropole.
let minX = Infinity,
  maxX = -Infinity,
  minY = Infinity,
  maxY = -Infinity;
for (const f of geo.features) {
  for (const ring of ringsOf(f.geometry)) {
    for (const [lon, lat] of ring) {
      const x = mercX(lon);
      const y = mercY(lat);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

// 2) Ajustement dans une zone de dessin avec marge.
const PAD = 48;
const DRAW_H = 900;
const spanX = maxX - minX;
const spanY = maxY - minY;
const scale = DRAW_H / spanY;
const drawW = spanX * scale;
const width = Math.round(drawW + PAD * 2);
const height = Math.round(DRAW_H + PAD * 2);
const padX = PAD;
const padY = PAD;

const toX = (lon) => padX + (mercX(lon) - minX) * scale;
const toY = (lat) => padY + (maxY - mercY(lat)) * scale;
const r1 = (n) => Math.round(n * 10) / 10;

// 3) Tracés SVG par région.
const regions = geo.features.map((f) => {
  const parts = [];
  for (const ring of ringsOf(f.geometry)) {
    const pts = ring.map(([lon, lat]) => `${r1(toX(lon))},${r1(toY(lat))}`);
    parts.push("M" + pts.join("L") + "Z");
  }
  return { code: f.properties.code, nom: f.properties.nom, path: parts.join("") };
});

const out = {
  width,
  height,
  // Descripteur de projection pour reprojeter les marqueurs au runtime.
  projection: { minX, maxY, scale, padX, padY },
  regions,
};

const dest = "content/_referentiels/france-map.json";
writeFileSync(dest, JSON.stringify(out));
const kb = Math.round(Buffer.byteLength(JSON.stringify(out)) / 1024);
console.log(`${dest} — ${width}x${height}, ${regions.length} régions, ${kb} KB`);
