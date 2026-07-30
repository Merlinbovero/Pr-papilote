/**
 * Jetons du Banc — lot F1b.
 *
 * Le Banc est un **poste de travail sous contrainte**, pas un document.
 * L'audit F0b §1 a montré que les séances empruntent aujourd'hui le
 * vocabulaire des pages de consultation — mêmes cartes bordées, même densité,
 * même largeur — alors qu'elles sont l'inverse d'une lecture. Ces jetons
 * fondent un registre distinct : l'instrument.
 *
 * **Domaine autonome.** Le Banc suit la discipline colorimétrique de PLANCHE
 * — même loi isoluminante, mêmes planchers de séparation — mais ne dépend
 * d'aucun de ses fichiers et n'étend aucune de ses variables. PLANCHE est
 * documentaire, le Banc est fonctionnel ; mêler les deux ferait dépendre une
 * séance d'un choix de mise en page de fiche.
 *
 * **Portée locale.** Les valeurs sont émises sous `.banc` (voir
 * `src/styles/banc.css`), jamais sur `:root`. Tant qu'aucun élément ne porte
 * la classe, le produit est strictement inchangé.
 */

export interface BancRegistre {
  /** Le cadre de séance. */
  fond: string;
  /** La zone de stimulus, qui doit se détacher du cadre. */
  fond2: string;
  /** Les réponses au repos. */
  fond3: string;
  encre: string;
  encre2: string;
  /** Séparation des zones — jamais une bordure décorative. */
  filet: string;
  /** Uniquement l'élément actif ou sélectionné. */
  filetFort: string;
  /** L'encre du Banc — famille F. */
  banc: string;
  juste: string;
  attention: string;
  erreur: string;
}

/**
 * Registre clair.
 *
 * `banc` est l'encre de famille F, arbitrée au lot F1b par la mesure et non à
 * l'œil. Les sept encres PLANCHE forment une famille isoluminante — clarté
 * 0,449–0,471, chroma 0,069–0,110 — dont les teintes occupent 34, 69, 150,
 * 231, 248, 274 et 305 ; le bleu de navigation siège à 258. Trois créneaux
 * restaient libres : olive (h 109), turquoise (h 193) et magenta (h 0).
 *
 * Le turquoise est retenu. Il siège entre le vert de validation et les bleus
 * de module sans prendre la place d'aucun, et son registre est celui de
 * l'instrument de bord. L'olive touchait au kaki, donc au module Terre ; le
 * magenta sortait du registre sobre de la charte.
 *
 * Deux contrôles ont été ajoutés au protocole de M9a, et le second a corrigé
 * la proposition :
 *
 *  - **séparation d'avec les états** — en séance, l'encre cohabite avec le
 *    vert « juste » et le rouge « erreur » : ΔE00 ≥ 20,2 en clair, ≥ 17,7 en
 *    sombre, très au-dessus du plancher ;
 *  - **gamut sRGB** — la première version (`#006766`, chroma 0,090) sortait
 *    du gamut en clair et se faisait écrêter : la couleur mesurée n'aurait
 *    jamais été celle affichée. Chroma ramenée à 0,078, dans la fourchette de
 *    la famille.
 *
 * Voir `banc-tokens.test.ts`, qui refait ces mesures à chaque exécution.
 */
export const BANC_CLAIR: BancRegistre = {
  // Les trois fonds ne sont pas repris de PLANCHE : ses niveaux sont taillés
  // pour du texte documentaire, et le test a montré qu'un `fond3` à #EDECE9
  // faisait tomber `juste` à 4,47 et `attention` à 4,43 — sous le seuil AA.
  // Les valeurs ci-dessous laissent passer les quatre teintes du Banc avec
  // une marge mesurée (le pire cas est `attention`, à 4,64 sur `fond3`).
  fond: "#FBFAF8",
  fond2: "#F6F5F2",
  fond3: "#F2F1EE",
  encre: "#141B24",
  encre2: "#414851",
  filet: "#D5D8DB",
  filetFort: "#7C8186",
  banc: "#036564",
  juste: "#117C40",
  attention: "#986001",
  erreur: "#BE2323",
};

/** Registre sombre — une encre, pas un papier assombri. */
export const BANC_SOMBRE: BancRegistre = {
  fond: "#10141A",
  fond2: "#191D24",
  fond3: "#22272D",
  encre: "#E7E6E3",
  encre2: "#B4B8BC",
  filet: "#2E333A",
  filetFort: "#6B727C",
  banc: "#6BBDBA",
  juste: "#72C78B",
  attention: "#EFB062",
  erreur: "#ED756A",
};

