import { describe, expect, it } from "vitest";

import {
  ANCRES_RESERVEES,
  ancreQuiz,
  sommaireCahier,
  sommaireLeconFiche,
  sommaireNotice,
  sommaireSituation,
} from "./sommaire";

/**
 * Le sommaire d'une notice — lot M6b.
 *
 * Ce que ces tests protègent n'est pas une mise en page : ce sont des **ancres
 * publiques**. `#l-essentiel`, `#pieges`, `#sources` et les identifiants de
 * section existaient dans le gabarit historique ; un lecteur a pu les coller
 * dans un message. Une migration graphique n'a pas le droit de les casser.
 */
const SECTIONS = [
  { id: "role-et-missions", title: "Rôle et missions" },
  { id: "unites", title: "Unités et bases" },
];

const complet = {
  sections: SECTIONS,
  caracteristiques: true,
  pieges: true,
  documents: true,
  quiz: true,
};

describe("sommaire d'une notice", () => {
  it("conserve les ancres publiques du gabarit historique", () => {
    const ids = sommaireNotice(complet).map((e) => e.id);
    for (const ancre of ["l-essentiel", "role-et-missions", "unites", "pieges", "sources"]) {
      expect(ids, `ancre publique ${ancre}`).toContain(ancre);
    }
  });

  it("ouvre sur L’essentiel et ferme sur les Sources", () => {
    const ids = sommaireNotice(complet).map((e) => e.id);
    expect(ids[0]).toBe("l-essentiel");
    expect(ids.at(-1)).toBe("sources");
  });

  it("suit l’ordre du document", () => {
    expect(sommaireNotice(complet).map((e) => e.id)).toEqual([
      "l-essentiel",
      "role-et-missions",
      "unites",
      "signaletique",
      "pieges",
      "documents",
      "s-entrainer",
      "sources",
    ]);
  });

  it("numérote les paragraphes d’affilée, sans trou", () => {
    const numeros = sommaireNotice(complet)
      .map((e) => e.numero)
      .filter((n): n is number => n !== undefined);
    expect(numeros).toEqual(Array.from({ length: numeros.length }, (_, i) => i + 1));
  });

  it("ne numérote pas le quiz : on ne cite pas « le § 7 » pour un quiz", () => {
    const entree = sommaireNotice(complet).find((e) => e.id === "s-entrainer");
    expect(entree?.numero).toBeUndefined();
  });

  it("omet les blocs que la notice ne porte pas", () => {
    const ids = sommaireNotice({
      sections: [],
      caracteristiques: false,
      pieges: false,
      documents: false,
      quiz: false,
    }).map((e) => e.id);
    // Quatre notices du corpus n'ont ni specs, ni infobox : leur sommaire ne
    // doit pas annoncer des sections absentes de la page.
    expect(ids).toEqual(["l-essentiel", "sources"]);
  });

  it("reste stable : deux appels rendent la même chose", () => {
    expect(sommaireNotice(complet)).toEqual(sommaireNotice(complet));
  });
});

/**
 * Le gabarit pose des identifiants ; le contenu en pose aussi. Deux éléments
 * ne peuvent pas porter le même : l'ancre devient ambiguë et le HTML invalide.
 *
 * Ce test a une histoire : `#caracteristiques` était l'ancre du bloc de
 * spécifications, et quatre fiches rédigent déjà une section de ce nom. Un test
 * end-to-end l'a montré — « resolved to 2 elements ». D'où le renommage en
 * `#signaletique`, et d'où ce garde-fou, qui vaut pour les ajouts à venir.
 */
describe("les ancres du gabarit ne heurtent aucune section rédigée", () => {
  it("aucune notice ne rédige une section portant une ancre réservée", async () => {
    const { getFichesParArchetype } = await import("@/lib/content/archetypes");
    const heurts: string[] = [];
    for (const fiche of getFichesParArchetype("identification")) {
      for (const section of fiche.content.sections) {
        if ((ANCRES_RESERVEES as readonly string[]).includes(section.id)) {
          heurts.push(`${fiche.id} → #${section.id}`);
        }
      }
    }
    expect(heurts, "renommer la section rédigée, jamais l'ancre du gabarit").toEqual([]);
  });
});

