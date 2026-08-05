/**
 * Garde structurelle des croquis scientifiques — lot C2.
 *
 * ── Ce qu'elle contrôle, et sur quoi ────────────────────────────────────
 * Elle ne s'applique **pas** aux cent six SVG du corpus, mais à un registre
 * explicite : les croquis passés sous contrat. Il en contient deux à
 * l'ouverture de C2, et il grandira croquis par croquis.
 *
 * C'est délibéré, et c'est l'inverse d'une garde molle. Une règle appliquée
 * d'un coup à cent six fichiers historiques aurait dû être affaiblie jusqu'à
 * ne plus rien interdire — ou aurait forcé à réécrire cent six dessins dans le
 * même lot. Une règle appliquée à un registre qui grandit reste **stricte**,
 * et chaque entrée du registre est une promesse tenue.
 *
 * ── Ce qu'elle ne peut pas contrôler ────────────────────────────────────
 * La justesse scientifique. Aucune lecture de fichier ne dit si le variomètre
 * est branché sur la bonne prise. Elle vérifie des propriétés de forme ; la
 * physique reste le travail de la relecture humaine.
 *
 * Elle ne détecte pas non plus, à proprement parler, un texte converti en
 * tracé — un `<path>` ne dit pas qu'il fut une lettre. Le contrôle est un
 * **substitut assumé** : exiger la présence de `<text>` et interdire les
 * éléments de police embarquée. Un croquis dont tous les libellés seraient
 * vectorisés n'aurait plus aucun `<text>` et tomberait ; un croquis qui en
 * vectoriserait la moitié passerait. La limite est écrite ici plutôt que
 * découverte plus tard.
 */

/**
 * Les croquis soumis au contrat. Grandit lot par lot, jamais d'un bloc.
 *
 * Elle était **vide à l'introduction de la garde**, et ce n'était pas un
 * oubli : la garde a été livrée et prouvée avant que le premier croquis ne
 * l'honore. L'ordre inverse — dessiner puis écrire la règle qui accepte le
 * dessin — produit une règle taillée sur son unique exemple.
 */
export const CROQUIS_SOUS_CONTRAT: readonly string[] = [
  "chaine-anemobarometrique",
  "triangle-des-vitesses",
];

/** Formats canoniques de la doctrine §10.1. */
const VIEWBOX_CANONIQUES = ["0 0 460 260", "0 0 460 300", "0 0 420 240", "0 0 340 340"];

/** Marge de sécurité, en unités de `viewBox` (doctrine §10.2). */
export const MARGE_SECURITE = 12;

/**
 * Largeur réellement rendue d'un croquis dans une fiche, à 390 px de viewport.
 *
 * **Mesurée**, pas déduite : la carte, sa bordure et son rembourrage retirent
 * 66 px des 390. C'est ce nombre qui transforme des unités de `viewBox` en
 * pixels CSS, et c'est lui qui manquait en C2.
 */
export const LARGEUR_RENDUE_390 = 324;

/**
 * Tailles minimales **en pixels CSS effectifs**, à 390 px de viewport.
 *
 * ── Pourquoi la règle a changé ──────────────────────────────────────────
 * C2 exigeait 11 unités de `viewBox`. C'était une règle sur le fichier, pas
 * sur ce que l'œil reçoit : dans un `viewBox` de 460 réduit au facteur 0,704,
 * ces 11 unités se rendaient à **7,75 px**. La garde était verte et le texte
 * illisible — le pire des deux mondes, une règle qui rassure sans protéger.
 *
 * Le seuil porte désormais sur la taille rendue. Il est **indépendant du
 * format** : élargir le `viewBox` sans grossir les caractères fait tomber le
 * test, ce qui est exactement l'effet recherché.
 */
export const TAILLE_EFFECTIVE_MIN = {
  /** Texte porteur d'information scientifique. */
  essentiel: 12,
  /** Libellés secondaires, légendes, unités. */
  secondaire: 11,
} as const;

/**
 * Sous ce seuil, aucune information scientifique indispensable.
 * C'est le plancher absolu : un texte plus petit est un défaut, quel que soit
 * son rôle.
 */
