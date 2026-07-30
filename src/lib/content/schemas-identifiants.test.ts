import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getFiches } from "./fiches";

/**
 * Registre des identifiants dupliqués dans les schémas SVG — dette M8b.
 *
 * LE DÉFAUT. Certains fichiers de `content/schemas/` déclarent le même
 * identifiant de `<marker>` — `a` ou `ac`, les pointes de flèche. Quand deux
 * d'entre eux sont montés sur la même page, le document sert un `id` en double
 * et `url(#ac)` résout sur la première occurrence.
 *
 * POURQUOI IL N'EST PAS CORRIGÉ ICI. Il est **antérieur** aux lots de migration
 * (mesuré identique avant et après) et il vit **dans le contenu**, pas dans les
 * gabarits. Le corriger exigeait soit d'éditer des fichiers de contenu, soit de
 * préfixer les identifiants dans `FicheFigure`, ce qui aurait changé le rendu
 * d'autres familles. Les deux sortaient du périmètre de M8b.
 *
 * SON EFFET RÉEL, MESURÉ. **Dix-sept paires sur dix-huit sont inertes** : les
 * deux définitions y sont identiques, la flèche se rend donc correctement quel
 * que soit l'ordre. La dix-huitième ne l'est pas — voir `DIVERGENTS`. J'avais
 * d'abord annoncé le défaut comme uniformément « sans effet visuel » : c'est
 * faux, et c'est ce troisième test qui l'a établi.
 *
 * CE QUE CE TEST FAIT. Il ne masque pas la dette : il la **fige**. Il passe tant
 * que la situation est exactement celle relevée le 2026-07-29 ; il tombe si un
 * doublon **apparaît** ailleurs, et il tombe aussi si un doublon **disparaît**
 * sans que le registre soit mis à jour. La dette ne peut donc ni s'aggraver en
 * silence, ni être corrigée à moitié.
 *
 * CE QUE LA CORRECTION DEVRA FAIRE (docs/roadmap.md) : attribuer à chaque figure
 * des identifiants uniques et stables, en mettant à jour **simultanément** les
 * références `url(#…)` internes, **sans toucher à la géométrie** ni au contenu
 * visuel.
 */

/** Relevé du 2026-07-29 — 16 pages, 32 schémas, identifiants « a » et « ac ». */
const REGISTRE: { page: string; identifiants: string[]; schemas: string[] }[] = [
  {
    page: "/fondamentaux/aerodynamique/decrochage",
    identifiants: ["ac"],
    schemas: ["decrochage-courbe-cz", "decrochage-ecoulement"],
  },
  {
    page: "/fondamentaux/aerodynamique/ecoulement-de-l-air",
    identifiants: ["ac"],
    schemas: ["filets-air", "venturi"],
  },
  {
    page: "/fondamentaux/aerodynamique/portance",
    identifiants: ["ac"],
    schemas: ["portance-incidence", "portance-origine"],
  },
  {
    page: "/fondamentaux/aerodynamique/trainee",
    identifiants: ["ac"],
    schemas: ["trainee-forces", "trainee-sources"],
  },
  {
    page: "/fondamentaux/facteurs-humains/desorientation-et-illusions",
    identifiants: ["ac"],
    schemas: ["croire-instruments", "illusion-acceleration"],
  },
  {
    page: "/fondamentaux/instruments/chaine-pitot-statique",
    identifiants: ["ac"],
    schemas: ["chaine-anemobarometrique", "pitot-statique-sources"],
  },
  {
    page: "/fondamentaux/mecanique-du-vol/decrochage-et-vrille",
    identifiants: ["ac"],
    schemas: ["vrille-asymetrie", "vrille-trajectoire"],
  },
  {
    page: "/fondamentaux/mecanique-du-vol/quatre-forces",
    identifiants: ["a"],
    schemas: ["equilibre-en-palier", "quatre-forces-avion"],
  },
  {
    page: "/fondamentaux/mecanique-du-vol/virage",
    identifiants: ["ac"],
    schemas: ["facteur-de-charge", "virage-decomposition"],
  },
  {
    page: "/fondamentaux/meteorologie/atmosphere-standard",
    identifiants: ["ac"],
    schemas: ["pression-altitude", "profil-isa"],
  },
  {
    page: "/fondamentaux/meteorologie/le-vent",
    identifiants: ["ac"],
    schemas: ["triangle-des-vitesses", "vent-pression"],
  },
  {
    page: "/fondamentaux/meteorologie/les-nuages",
    identifiants: ["ac"],
    schemas: ["etages-nuages", "formation-nuage"],
  },
  {
    page: "/fondamentaux/meteorologie/pression-et-calage",
    identifiants: ["ac"],
    schemas: ["calage-transition", "calages-altimetriques"],
  },
  {
    page: "/fondamentaux/navigation/cap-route-et-derive",
    identifiants: ["a", "ac"],
    schemas: ["cap-route-derive", "nord-vrai-magnetique"],
  },
  {
    page: "/fondamentaux/navigation/declinaison-magnetique",
    identifiants: ["a", "ac"],
    schemas: ["declinaison-est-ouest", "nord-vrai-magnetique"],
  },
  {
    page: "/fondamentaux/physique/pression-forces-unites",
    identifiants: ["ac"],
    schemas: ["force-vecteur", "pression-atmospherique", "pression-force-surface"],
  },
];

