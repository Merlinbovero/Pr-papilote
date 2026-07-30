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
  indigo: string;
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
  indigo: "#4F5882",
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
  indigo: "#A4AFDB",
  juste: "#72C78B",
  attention: "#EFB062",
  erreur: "#ED756A",
};

/**
 * Les sept encres, dans l'ordre du référentiel.
 *
 * `indigo` est l'encre du Dossier de concours, ajoutée au lot M9a. Elle n'a pas
 * été choisie à l'œil : les six encres antérieures forment une **famille
 * isoluminante** — clarté 0,449–0,470 en clair, 0,730–0,761 en sombre, chroma
 * 0,070–0,110 — qui ne se distingue que par la teinte. Une septième encre devait
 * donc obéir à cette loi et trouver la teinte encore libre, pas s'installer où
 * bon lui semblait.
 *
 * Les teintes occupées sont 34, 69, 150, 231, 248 et 305 ; le bleu fonctionnel
 * de navigation siège à 258. Le seul créneau bleu disponible est l'indigo, et la
 * recherche sous contrainte y converge sur **h ≈ 275, chroma au plancher** —
 * profond et désaturé, comme demandé.
 *
 * Le seuil de séparation n'est pas inventé non plus : c'est celui que la charte
 * s'accorde déjà, la paire marine/air, à ΔE00 7,4 en clair et 6,2 en sombre.
 * `indigo` tient 10,6 et 10,9. Deux variantes voisines — h 264 et h 288 —
 * tombaient **sous** ce plancher et ont été écartées par la mesure, pas par
 * goût. Voir `planche-tokens.test.ts`.
 */
export const ENCRES_MODULE = [
  "marine",
  "air",
  "terre",
  "bistre",
  "violine",
  "sienne",
  "indigo",
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

function toLab(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Couleur hexadécimale attendue au format #RRGGBB, reçu « ${hex} »`);
  }
  const int = Number.parseInt(match[1], 16);
  const [r, g, b] = [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff].map((v) =>
    channel(v / 255)
  ) as [number, number, number];
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * Écart perceptuel CIEDE2000 entre deux couleurs.
 *
 * Le rapport de contraste ne dit **que** la lisibilité : deux encres peuvent
 * tenir 6:1 chacune sur le papier et rester indiscernables l'une de l'autre.
 * C'est cette seconde question — deux familles voisines se distinguent-elles ?
 * — que mesure ΔE00, et c'est elle qui a arbitré l'encre du Dossier au lot M9a.
 */
export function deltaE2000(a: string, b: string): number {
  const [L1, a1, b1] = toLab(a);
  const [L2, a2, b2] = toLab(b);
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  const c1 = Math.hypot(a1, b1);
  const c2 = Math.hypot(a2, b2);
  const cBar = (c1 + c2) / 2;
  const g = 0.5 * (1 - Math.sqrt(cBar ** 7 / (cBar ** 7 + 25 ** 7)));
  const ap1 = (1 + g) * a1;
  const ap2 = (1 + g) * a2;
  const cp1 = Math.hypot(ap1, b1);
  const cp2 = Math.hypot(ap2, b2);
  const angle = (y: number, x: number) => {
    if (y === 0 && x === 0) return 0;
    const h = Math.atan2(y, x) * deg;
    return h < 0 ? h + 360 : h;
  };
  const hp1 = angle(b1, ap1);
  const hp2 = angle(b2, ap2);
  const dL = L2 - L1;
  const dC = cp2 - cp1;
  let dh = 0;
  if (cp1 * cp2 !== 0) {
    dh = hp2 - hp1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(cp1 * cp2) * Math.sin((dh * rad) / 2);
  const lBar = (L1 + L2) / 2;
  const cpBar = (cp1 + cp2) / 2;
  let hBar: number;
  if (cp1 * cp2 === 0) {
    hBar = hp1 + hp2;
  } else {
    hBar = (hp1 + hp2) / 2;
    if (Math.abs(hp1 - hp2) > 180) hBar += hp1 + hp2 < 360 ? 180 : -180;
  }
  const t =
    1 -
    0.17 * Math.cos((hBar - 30) * rad) +
    0.24 * Math.cos(2 * hBar * rad) +
    0.32 * Math.cos((3 * hBar + 6) * rad) -
    0.2 * Math.cos((4 * hBar - 63) * rad);
  const sL = 1 + (0.015 * (lBar - 50) ** 2) / Math.sqrt(20 + (lBar - 50) ** 2);
  const sC = 1 + 0.045 * cpBar;
  const sH = 1 + 0.015 * cpBar * t;
  const rT =
    -2 *
    Math.sqrt(cpBar ** 7 / (cpBar ** 7 + 25 ** 7)) *
    Math.sin(60 * Math.exp(-(((hBar - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / sL) ** 2 + (dC / sC) ** 2 + (dH / sH) ** 2 + rT * (dC / sC) * (dH / sH));
}

/** Seuil WCAG AA pour un texte de taille normale. */
export const SEUIL_TEXTE = 4.5;
/** Seuil WCAG AA pour un élément graphique porteur d'information. */
export const SEUIL_GRAPHIQUE = 3;