/**
 * Le Cahier — lot M7b.
 *
 * Un récit n'a ni fiche signalétique ni documents : son plan est plus court, et
 * ses ancres sont exactement celles du gabarit historique. Aucune n'est
 * inventée pour la circonstance.
 */
describe("sommaire d’un article du Cahier", () => {
  const complet = { sections: SECTIONS, pieges: true, quiz: true };

  it("suit l’ordre du document", () => {
    expect(sommaireCahier(complet).map((e) => e.id)).toEqual([
      "l-essentiel",
      "role-et-missions",
      "unites",
      "pieges",
      "s-entrainer",
      "sources",
    ]);
  });

  it("n’annonce ni fiche signalétique ni documents", () => {
    const ids = sommaireCahier(complet).map((e) => e.id);
    expect(ids).not.toContain("signaletique");
    expect(ids).not.toContain("documents");
  });

  it("numérote sans trou et laisse le quiz hors numérotation", () => {
    const entrees = sommaireCahier(complet);
    const numeros = entrees.map((e) => e.numero).filter((n): n is number => n !== undefined);
    expect(numeros).toEqual(Array.from({ length: numeros.length }, (_, i) => i + 1));
    expect(entrees.find((e) => e.id === "s-entrainer")?.numero).toBeUndefined();
  });
});

/**
 * La Situation — lot M7b.
 *
 * Une seule propriété compte vraiment ici, et c'est le geste éditorial le plus
 * fort du site : **« ce qui reste incertain » ne peut pas disparaître.** Aucune
 * combinaison de contenu ne doit permettre à une situation de se taire sur ce
 * que ses sources ne tranchent pas.
 */
describe("sommaire d’une situation", () => {
  it("porte toujours « ce qui reste incertain », quel que soit le contenu", () => {
    const combinaisons = [
      { sections: SECTIONS, pieges: true, quiz: true },
      { sections: SECTIONS, pieges: false, quiz: false },
      { sections: [], pieges: false, quiz: false },
      { sections: [], pieges: true, quiz: true },
    ];
    for (const c of combinaisons) {
      expect(
        sommaireSituation(c).map((e) => e.id),
        JSON.stringify(c)
      ).toContain("ce-qui-reste-incertain");
    }
  });

  it("la place après les sections rédigées, avant les pièges", () => {
    const ids = sommaireSituation({ sections: SECTIONS, pieges: true, quiz: false }).map(
      (e) => e.id
    );
    expect(ids.indexOf("ce-qui-reste-incertain")).toBeGreaterThan(ids.indexOf("unites"));
    expect(ids.indexOf("ce-qui-reste-incertain")).toBeLessThan(ids.indexOf("pieges"));
  });

  it("lui donne un numéro de plein rang : ce n’est pas une note", () => {
    const entree = sommaireSituation({ sections: SECTIONS, pieges: false, quiz: false }).find(
      (e) => e.id === "ce-qui-reste-incertain"
    );
    expect(entree?.numero).toBeGreaterThan(0);
  });

  it("son ancre est réservée : aucune fiche ne peut la rédiger", () => {
    expect(ANCRES_RESERVEES).toContain("ce-qui-reste-incertain");
  });
});

/**
 * Le garde-fou d'ancres, étendu aux familles migrées au lot M7b.
 */
describe("les ancres du gabarit ne heurtent aucune section rédigée — Cahier et Situation", () => {
  it.each(["cahier", "situation", "lecon"] as const)("famille %s", async (famille) => {
    const { getFichesParArchetype } = await import("@/lib/content/archetypes");
    const heurts: string[] = [];
    for (const fiche of getFichesParArchetype(famille)) {
      for (const section of fiche.content.sections) {
        if ((ANCRES_RESERVEES as readonly string[]).includes(section.id)) {
          heurts.push(`${fiche.id} → #${section.id}`);
        }
      }
    }
    expect(heurts, "renommer la section rédigée, jamais l'ancre du gabarit").toEqual([]);
  });
});

/**
 * L'ancre du quiz — lot M8b.
 *
 * Le cas qui a motivé cette règle : deux fiches du corpus rédigent une section
 * `s-entrainer`, l'ancre que `NotionQuiz` pose depuis l'origine. Deux éléments
 * ne peuvent pas partager un identifiant.
 */