/**
 * La seule paire dont les deux définitions **diffèrent** — relevé du 2026-07-29.
 *
 * `pitot-statique-sources` est monté **avant** `chaine-anemobarometrique` sur la
 * page (ordre des figures dans le YAML). Le premier `id="ac"` gagne : les
 * pointes de flèche de `chaine-anemobarometrique` se rendent en 7 × 7 alors que
 * son fichier déclare 6 × 6. La géométrie du chemin, l'orientation et la couleur
 * sont identiques — seule la taille des pointes de la seconde figure est
 * affectée, et elle l'est **en plus grand**.
 *
 * Conséquence pour la correction : sur cette page, donner des identifiants
 * uniques **changera** le rendu — les flèches de la seconde figure rétréciront à
 * la taille que son auteur avait écrite. C'est un retour à l'intention, pas une
 * régression, mais il doit être annoncé et non découvert.
 */
const DIVERGENTS: { page: string; id: string; gagnant: string; perdant: string }[] = [
  {
    page: "/fondamentaux/instruments/chaine-pitot-statique",
    id: "ac",
    gagnant: "pitot-statique-sources",
    perdant: "chaine-anemobarometrique",
  },
];

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

/** Le corps de l'élément qui déclare `id`, tel qu'il est écrit dans le fichier. */
function definitionDe(schemaId: string, id: string): string | null {
  const fichier = path.join(SCHEMAS, `${schemaId}.svg`);
  if (!existsSync(fichier)) return null;
  const m = new RegExp(`<[a-zA-Z]+ id="${id}"[\\s\\S]*?</[a-zA-Z]+>`).exec(
    readFileSync(fichier, "utf-8")
  );
  return m?.[0] ?? null;
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

describe("dette — identifiants dupliqués dans les schémas SVG", () => {
  it("la dette n'a ni grandi ni changé de forme", () => {
    const reels = doublonsDuCorpus();
    const attendus = new Map(REGISTRE.map((e) => [e.page, [...e.identifiants].sort()]));

    const apparus = [...reels.keys()].filter((p) => !attendus.has(p));
    expect(apparus, "de nouveaux doublons sont apparus — les inscrire au registre").toEqual([]);

    const disparus = [...attendus.keys()].filter((p) => !reels.has(p));
    expect(
      disparus,
      "des doublons ont été corrigés — retirer ces pages du registre et de la roadmap"
    ).toEqual([]);

    for (const [page, ids] of attendus) {
      expect(reels.get(page), page).toEqual(ids);
    }
  });

  it("chaque doublon du registre est bien un marqueur référencé par url(#…)", () => {
    // Le doublon n'est pas un identifiant mort laissé dans un `<defs>` : il est
    // réellement résolu par `url(#…)` dans chacun des deux fichiers. C'est ce
    // qui rend la collision effective plutôt que théorique.
    for (const { page, identifiants: ids, schemas } of REGISTRE) {
      for (const id of ids) {
        const definitions = schemas
          .map((s) => identifiants(s))
          .filter((x) => x.declares.includes(id));
        expect(definitions.length, `${page} — ${id}`).toBeGreaterThan(1);
        for (const d of definitions) {
          expect(d.references, `${page} — ${id} doit être référencé dans son fichier`).toContain(
            id
          );
        }
      }
    }
  });

  it("une seule paire a un effet visuel : les dix-sept autres sont inertes", () => {
    // Ce test ne postule pas l'innocuité, il la **compte**. Une paire de plus
    // dont les définitions divergent, et le décompte tombe : on saurait qu'une
    // figure vient de changer d'aspect sans que personne l'ait décidé.
    const divergentsReels: { page: string; id: string }[] = [];
    let inertes = 0;

    for (const { page, identifiants: ids, schemas } of REGISTRE) {
      for (const id of ids) {
        const distincts = new Set(
          schemas
            .map((s) => definitionDe(s, id))
            .filter((c): c is string => c !== null)
            .map((c) => c.replace(/\s+/g, " "))
        );
        if (distincts.size === 1) inertes++;
        else divergentsReels.push({ page, id });
      }
    }

    expect(divergentsReels).toEqual(DIVERGENTS.map(({ page, id }) => ({ page, id })));
    expect(inertes, "paires dont les deux définitions sont identiques").toBe(17);
  });

  it("sur la paire divergente, c’est bien la définition annoncée qui l’emporte", () => {
    // `url(#…)` résout sur la **première** occurrence du document. Savoir
    // laquelle gagne n'est pas une curiosité : c'est ce qui dit quel rendu la
    // correction future va modifier, et dans quel sens.
    for (const { page, id, gagnant, perdant } of DIVERGENTS) {
      const fiche = getFiches().find((f) => `/${f.module}/${f.category}/${f.slug}` === page);
      expect(fiche, `fiche introuvable — ${page}`).toBeDefined();

      const ordre = fiche!.content.sections.flatMap((s) => s.figures.map((f) => f.schemaId));
      expect(ordre).toContain(gagnant);
      expect(ordre).toContain(perdant);
      expect(
        ordre.indexOf(gagnant),
        `${page} — ${gagnant} doit être monté avant ${perdant}`
      ).toBeLessThan(ordre.indexOf(perdant));

      // Et les deux définitions diffèrent bien : sans cela, « gagnant » et
      // « perdant » n'auraient aucun sens.
      expect(definitionDe(gagnant, id)).not.toBe(definitionDe(perdant, id));
    }
  });
});
