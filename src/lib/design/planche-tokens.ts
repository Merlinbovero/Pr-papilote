/**
 * Jetons du système PLANCHE — source unique, portée locale.
 *
 * Ces valeurs ne remplacent AUCUN jeton de production : elles sont émises
 * sous la classe `.pl-root` (voir `src/app/design-lab/planche/planche.css`),
 * jamais sur `:root`. Le prototype vit derrière un drapeau de fonctionnalité.
 *
 * Le module est pur et testé : les seuils de contraste du manifeste
 * (`docs/design-manifesto.md` §3.1) sont vérifiés ici, pas constatés à l'œil.
 */

export interface PlancheRegister {
  fond: string;
  fond2: string;
  fond3: string;
  encre: string;
  encre2: string;
  encre3: string;
  filet: string;
  filetFort: string;
  marine: string;
  air: string;
  terre: string;
  bistre: string;
  violine: string;
  sienne: string;
  juste: string;
  attention: string;
  erreur: string;
}

/** Registre clair — « papier » : un blanc cassé neutre, jamais un beige. */
export const CLAIR: PlancheRegister = {
  fond: "#FBFAF8",
  fond2: "#F6F5F2",
  fond3: "#EFEEEB",
  encre: "#141B24",
  encre2: "#414851",
  encre3: "#666C74",
  filet: "#D5D8DB",
  filetFort: "#7C8186",
  marine: "#1D5B8F",
  air: "#156383",
  terre: "#376441",
  bistre: "#79511E",
  violine: "#624581",
  sienne: "#8A3D2B",
  juste: "#117C40",
  attention: "#986001",
  erreur: "#BE2323",
};

/** Registre sombre — « charbon bleuté » : une encre, pas un papier assombri. */
export const SOMBRE: PlancheRegister = {
  fond: "#10141A",
  fond2: "#191D24",
  fond3: "#22272D",
  encre: "#E7E6E3",
  encre2: "#B4B8BC",
  encre3: "#888E94",
  filet: "#2E333A",
  filetFort: "#6B727C",
  marine: "#7DB0E1",
  air: "#74B8DB",
  terre: "#8CB894",
  bistre: "#D2A979",
  violine: "#B599D6",
  sienne: "#E09582",
  juste: "#72C78B",
  attention: "#EFB062",
  erreur: "#ED756A",
};

/** Les six encres de module, dans l'ordre du référentiel. */
export const ENCRES_MODULE = [
  "marine",
  "air",
  "terre",
  "bistre",
  "violine",
  "sienne",
] as const satisfies readonly (keyof PlancheRegister)[];

/** Les trois états, réservés au retour d'action. */
export const ETATS = [
  "juste",
  "attention",
  "erreur",
] as const satisfies readonly (keyof PlancheRegister)[];

/** Les trois niveaux de fond sur lesquels un texte peut se poser. */
export const FONDS = [
  "fond",
  "fond2",
  "fond3",
] as const satisfies readonly (keyof PlancheRegister)[];

function channel(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative WCAG d'une couleur hexadécimale `#RRGGBB`. */
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Couleur hexadécimale attendue au format #RRGGBB, reçu « ${hex} »`);
  }
  const int = Number.parseInt(match[1], 16);
  const r = channel(((int >> 16) & 0xff) / 255);
  const g = channel(((int >> 8) & 0xff) / 255);
  const b = channel((int & 0xff) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste WCAG entre deux couleurs, de 1:1 à 21:1. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Seuil WCAG AA pour un texte de taille normale. */
export const SEUIL_TEXTE = 4.5;
/** Seuil WCAG AA pour un élément graphique porteur d'information. */
export const SEUIL_GRAPHIQUE = 3;
