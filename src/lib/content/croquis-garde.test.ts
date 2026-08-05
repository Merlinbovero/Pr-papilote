import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ancresHorsCadre, controlerCroquis, CROQUIS_SOUS_CONTRAT } from "./croquis-garde";

/**
 * Preuve de la garde des croquis — lot C2.
 *
 * ── Pourquoi les fixtures invalides sont des fichiers dédiés ────────────
 * Parce que dégrader temporairement un fichier de production pour voir la
 * garde rougir laisse deux traces : un dépôt momentanément faux, et une preuve
 * que personne ne peut rejouer. Ces onze fichiers vivent hors de `content/`,
 * rien ne les rend, rien ne les indexe, et ils échouent à volonté.
 *
 * ── Ce que ces tests exigent, au-delà de « ça échoue » ──────────────────
 * Que chaque fixture tombe **sur sa propre règle**. Une fixture « couleur
 * brute » qui échouerait sur un identifiant mal préfixé passerait le test
 * naïf tout en ne prouvant rien du contrôle des couleurs. C'est la
 * correspondance règle ↔ fixture qui fait la preuve, pas le rouge.
 */

const FIXTURES = path.join(process.cwd(), "src", "lib", "content", "__fixtures__", "croquis");
const SCHEMAS = path.join(process.cwd(), "content", "schemas");

const fixture = (nom: string) => readFileSync(path.join(FIXTURES, `${nom}.svg`), "utf-8");
const croquis = (id: string) => readFileSync(path.join(SCHEMAS, `${id}.svg`), "utf-8");

/** Chaque fixture, et la règle qu'elle doit déclencher. */
const FIXTURES_INVALIDES: { nom: string; regle: string }[] = [
  { nom: "couleur-brute", regle: "couleur-jetonnee" },
  { nom: "identifiant-non-prefixe", regle: "identifiant-prefixe" },
  { nom: "texte-trop-petit", regle: "texte-minimal" },
  { nom: "dimensions-rigides", regle: "dimensions-souples" },
  { nom: "reference-cassee", regle: "reference-resolue" },
  { nom: "viewbox-absent", regle: "viewbox-present" },
  { nom: "svg-expose", regle: "svg-masque" },
  { nom: "raster-embarque", regle: "aucun-raster" },
  { nom: "degrade-decoratif", regle: "aucun-decor" },
  { nom: "texte-vectorise", regle: "texte-vivant" },
];

describe("garde des croquis — la base conforme passe", () => {
  it("la fixture valide ne déclenche aucune violation", () => {
    // Sans ce test, les dix suivants ne prouveraient rien : une garde qui
    // refuse tout « détecte » évidemment chaque défaut.
    expect(controlerCroquis("valide", fixture("valide"))).toEqual([]);
  });

  it("la fixture valide tient aussi dans la marge de sécurité", () => {
    expect(ancresHorsCadre(fixture("valide"))).toEqual([]);
  });
});

describe("garde des croquis — chaque fixture invalide tombe sur SA règle", () => {
  it.each(FIXTURES_INVALIDES)("$nom déclenche « $regle »", ({ nom, regle }) => {
    const violations = controlerCroquis(nom, fixture(nom));
    expect(violations.map((v) => v.regle)).toContain(regle);
  });

  it("une étiquette hors cadre est vue par le contrôle de marge", () => {
    // Séparé des autres : ce contrôle porte sur la géométrie, pas sur la
    // structure, et il rend ses violations par une autre fonction.
    const violations = ancresHorsCadre(fixture("etiquette-hors-cadre"));
    expect(violations.map((v) => v.regle)).toContain("marge-securite");
  });

  it("aucune fixture ne passe la garde", () => {
    for (const { nom } of FIXTURES_INVALIDES) {
      expect(controlerCroquis(nom, fixture(nom)).length, nom).toBeGreaterThan(0);
    }
  });
});

describe("garde des croquis — le registre", () => {
  it("ne contient que ce qui a été reconstruit, nommément", () => {
    // La garde a précédé les pilotes ; chacun s'y inscrit dans son propre
    // commit, avec la preuve qu'il passe — jamais par un balayage de dossier.
    expect(CROQUIS_SOUS_CONTRAT).toEqual(["chaine-anemobarometrique"]);
  });

  it.each([...CROQUIS_SOUS_CONTRAT])("%s ne déclenche aucune violation", (id) => {
    expect(controlerCroquis(id, croquis(id))).toEqual([]);
    expect(ancresHorsCadre(croquis(id))).toEqual([]);
  });
});

describe("garde des croquis — ce qu'elle ne prétend pas faire", () => {
  it("elle ne détecte pas un texte partiellement vectorisé", () => {
    // Contrôle du contrôle. La fixture porte un <text> ET un <path> qui
    // pourrait être une lettre vectorisée : la garde la laisse passer, et
    // c'est la limite annoncée en tête du module — pas un défaut découvert.
    const partiel = fixture("valide").replace(
      "</svg>",
      '  <path d="M20,200 L30,200 L30,210 z" fill="var(--schema-ink)" />\n</svg>'
    );
    expect(controlerCroquis("valide", partiel)).toEqual([]);
  });
});
