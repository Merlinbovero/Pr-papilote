import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { cleQuarantaine, ecrireStocke, lireStocke, VERSION_HERITEE } from "./stockage";

/**
 * Le contrat du stockage versionné — lot F11.
 *
 * Chaque assertion correspond à un défaut réel du produit avant ce lot : douze
 * clés, trois conventions, un marqueur de version que personne ne lisait, et
 * douze `as T` sur des données venues de l'extérieur du programme.
 *
 * **Ce que ces tests protègent, ce sont de vraies données** : les échéances de
 * révision espacée, les historiques d'examen et de séance. Une régression ici
 * ne casse pas un rendu, elle efface le travail de quelqu'un.
 */

const CLE = "test.stockage";
const schema = z.array(z.object({ id: z.string(), score: z.number() }));
const DEFAUT: z.infer<typeof schema> = [];
const VALIDE = [{ id: "a", score: 3 }];

describe("lireStocke", () => {
  beforeEach(() => window.localStorage.clear());

  it("renvoie le défaut quand rien n'est stocké", () => {
    expect(lireStocke(CLE, schema, DEFAUT, { version: 1 })).toEqual([]);
  });

  it("relit ce qu'il a écrit", () => {
    ecrireStocke(CLE, VALIDE, 1);
    expect(lireStocke(CLE, schema, DEFAUT, { version: 1 })).toEqual(VALIDE);
  });

  it("accepte une donnée écrite AVANT ce lot, sans enveloppe", () => {
    /*
      Le cas qui décide de tout : les utilisateurs actuels ont des tableaux
      nus sous ces clés. Les refuser reviendrait à effacer leur travail au
      premier chargement — le défaut que ce module existe pour empêcher.
    */
    window.localStorage.setItem(CLE, JSON.stringify(VALIDE));
    const lu = lireStocke(CLE, schema, DEFAUT, {
      version: 1,
      migrer: (depuis, charge) => (depuis === VERSION_HERITEE ? charge : undefined),
    });
    expect(lu).toEqual(VALIDE);
  });

  it("met en quarantaine une donnée illisible, et ne la détruit pas", () => {
    window.localStorage.setItem(CLE, "{ ceci n'est pas du JSON");
    expect(lireStocke(CLE, schema, DEFAUT, { version: 1 })).toEqual([]);
    // La valeur d'origine est copiée, pas jetée : elle reste analysable.
    expect(window.localStorage.getItem(cleQuarantaine(CLE))).toBe("{ ceci n'est pas du JSON");
  });

  it("met en quarantaine une donnée qui ne respecte pas le schéma", () => {
    // Exactement ce qu'un `as T` laissait passer : la forme est plausible,
    // le contenu ne l'est pas.
    const faux = [{ id: "a", score: "beaucoup" }];
    ecrireStocke(CLE, faux, 1);
    expect(lireStocke(CLE, schema, DEFAUT, { version: 1 })).toEqual([]);
    expect(window.localStorage.getItem(cleQuarantaine(CLE))).toContain("beaucoup");
  });

  it("n'écrase pas une quarantaine déjà posée", () => {
    // La première anomalie est la plus instructive ; l'écraser transformerait
    // une mise de côté en perte.
    window.localStorage.setItem(cleQuarantaine(CLE), "première anomalie");
    window.localStorage.setItem(CLE, "encore illisible");
    lireStocke(CLE, schema, DEFAUT, { version: 1 });
    expect(window.localStorage.getItem(cleQuarantaine(CLE))).toBe("première anomalie");
  });

  it("refuse une version inconnue plutôt que de la lire de travers", () => {
    ecrireStocke(CLE, VALIDE, 99);
    expect(lireStocke(CLE, schema, DEFAUT, { version: 1 })).toEqual([]);
    // Mise de côté, donc récupérable si une migration est écrite plus tard.
    expect(window.localStorage.getItem(cleQuarantaine(CLE))).toContain('"v":99');
  });

  it("applique la migration fournie et accepte le résultat", () => {
    // Une v1 stockait le score en chaîne ; la v2 le veut en nombre.
    window.localStorage.setItem(CLE, JSON.stringify({ v: 1, d: [{ id: "a", score: "3" }] }));
    const lu = lireStocke(CLE, schema, DEFAUT, {
      version: 2,
      migrer: (depuis, charge) =>
        depuis === 1
          ? (charge as { id: string; score: string }[]).map((e) => ({
              ...e,
              score: Number(e.score),
            }))
          : undefined,
    });
    expect(lu).toEqual([{ id: "a", score: 3 }]);
  });

  it("met en quarantaine quand la migration se déclare impossible", () => {
    ecrireStocke(CLE, VALIDE, 1);
    const lu = lireStocke(CLE, schema, DEFAUT, { version: 2, migrer: () => undefined });
    expect(lu).toEqual([]);
    expect(window.localStorage.getItem(cleQuarantaine(CLE))).not.toBeNull();
  });

  it("survit à un stockage qui lève à la lecture", () => {
    const original = window.localStorage.getItem;
    window.localStorage.getItem = () => {
      throw new Error("stockage refusé");
    };
    try {
      expect(lireStocke(CLE, schema, DEFAUT, { version: 1 })).toEqual([]);
    } finally {
      window.localStorage.getItem = original;
    }
  });
});

describe("ecrireStocke", () => {
  beforeEach(() => window.localStorage.clear());

  it("écrit la version DANS la donnée, pas dans le nom de la clé", () => {
    /*
      C'est la correction de fond du lot. Huit clés portaient `.v1` dans leur
      nom sans que rien ne le lise : passer à `.v2` aurait écrit ailleurs et
      abandonné les données précédentes en silence.
    */
    ecrireStocke(CLE, VALIDE, 3);
    expect(JSON.parse(window.localStorage.getItem(CLE)!)).toEqual({ v: 3, d: VALIDE });
    expect(window.localStorage.getItem(`${CLE}.v3`)).toBeNull();
  });

  it("n'échoue jamais quand le stockage refuse d'écrire", () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("quota dépassé");
    };
    try {
      expect(() => ecrireStocke(CLE, VALIDE, 1)).not.toThrow();
    } finally {
      window.localStorage.setItem = original;
    }
  });
});
