import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getFiches } from "./fiches";

/**
 * Identifiants dupliqués dans les schémas SVG — **dette M8b, close en C2**.
 *
 * ── Ce que ce fichier gardait ───────────────────────────────────────────
 * Certains fichiers de `content/schemas/` déclaraient le même identifiant de
 * `<marker>` — `a` ou `ac`. Montés sur une même page, le document servait un
 * `id` en double et `url(#ac)` résolvait sur la première occurrence, donc, pour
 * la seconde figure, sur une définition qui n'était pas la sienne.
 *
 * Seize pages étaient touchées. Quinze ont été corrigées au lot M10 par
 * préfixage. La seizième — `/fondamentaux/instruments/chaine-pitot-statique` —
 * ne pouvait pas l'être sous la même règle : ses deux définitions `ac`
 * **différaient** (markerWidth 7 contre 6), et les rendre uniques aurait
 * changé la taille des pointes de flèche de `chaine-anemobarometrique`.
 * M10 excluait explicitement tout changement visuel.
 *
 * ── Comment elle s'est refermée ─────────────────────────────────────────
 * Le lot C2 a **reconstruit** `chaine-anemobarometrique` de fond en comble, en
 * tant que croquis pilote P-4. Le fichier est neuf : ses identifiants sont
 * préfixés par construction, et la question de la taille des pointes ne se
 * pose plus, puisque aucun trait de l'ancien dessin ne subsiste. `id="ac"` a
 * disparu du corpus avec lui.
 *
 * `pitot-statique-sources` n'a **pas** été touché : il conserve son `id="ac"`,
 * désormais seul sur sa page, donc sans collision. Il reste hors du contrat des
 * croquis scientifiques, et son préfixage appartient à un lot ultérieur.
 *
 * ── Ce que ce fichier garde MAINTENANT ──────────────────────────────────
 * Le fait que la dette est close, et qu'elle ne se rouvre pas. Il ne se
 * contente plus de figer un relevé : il **calcule** les doublons sur le corpus
 * entier et exige qu'il n'y en ait aucun. Un croquis ajouté demain avec un
 * `id="a"` non préfixé fera tomber ce test, sans qu'aucun registre n'ait à
 * être tenu à jour.
 */

const SCHEMAS = path.join(process.cwd(), "content", "schemas");

/** Les identifiants déclarés par un schéma, et ceux qu'il référence. */
function identifiants(schemaId: string): { declares: string[]; references: string[] } {
  const fichier = path.join(SCHEMAS, `${schemaId}.svg`);
  if (!existsSync(fichier)) {
    return { declares: [], references: [] };
  }
  const src = readFileSync(fichier, "utf-8");
  return {
    declares: [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
    references: [...src.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]),
  };
}

/** Les doublons réellement présents, calculés sur le corpus. */
function doublonsDuCorpus(): Map<string, string[]> {
  const trouves = new Map<string, string[]>();
  for (const fiche of getFiches()) {
    const schemas = fiche.content.sections.flatMap((s) => s.figures.map((f) => f.schemaId));
    if (schemas.length < 2) continue;
    const compte = new Map<string, number>();
    for (const s of schemas) {
      for (const id of identifiants(s).declares) {
        compte.set(id, (compte.get(id) ?? 0) + 1);
      }
    }
    const dbl = [...compte.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    if (dbl.length > 0) {
      trouves.set(`/${fiche.module}/${fiche.category}/${fiche.slug}`, dbl.sort());
    }
  }
  return trouves;
}

describe("identifiants des schémas SVG — dette close", () => {
  it("aucune page ne sert deux fois le même identifiant", () => {
    const doublons = [...doublonsDuCorpus().entries()].map(([page, ids]) => `${page} : ${ids}`);
    expect(doublons, "un doublon d'identifiant est réapparu").toEqual([]);
  });

  it("chaque référence interne résout dans son propre fichier", () => {
    // Le préfixage doit réécrire les DEUX côtés. Une définition renommée sans
    // son renvoi laisserait une flèche invisible — un défaut silencieux, que
    // seul ce contrôle attrape.
    const cassees: string[] = [];
    for (const fiche of getFiches()) {
      for (const schemaId of fiche.content.sections.flatMap((s) =>
        s.figures.map((f) => f.schemaId)
      )) {
        const { declares, references } = identifiants(schemaId);
        for (const cible of references) {
          if (!declares.includes(cible)) cassees.push(`${schemaId} → #${cible}`);
        }
      }
    }
    expect(cassees).toEqual([]);
  });

  it("l'ancien identifiant « ac » de la paire divergente a bien disparu", () => {
    // Contrôle nominal du cas qui restait. `chaine-anemobarometrique` est
    // reconstruit ; `pitot-statique-sources` est intact et garde le sien, seul
    // sur sa page. C'est cette asymétrie, exactement, qui referme la dette.
    expect(identifiants("chaine-anemobarometrique").declares).not.toContain("ac");
    expect(identifiants("pitot-statique-sources").declares).toContain("ac");
  });

  it("les identifiants du croquis reconstruit sont préfixés par son nom", () => {
    for (const id of identifiants("chaine-anemobarometrique").declares) {
      expect(id).toMatch(/^chaine-anemobarometrique__/);
    }
  });
});
