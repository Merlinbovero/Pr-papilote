/**
 * Conversion OKLCH → sRGB et rapport de contraste WCAG.
 *
 * Ces fonctions existaient en double : une copie dans le test des jetons
 * d'état (lot F1a), une seconde écrite pour les croquis (lot C2). Deux
 * implémentations d'une même conversion finissent toujours par diverger, et
 * celle-ci décide de conformité — c'est le pire endroit où laisser un écart.
 *
 * ── Une erreur de mesure à ne pas refaire ───────────────────────────────
 * Une mesure antérieure du chantier lisait des couleurs `lab()` comme si
 * c'était du sRGB et annonçait 1,53:1 sur l'encre principale. Le chiffre était
 * absurde et l'a trahie. La leçon tient en une phrase : **une couleur doit être
 * convertie depuis son espace déclaré**, jamais lue comme un triplet
 * quelconque. D'où l'entrée typée `Oklch` plutôt qu'un tableau de trois
 * nombres anonymes.
 */

/** Une couleur OKLCH : clarté 0–1, chroma, teinte en degrés. */
export type Oklch = readonly [L: number, C: number, h: number];

/** Une couleur sRGB, composantes 0–1. */
export type Srgb = readonly [r: number, g: number, b: number];

/** OKLCH → sRGB (composantes 0–1, écrêtées au gamut). */
export function oklchVersSrgb([L, C, h]: Oklch): Srgb {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lineaire = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lineaire.map((c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  }) as unknown as Srgb;
}

/** Luminance relative WCAG. */
export function luminance([r, g, b]: Srgb): number {
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Rapport de contraste WCAG entre deux couleurs sRGB (1 à 21). */
export function contraste(a: Srgb, b: Srgb): number {
  const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (haut + 0.05) / (bas + 0.05);
}

/** Rapport de contraste entre deux couleurs OKLCH. */
export function contrasteOklch(a: Oklch, b: Oklch): number {
  return contraste(oklchVersSrgb(a), oklchVersSrgb(b));
}

/**
 * Mélange `couleur` sur `fond` à l'opacité donnée, dans l'espace sRGB.
 * Sert au motif « fond en teinte pleine à 10 % » des badges de correction.
 */
export function melanger(couleur: Srgb, fond: Srgb, opacite: number): Srgb {
  return couleur.map((c, i) => c * opacite + fond[i] * (1 - opacite)) as unknown as Srgb;
}

/**
 * Seuils WCAG 2.1, par rôle.
 *
 * `decorative` n'est pas un trou dans la règle : c'est la reconnaissance qu'un
 * élément qui ne porte aucune information n'a pas de seuil à tenir. Le déclarer
 * oblige à dire, jeton par jeton, ce qui est nécessaire à la compréhension —
 * et c'est cette déclaration, pas le seuil, qui est le vrai contrôle.
 */
export const SEUILS = {
  /** Texte courant (SC 1.4.3). */
  text: 4.5,
  /** Grand texte : ≥ 18,66 px gras ou ≥ 24 px (SC 1.4.3). */
  large_text: 3,
  /** Élément graphique nécessaire à la compréhension (SC 1.4.11). */
  essential_graphic: 3,
  /** Pur décor : aucune information perdue s'il disparaît. */
  decorative: 0,
} as const;

export type RoleContraste = keyof typeof SEUILS;