describe("ancre du bloc hôte du quiz", () => {
  it("garde l’ancre historique quand le contenu ne la revendique pas", () => {
    expect(ancreQuiz(SECTIONS)).toBe("s-entrainer");
    expect(ancreQuiz([])).toBe("s-entrainer");
  });

  it("cède l’ancre à la section rédigée, jamais l’inverse", () => {
    // C'est le bloc hôte qui bouge. Renommer la section de l'auteur casserait
    // une ancre publique du contenu ; retirer le quiz retirerait une fonction.
    expect(ancreQuiz([{ id: "s-entrainer" }])).toBe("se-tester");
  });

  it("échoue plutôt que de servir un identifiant en double", () => {
    expect(() => ancreQuiz([{ id: "s-entrainer" }, { id: "se-tester" }])).toThrow(
      /Ancres du quiz indisponibles/
    );
  });

  it("relève le cas réel sur le corpus, pas sur une liste écrite à la main", async () => {
    // UNE seule fiche est concernée. Un premier relevé en avait compté trois :
    // le motif de recherche attrapait `s-entrainer-efficacement` et
    // `s-entrainer-en-conditions` par préfixe. D'où ce test, qui interroge le
    // corpus en correspondance exacte plutôt que de figer un compte.
    const { getFichesParArchetype } = await import("@/lib/content/archetypes");
    const cedantes = getFichesParArchetype("lecon")
      .filter((f) => ancreQuiz(f.content.sections) !== "s-entrainer")
      .map((f) => f.id)
      .sort();
    expect(cedantes).toEqual(["psychotechnique.exercices.les-matrices"]);
  });

  it("aucune fiche migrée ne revendique les deux ancres à la fois", async () => {
    const { getFichesParArchetype } = await import("@/lib/content/archetypes");
    for (const famille of ["identification", "lecon", "cahier", "situation"] as const) {
      for (const fiche of getFichesParArchetype(famille)) {
        expect(() => ancreQuiz(fiche.content.sections), fiche.id).not.toThrow();
      }
    }
  });
});

/**
 * Le sommaire d'une fiche de notion — lot M8b.
 *
 * La garantie centrale : **il ne convertit pas une fiche en cours.** Aucune des
 * rubriques propres à la leçon canonique — objectifs, prérequis, étapes,
 * interaction, exercices, sas de sortie — ne doit apparaître, puisque le schéma
 * de la fiche ne les porte pas.
 */
describe("sommaire d’une fiche de notion", () => {
  const complet = { sections: SECTIONS, pieges: true, quiz: true };

  it("suit l’ordre du document", () => {
    expect(sommaireLeconFiche(complet).map((e) => e.id)).toEqual([
      "l-essentiel",
      "role-et-missions",
      "unites",
      "pieges",
      "s-entrainer",
      "sources",
    ]);
  });

  it("n’invente aucune rubrique de cours", () => {
    const ids = sommaireLeconFiche(complet).map((e) => e.id);
    for (const rubrique of ["objectifs", "prerequis", "etapes", "manipuler", "exercices-titre"]) {
      expect(ids, `« ${rubrique} » n'existe pas sur le schéma d'une fiche`).not.toContain(rubrique);
    }
  });

  it("place le quiz sur l’ancre résolue", () => {
    const ids = sommaireLeconFiche({
      sections: [{ id: "s-entrainer", title: "S’entraîner" }],
      pieges: false,
      quiz: true,
    }).map((e) => e.id);
    // La section rédigée garde son ancre ; le bloc hôte prend la sienne.
    expect(ids).toContain("s-entrainer");
    expect(ids).toContain("se-tester");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("numérote sans trou et laisse le quiz hors numérotation", () => {
    const entrees = sommaireLeconFiche(complet);
    const numeros = entrees.map((e) => e.numero).filter((n): n is number => n !== undefined);
    expect(numeros).toEqual(Array.from({ length: numeros.length }, (_, i) => i + 1));
    expect(entrees.find((e) => e.id === "s-entrainer")?.numero).toBeUndefined();
  });
});