/** Les quatre états d'une réponse. `neutre` n'a pas de teinte propre. */
export const ETATS_REPONSE = ["juste", "attention", "erreur", "neutre"] as const;
export type EtatReponse = (typeof ETATS_REPONSE)[number];

/** Les quatre états du chronomètre. `absent` couvre les séances sans temps. */
export const ETATS_CHRONO = ["normal", "warning", "critical", "expired", "absent"] as const;
export type EtatChrono = (typeof ETATS_CHRONO)[number];

/** Seuil WCAG AA pour un texte de taille normale. */
export const SEUIL_TEXTE = 4.5;
/** Plancher de séparation entre deux encres — la paire marine/air de PLANCHE. */
export const SEPARATION_CLAIR = 7.4;
export const SEPARATION_SOMBRE = 6.2;

// ---------------------------------------------------------------------------
// Mesures
// ---------------------------------------------------------------------------

function versLineaire(canal: number): number {
  return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
}

function composantes(hex: string): [number, number, number] {
  const trouve = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!trouve) {
    throw new Error(`Couleur hexadécimale attendue au format #RRGGBB, reçu « ${hex} »`);
  }
  const entier = Number.parseInt(trouve[1], 16);
  return [(entier >> 16) & 0xff, (entier >> 8) & 0xff, entier & 0xff];
}

/** Luminance relative WCAG. */
export function luminance(hex: string): number {
  const [r, g, b] = composantes(hex).map((v) => versLineaire(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste WCAG, de 1:1 à 21:1. */
export function contraste(a: string, b: string): number {
  const [haut, bas] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (haut + 0.05) / (bas + 0.05);
}

/** Coordonnées OKLCH — clarté, chroma, teinte — d'une couleur sRGB. */
export function versOklch(hex: string): { L: number; C: number; h: number } {
  const [r, g, b] = composantes(hex).map((v) => versLineaire(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { L, C: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

/**
 * La couleur tient-elle dans le gamut sRGB ?
 *
 * Une couleur hors gamut est **écrêtée** par le navigateur : elle s'affiche,
 * mais pas telle qu'on l'a décrite, et toute mesure faite sur la valeur
 * demandée devient fausse. C'est ce piège qui a fait écarter la première
 * version de l'encre du Banc.
 */
export function dansGamutSrgb(L: number, C: number, h: number): boolean {
  const rad = (h * Math.PI) / 180;
  const A = C * Math.cos(rad);
  const B = C * Math.sin(rad);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const canaux = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return canaux.every((canal) => canal >= -0.0005 && canal <= 1.0005);
}

function versLab(hex: string): [number, number, number] {
  const [r, g, b] = composantes(hex).map((v) => versLineaire(v / 255));
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * Écart perceptuel CIEDE2000.
 *
 * Le rapport de contraste ne dit que la lisibilité sur un fond ; ΔE00 dit si
 * deux teintes se distinguent l'une de l'autre. C'est cette seconde question
 * qui arbitre une encre de famille.
 */
export function deltaE2000(a: string, b: string): number {
  const [L1, a1, b1] = versLab(a);
  const [L2, a2, b2] = versLab(b);
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
    const valeur = Math.atan2(y, x) * deg;
    return valeur < 0 ? valeur + 360 : valeur;
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

/**
 * Formate une durée pour l'affichage — `M:SS` sous une heure, `H:MM:SS`
 * au-delà. Une écriture unique, là où l'audit en a relevé cinq.
 */
export function formatChrono(secondes: number): string {
  const total = Math.max(0, Math.floor(secondes));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const deuxChiffres = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${deuxChiffres(m)}:${deuxChiffres(s)}` : `${m}:${deuxChiffres(s)}`;
}

/**
 * Formule la même durée en langue naturelle, pour les techniques d'assistance.
 *
 * `2:05` se lit « deux-cent-cinq » ou « deux cinq » selon le lecteur d'écran :
 * l'affichage compact est fait pour l'œil, pas pour l'oreille.
 */
export function chronoEnMots(secondes: number): string {
  const total = Math.max(0, Math.floor(secondes));
  if (total === 0) return "Temps écoulé";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const morceaux: string[] = [];
  if (h > 0) morceaux.push(`${h} heure${h > 1 ? "s" : ""}`);
  if (m > 0) morceaux.push(`${m} minute${m > 1 ? "s" : ""}`);
  if (s > 0) morceaux.push(`${s} seconde${s > 1 ? "s" : ""}`);
  const dernier = morceaux.pop() as string;
  const phrase = morceaux.length > 0 ? `${morceaux.join(", ")} et ${dernier}` : dernier;
  return `${phrase} restante${total > 1 ? "s" : ""}`;
}
