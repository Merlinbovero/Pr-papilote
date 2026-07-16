import { project } from "./geo";

/**
 * Villes repères de la France métropolitaine — contexte géographique des
 * cartes des bases (Phase 14). Coordonnées publiques des communes (données
 * factuelles, non inventées). Purement décoratives : elles aident à situer
 * les implantations sans être interactives.
 */
const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: "Paris", lat: 48.86, lon: 2.35 },
  { name: "Lille", lat: 50.63, lon: 3.06 },
  { name: "Strasbourg", lat: 48.58, lon: 7.75 },
  { name: "Brest", lat: 48.39, lon: -4.49 },
  { name: "Nantes", lat: 47.22, lon: -1.55 },
  { name: "Lyon", lat: 45.76, lon: 4.84 },
  { name: "Bordeaux", lat: 44.84, lon: -0.58 },
  { name: "Toulouse", lat: 43.6, lon: 1.44 },
  { name: "Marseille", lat: 43.3, lon: 5.37 },
  { name: "Nice", lat: 43.7, lon: 7.27 },
];

export interface MapLandmark {
  name: string;
  x: number;
  y: number;
}

/** Villes repères projetées sur le fond de carte (calcul serveur). */
export function getFranceLandmarks(): MapLandmark[] {
  return CITIES.map((city) => {
    const { x, y } = project(city.lat, city.lon);
    return { name: city.name, x, y };
  });
}
