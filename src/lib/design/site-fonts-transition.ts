import { Archivo, Geist, Geist_Mono } from "next/font/google";

/**
 * Les trois fontes de la charte historique, **sans préchargement** — lot M8b.
 *
 * Pourquoi une seconde déclaration. `next/font` émet un `<link rel="preload">`
 * pour toute fonte présente dans le graphe de modules d'une route, que la page
 * la rende ou non. Or `FicheTransition` déclarait les fontes du site et vivait
 * dans le même module de route que les quatre gabarits PLANCHE : les 238 fiches
 * préchargeaient donc Geist, Geist Mono et Archivo — **y compris les 215 déjà
 * migrées, qui ne les emploient nulle part**.
 *
 * Mesuré, pas déduit : les fichiers portent des noms hachés où « Geist »
 * n'apparaît pas, et un contrôle par nom de fichier aurait conclu « aucune
 * Geist ». C'est la liste réseau, rattachée aux règles `@font-face`, qui l'a
 * montré. `next/dynamic` sur `FicheTransition` n'y change rien — le graphe est
 * analysé à la construction, import différé compris.
 *
 * Ce module déclare donc les mêmes familles avec `preload: false`. Les 23
 * Dossiers gardent leur typographie exacte — mêmes variables CSS, mêmes
 * familles — et la tirent au moment où elle sert ; les 215 fiches migrées ne
 * la préchargent plus.
 *
 * Il disparaîtra avec `FicheTransition`, au lot du Dossier.
 */
export const geistSansTransition = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  preload: false,
});

export const geistMonoTransition = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const archivoTransition = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  preload: false,
});

/** Les trois variables à poser sur un conteneur de charte historique. */
export const TRANSITION_FONT_VARIABLES = [
  geistSansTransition.variable,
  geistMonoTransition.variable,
  archivoTransition.variable,
].join(" ");
