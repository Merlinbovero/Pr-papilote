import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CHEMIN_INDEX_RECHERCHE } from "./artefact";

/**
 * L'index de recherche n'est pas versionné : il n'existe que si le build le
 * fabrique. Cette chaîne relie quatre maillons, et il a suffi qu'un seul
 * cède pour que la palette tombe en production sans qu'aucun test ne bronche.
 *
 *   commande de build → hook `prebuild` → générateur → chemin servi
 *
 * Le maillon qui a cédé est le premier. La commande de build de Vercel
 * n'était pas déclarée dans le dépôt ; le préréglage Next.js appelle
 * `next build` directement, ce qui **ne déclenche pas** le cycle de vie npm,
 * donc pas `prebuild`. Le déploiement partait sans artefact et
 * `/generated/recherche-index.json` répondait 404, tandis que
 * `chargerRecherche()` lève sans repli sur une réponse non-ok.
 *
 * Rien de tout cela n'était visible localement : le fichier traînait sur le
 * disque depuis une compilation antérieure. Les contrôles ci-dessous portent
 * donc sur la **déclaration** de la chaîne, pas sur la présence du fichier —
 * un test qui vérifierait l'artefact passerait précisément dans le cas où il
 * ne prouve rien.
 */

const RACINE = process.cwd();

function lireJson(fichier: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(RACINE, fichier), "utf-8"));
}

describe("chaîne de production de l'index de recherche", () => {
  const vercel = lireJson("vercel.json");
  const scripts = lireJson("package.json").scripts as Record<string, string>;

  it("déclare dans le dépôt la commande de build, au lieu de subir le préréglage", () => {
    // Sans cette ligne, Vercel appelle `next build` et saute le cycle de vie npm.
    expect(vercel.buildCommand).toBe("npm run build");
  });

  it("fait passer la commande de build par un hook qui produit l'index", () => {
    const commande = vercel.buildCommand as string;
    const nomScript = commande.replace(/^npm run /, "");

    // Le hook n'existe que parce que la commande est un script npm : c'est ce
    // couplage, et lui seul, qui garantit la génération.
    expect(commande.startsWith("npm run ")).toBe(true);
    expect(scripts[nomScript]).toBeDefined();
    expect(scripts[`pre${nomScript}`]).toBe("npm run generate:search-index");
    expect(scripts["generate:search-index"]).toContain("scripts/generate-search-index.ts");
  });

  it("écrit là où le client va chercher", () => {
    const source = fs.readFileSync(path.join(RACINE, "scripts/generate-search-index.ts"), "utf-8");
    const segments = CHEMIN_INDEX_RECHERCHE.replace(/^\//, "").split("/");

    // `public/` est la racine servie par Next : le chemin public
    // `/generated/recherche-index.json` correspond au fichier
    // `public/generated/recherche-index.json`. Les deux bouts doivent bouger
    // ensemble, sinon le générateur écrit un fichier que personne ne demande.
    const attendu = ["public", ...segments].map((s) => JSON.stringify(s)).join(", ");
    expect(source).toContain(attendu);
  });
});
