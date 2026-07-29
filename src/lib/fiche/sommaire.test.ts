import { describe, expect, it } from "vitest";

import { ANCRES_RESERVEES, sommaireNotice } from "./sommaire";

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