export const PLANCHER_EFFECTIF = TAILLE_EFFECTIVE_MIN.secondaire;

/**
 * Valeurs de couleur admises.
 *
 * `currentColor` reste autorisé : c'est ainsi que les croquis historiques
 * héritent de la couleur du texte, et l'interdire casserait l'héritage sans
 * rien gagner. Tout le reste doit passer par un jeton.
 */
const COULEURS_ADMISES = /^(none|currentColor|var\(--schema-[\w-]+\))$/;

export interface Violation {
  regle: string;
  detail: string;
}

const balises = (svg: string, nom: string) =>
  [...svg.matchAll(new RegExp(`<${nom}\\b[^>]*`, "g"))].map((m) => m[0]);

const attribut = (fragment: string, nom: string) =>
  new RegExp(`\\s${nom}="([^"]*)"`).exec(fragment)?.[1];

/**
 * Contrôle un croquis. Rend la liste des violations — vide si tout est
 * conforme.
 *
 * Les règles sont volontairement **toutes évaluées** : une garde qui s'arrête
 * à la première erreur oblige à autant d'allers-retours qu'il y a de défauts.
 */
export function controlerCroquis(schemaId: string, svg: string): Violation[] {
  const violations: Violation[] = [];
  const ajouter = (regle: string, detail: string) => violations.push({ regle, detail });

  const racine = /<svg\b[^>]*>/.exec(svg)?.[0];
  if (!racine) {
    return [{ regle: "svg-racine", detail: "aucun élément <svg> trouvé" }];
  }

  // ── Cadre ──────────────────────────────────────────────────────────────
  const viewBox = attribut(racine, "viewBox");
  if (!viewBox) {
    ajouter("viewbox-present", "l'élément <svg> ne porte pas de viewBox");
  } else if (!VIEWBOX_CANONIQUES.includes(viewBox)) {
    ajouter(
      "viewbox-canonique",
      `viewBox « ${viewBox} » hors des formats de la doctrine §10.1 (${VIEWBOX_CANONIQUES.join(" · ")})`
    );
  }

  for (const dimension of ["width", "height"] as const) {
    const valeur = attribut(racine, dimension);
    if (valeur && valeur !== "100%") {
      ajouter(
        "dimensions-souples",
        `${dimension}="${valeur}" fige le rendu ; le responsive exige "100%" ou l'absence d'attribut`
      );
    }
  }

  // ── Arbre accessible ───────────────────────────────────────────────────
  // `FicheFigure` porte déjà `role="img"` et `aria-label`. Un SVG qui se
  // décrirait à nouveau produirait une double annonce.
  if (attribut(racine, "aria-hidden") !== "true") {
    ajouter(
      "svg-masque",
      'le <svg> doit porter aria-hidden="true" : le conteneur documentaire porte déjà l\'alternative'
    );
  }
  if (attribut(racine, "focusable") !== "false") {
    ajouter("svg-non-focusable", 'le <svg> doit porter focusable="false"');
  }

  // ── Identifiants ───────────────────────────────────────────────────────
  const declares = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of declares) {
    if (!id.startsWith(`${schemaId}__`)) {
      ajouter(
        "identifiant-prefixe",
        `id="${id}" n'est pas préfixé par « ${schemaId}__ » ; plusieurs croquis coexistent sur une page`
      );
    }
  }

  const references = [
    ...[...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]),
    ...[...svg.matchAll(/(?:xlink:)?href="#([^"]+)"/g)].map((m) => m[1]),
  ];
  for (const cible of references) {
    if (!declares.includes(cible)) {
      ajouter("reference-resolue", `la référence #${cible} ne désigne aucun id déclaré`);
    }
  }

  // ── Couleurs ───────────────────────────────────────────────────────────
  const valeursCouleur = [
    ...[...svg.matchAll(/\s(?:fill|stroke)="([^"]*)"/g)].map((m) => m[1]),
    ...[...svg.matchAll(/(?:fill|stroke)\s*:\s*([^;}]+)/g)].map((m) => m[1].trim()),
  ];
  for (const valeur of valeursCouleur) {
    if (!COULEURS_ADMISES.test(valeur)) {
      ajouter(
        "couleur-jetonnee",
        `couleur « ${valeur} » : seuls les jetons var(--schema-*), currentColor et none sont admis`
      );
    }
  }

  // ── Texte ──────────────────────────────────────────────────────────────
  const textes = balises(svg, "text");
  if (textes.length === 0) {
    ajouter("texte-vivant", "aucun élément <text> : les libellés semblent vectorisés");
  }
  for (const police of ["font", "font-face", "glyph"]) {
    if (balises(svg, police).length > 0) {
      ajouter("police-embarquee", `<${police}> : police embarquée interdite`);
    }
  }

  /*
    Le contrôle porte sur la taille EFFECTIVE, pas sur les unités déclarées.
    Sans le facteur d'échelle, un croquis peut respecter la règle au fichier et
    rendre du 7,75 px à l'écran — c'est ce qui s'est produit en C2.
  */
  const largeurViewBox = viewBox ? Number(viewBox.split(/\s+/)[2]) : NaN;
  const echelle390 = Number.isFinite(largeurViewBox)
    ? LARGEUR_RENDUE_390 / largeurViewBox
    : Number.NaN;

  const taillesTexte = [
    ...[...svg.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => Number(m[1])),
    ...[...svg.matchAll(/\sfont-size="([\d.]+)"/g)].map((m) => Number(m[1])),
    ...[...svg.matchAll(/font:\s*([\d.]+)px/g)].map((m) => Number(m[1])),
  ];
  for (const taille of taillesTexte) {
    const effective = taille * echelle390;
    if (Number.isFinite(effective) && effective < PLANCHER_EFFECTIF) {
      ajouter(
        "texte-minimal",
        `font-size ${taille} unités → ${effective.toFixed(2)} px effectifs à 390 px, ` +
          `sous le plancher de ${PLANCHER_EFFECTIF} px`
      );
    }
  }

  // ── Interdits de fond ──────────────────────────────────────────────────
  if (/<image\b/.test(svg) || /data:image\/(png|jpe?g|gif|webp|bmp)/i.test(svg)) {
    ajouter("aucun-raster", "image matricielle embarquée ou référencée");
  }
  if (/<foreignObject\b/.test(svg)) {
    ajouter("aucun-foreignobject", "<foreignObject> sans justification exceptionnelle");
  }
  for (const decor of ["filter", "linearGradient", "radialGradient"]) {
    if (balises(svg, decor).length > 0) {
      ajouter("aucun-decor", `<${decor}> : effet décoratif interdit par le contrat graphique`);
    }
  }

  return violations;
}

