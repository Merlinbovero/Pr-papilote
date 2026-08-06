import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrasteOklch, SEUILS, type Oklch, type RoleContraste } from "@/lib/design/contraste";

/**
 * Contraste des jetons de croquis scientifique — lot C2.
 *
 * ── Ce que ce test refuse de faire ──────────────────────────────────────
 * Appliquer 4,5:1 à tout. C'était le réflexe, et il est faux : un trait de
 * grille tenu à 4,5:1 n'est plus une grille, c'est un quadrillage qui mange le
 * dessin. WCAG distingue le texte (4,5:1), le grand texte (3:1) et l'élément
 * graphique **nécessaire** (3:1), et ne dit rien du décor — parce qu'un décor
 * ne porte pas d'information.
 *
 * Chaque jeton déclare donc **son rôle**, et c'est le rôle qui fixe le seuil.
 * La déclaration est le vrai contrôle : elle oblige à répondre, jeton par
 * jeton, à « qu'est-ce qui est perdu si on ne le distingue pas ? ».
 *
 * ── Les valeurs ne sont pas recopiées ───────────────────────────────────
 * Elles sont lues dans `globals.css`, alias compris. Les jetons de croquis
 * sont des `var(--autre-jeton)` ; le test résout la chaîne jusqu'à la valeur
 * `oklch()` réelle. Retoucher la charte fait donc tomber ce test au lieu de
 * dégrader les croquis en silence.
 */

const CSS = readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf-8");

/**
 * Lit un jeton dans le registre demandé, en suivant les alias `var(--x)`.
 * La profondeur est bornée : un alias circulaire doit échouer bruyamment
 * plutôt que boucler.
 */
function jeton(nom: string, registre: "clair" | "sombre"): Oklch {
  const debutSombre = CSS.indexOf(".dark {");
  const zone = registre === "clair" ? CSS.slice(0, debutSombre) : CSS.slice(debutSombre);

  let courant = nom;
  for (let saut = 0; saut < 5; saut += 1) {
    const brut = new RegExp(`--${courant}:\\s*([^;]+);`).exec(zone)?.[1]?.trim();
    if (!brut) throw new Error(`Jeton --${courant} introuvable dans le registre ${registre}`);

    const direct = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(brut);
    if (direct) return [Number(direct[1]), Number(direct[2]), Number(direct[3])];

    const alias = /^var\(--([\w-]+)\)$/.exec(brut);
    if (!alias) throw new Error(`Jeton --${courant} : valeur non gérée « ${brut} »`);
    courant = alias[1];
  }
  throw new Error(`Jeton --${nom} : chaîne d'alias trop profonde (cycle ?)`);
}

/**
 * Le contrat des huit rôles.
 *
 * `essential_graphic` pour l'encre, l'accent et les trois teintes d'état :
 * ce sont des traits porteurs — une flèche, un vecteur, une liaison. Les
 * perdre, c'est perdre le schéma.
 *
 * `text` pour le gris secondaire, parce qu'il sert aux libellés et aux
 * légendes, pas aux traits.
 *
 * `decorative` pour la grille seule. Elle aide à situer, elle n'énonce rien :
 * un croquis dont la grille disparaît reste entièrement lisible.
 */
const CONTRAT: { jeton: string; role: RoleContraste; porte: string }[] = [
  { jeton: "schema-ink", role: "essential_graphic", porte: "structure, contours, flèches" },
  { jeton: "schema-muted", role: "text", porte: "libellés secondaires et légendes" },
  { jeton: "schema-accent", role: "essential_graphic", porte: "grandeur mise en avant" },
  { jeton: "schema-grid", role: "decorative", porte: "repères de fond, aucune information" },
  { jeton: "schema-positive", role: "essential_graphic", porte: "état conforme" },
  { jeton: "schema-warning", role: "essential_graphic", porte: "limite, précaution" },
  { jeton: "schema-danger", role: "essential_graphic", porte: "erreur, panne" },
];

describe.each(["clair", "sombre"] as const)("jetons de croquis — registre %s", (registre) => {
  const surface = () => jeton("schema-surface", registre);

  it("la surface du croquis est bien celle de la carte qui l'entoure", () => {
    // Le croquis est rendu dans `bg-card` : mesurer contre `--background`
    // donnerait des rapports faux, d'autant que les deux diffèrent en clair.
    expect(jeton("schema-surface", registre)).toEqual(jeton("card", registre));
  });

  it.each(CONTRAT)("$jeton tient le seuil de son rôle ($role)", ({ jeton: nom, role }) => {
    const mesure = contrasteOklch(jeton(nom, registre), surface());
    expect(mesure).toBeGreaterThanOrEqual(SEUILS[role]);
  });

  it("l'encre et l'accent restent distinguables l'un de l'autre", () => {
    // Ils se côtoient sur le même dessin. Sans écart suffisant, deux traits de
    // sens différents deviennent un seul trait — et aucune mesure contre la
    // surface ne l'aurait vu.
    expect(
      contrasteOklch(jeton("schema-ink", registre), jeton("schema-accent", registre))
    ).toBeGreaterThanOrEqual(2);
  });

  it("la grille reste en retrait de l'encre", () => {
    // Le défaut symétrique : une grille trop contrastée concurrence le dessin.
    // On vérifie donc qu'elle est nettement PLUS proche de la surface que
    // l'encre ne l'est.
    const grille = contrasteOklch(jeton("schema-grid", registre), surface());
    const encre = contrasteOklch(jeton("schema-ink", registre), surface());
    expect(grille).toBeLessThan(encre / 3);
  });
});

describe("jetons de croquis — cohérence avec PLANCHE", () => {
  it("chaque jeton de croquis est un alias, jamais une couleur propre", () => {
    // C'est la garantie qu'aucun système graphique parallèle ne se crée. Une
    // valeur `oklch()` écrite en dur ici serait une couleur que la charte ne
    // contrôle plus.
    const debutSombre = CSS.indexOf(".dark {");
    const clair = CSS.slice(0, debutSombre);
    const declarations = [...clair.matchAll(/--schema-([\w-]+):\s*([^;]+);/g)];

    expect(declarations.length).toBe(8);
    for (const [, nom, valeur] of declarations) {
      expect(valeur.trim(), `--schema-${nom} doit aliaser un jeton existant`).toMatch(
        /^var\(--[\w-]+\)$/
      );
    }
  });

  it("le registre sombre déclare exactement les mêmes rôles", () => {
    const debutSombre = CSS.indexOf(".dark {");
    const roles = (zone: string) =>
      [...zone.matchAll(/--schema-([\w-]+):/g)].map((m) => m[1]).sort();

    expect(roles(CSS.slice(debutSombre))).toEqual(roles(CSS.slice(0, debutSombre)));
  });

  it("la grille sombre est opaque, et c'est délibéré", () => {
    // Seule dérogation à la règle d'alias, et elle est mesurable : en sombre,
    // `--border` porte une transparence (`/ 12%`). Un trait semi-transparent se
    // compose sur ce qu'il y a derrière, donc change d'aspect selon le fond —
    // inacceptable pour un repère de croquis.
    const debutSombre = CSS.indexOf(".dark {");
    expect(CSS.slice(debutSombre)).toMatch(/--schema-grid:\s*oklch\([^)]*\);/);
    expect(CSS.slice(debutSombre)).toMatch(/--border:\s*oklch\([^)]*\/\s*12%\)/);
  });
});
