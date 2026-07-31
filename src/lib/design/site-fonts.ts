import { Archivo, Geist, Geist_Mono } from "next/font/google";

/**
 * Les trois fontes de la charte historique.
 *
 * Extraites du layout `(site)` au lot M6a : une page **encore sous la charte
 * historique** doit charger ses propres fontes, même si sa route a rejoint le
 * groupe `(planche)` — c'est le cas des fiches en transition. Sans cela, elles
 * se rendraient en Fira Sans, une police qui n'a pas été dessinée pour ces
 * composants, sur 238 pages publiées.
 *
 * Elles disparaîtront avec la dernière page de transition. Tant qu'il en reste
 * une, elles ont un consommateur, et c'est la règle de suppression posée en M2.
 */
export const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police display des titres : grotesque institutionnelle sobre (graisses
// fortes pour les grands titres cinématiques), sans effet « gaming ».
export const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
});

/** Les trois variables à poser sur un conteneur de charte historique. */
export const SITE_FONT_VARIABLES = [geistSans.variable, geistMono.variable, archivo.variable].join(
  " "
);