/**
 * Positions des étiquettes, pour le contrôle de cadre.
 *
 * Extraire `x`/`y` ne donne que le point d'ancrage, pas la boîte rendue : la
 * largeur réelle d'un libellé dépend de la police, et elle se mesure dans un
 * navigateur, pas ici. Ce contrôle attrape donc les ancres hors cadre —
 * l'erreur grossière — et laisse le chevauchement fin à la mesure Playwright.
 */
export function ancresHorsCadre(svg: string): Violation[] {
  const racine = /<svg\b[^>]*>/.exec(svg)?.[0];
  const viewBox = racine ? attribut(racine, "viewBox") : undefined;
  if (!viewBox) return [];

  const [, , largeur, hauteur] = viewBox.split(/\s+/).map(Number);
  const violations: Violation[] = [];

  for (const balise of balises(svg, "text")) {
    const x = Number(attribut(balise, "x"));
    const y = Number(attribut(balise, "y"));
    if (Number.isNaN(x) || Number.isNaN(y)) continue;

    if (
      x < MARGE_SECURITE ||
      y < MARGE_SECURITE ||
      x > largeur - MARGE_SECURITE ||
      y > hauteur - MARGE_SECURITE
    ) {
      violations.push({
        regle: "marge-securite",
        detail: `étiquette ancrée en (${x}, ${y}) hors de la marge de ${MARGE_SECURITE} unités`,
      });
    }
  }
  return violations;
}
