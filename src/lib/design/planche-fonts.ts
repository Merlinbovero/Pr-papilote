import localFont from "next/font/local";

/**
 * Lot M2 — les trois familles du système PLANCHE, auto-hébergées.
 *
 * Elles ne sont chargées que par les routes qui importent ce module : le
 * gabarit racine de production n'y touche pas, et **Geist et Archivo restent
 * en place** tant que la moindre route publique en dépend.
 *
 * Pourquoi `next/font/local` plutôt que des `@font-face` écrits à la main :
 * la comparaison mesurée (voir `docs/design-migration.md` §8) montre que le
 * chargeur accepte plusieurs graisses **et** l'italique dans une seule
 * famille — italique authentique, `smcp` et `c2sc` conservés, aucune synthèse
 * du navigateur — tout en apportant l'empreinte de contenu dans le nom de
 * fichier, un cache d'un an en `immutable` et des métriques de repli qui
 * suppriment le décalage de mise en page.
 *
 * Les fichiers sont produits par `scripts/build-planche-fonts.mjs` à partir
 * des sources OFL ; les licences vivent dans `public/fonts/planche/`.
 */

/**
 * Spectral — la voix éditoriale. Romain, gras et italique dans **une seule
 * famille**, sans quoi `<em>` retomberait sur une oblique synthétisée.
 *
 * Préchargée : elle porte le titre et le corps du premier écran. Le coût
 * assumé est l'italique, préchargée avec le reste de la famille — mesuré à
 * 28,1 kB sur les écrans qui ne l'emploient pas.
 */
export const plancheSerif = localFont({
  src: [
    { path: "../../fonts/planche/spectral-400.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/planche/spectral-600.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/planche/spectral-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-planche-serif",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Fira Sans — l'interface et la signalétique. Non préchargée : elle ne porte
 * que le bandeau et les libellés, que `font-display: swap` et les métriques
 * de repli couvrent sans décalage mesurable.
 */
export const plancheSans = localFont({
  src: [
    { path: "../../fonts/planche/fira-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/planche/fira-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/planche/fira-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-planche-sans",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

/**
 * Fira Mono — la donnée. Restreinte aux codes, références et cotes, valeurs
 * techniques de tableau, dates de chronologie et chronomètres.
 */
export const plancheMono = localFont({
  src: [{ path: "../../fonts/planche/fira-mono-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-planche-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

/** Les trois variables à poser sur le conteneur d'une route PLANCHE. */
export const PLANCHE_FONT_VARIABLES = [
  plancheSerif.variable,
  plancheSans.variable,
  plancheMono.variable,
].join(" ");
