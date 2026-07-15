import type { MetadataRoute } from "next";

/**
 * Manifeste d'application web (PWA). Rend le site installable : « Sur l'écran
 * d'accueil » sur iPhone, « Installer l'application » sur Android/desktop.
 * L'icône provisoire vit dans public/ (icon-*.png, apple-touch-icon.png) et
 * se remplace par le logo définitif sans toucher à ce fichier — voir
 * docs/pwa-icone.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrépaPilote — concours pilote militaire",
    short_name: "PrépaPilote",
    description:
      "Préparation aux concours de pilote militaire français : EOPAN, EOPN et ALAT. Fiches, quiz, examen blanc du BIA et entraînement psychotechnique.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0d55ad",
    categories: ["education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
