import { describe, expect, it } from "vitest";

import { numeroDeSection, sasDeSortie, sommaireLecon, type SourcesSommaire } from "./sommaire";

const COMPLET: SourcesSommaire = {
  etapes: true,
  interaction: true,
  quiz: true,
  exercices: true,
};

describe("sommaireLecon", () => {
  it("suit l'ordre du document", () => {
    expect(sommaireLecon(COMPLET).map((e) => e.id)).toEqual([
      "objectifs",
      "prerequis",
      "fiches",
      "etapes",
      "manipuler",
      "se-tester",
      "exercices-titre",
      "essentiel",
    ]);
  });

  it("n'annonce que les sections réellement rendues", () => {
    const minimal = sommaireLecon({
      etapes: false,
      interaction: false,
      quiz: false,
      exercices: false,
    });
    // Les prérequis restent : la section dit « aucun », ce qui est une
    // information. Étapes, manipulation, quiz et exercices, eux, disparaissent.
    expect(minimal.map((e) => e.id)).toEqual(["objectifs", "prerequis", "fiches", "essentiel"]);
  });

  it("numérote les sections du document, jamais les blocs d'activité", () => {
    const numerotees = sommaireLecon(COMPLET).filter((e) => e.numero !== undefined);
    expect(numerotees.map((e) => e.id)).toEqual([
      "objectifs",
      "prerequis",
      "fiches",
      "exercices-titre",
    ]);
    // On cite « le § 4 » pour désigner un paragraphe, jamais un quiz.
    for (const id of ["etapes", "manipuler", "se-tester"]) {
      expect(sommaireLecon(COMPLET).find((e) => e.id === id)?.numero).toBeUndefined();
    }
  });

  it("numérote sans trou quand les exercices manquent", () => {
    // Un sommaire qui saute un numéro laisse croire à une section masquée.
    const sans = sommaireLecon({ ...COMPLET, exercices: false });
    expect(sans.filter((e) => e.numero).map((e) => e.numero)).toEqual([1, 2, 3]);
  });

  it("donne à la page les mêmes numéros qu'à elle-même", () => {
    // La page lit ses numéros ici : une seule source, donc aucun désaccord
    // possible entre la marge du corps et le sommaire de l'annexe.
    const sommaire = sommaireLecon(COMPLET);
    expect(numeroDeSection(sommaire, "objectifs")).toBe(1);
    expect(numeroDeSection(sommaire, "exercices-titre")).toBe(4);
    expect(numeroDeSection(sommaire, "manipuler")).toBeUndefined();
    expect(numeroDeSection(sommaire, "inconnue")).toBeUndefined();
  });

  it("ne rend jamais deux fois la même ancre", () => {
    for (const prerequis of [true, false]) {
      for (const exercices of [true, false]) {
        const ids = sommaireLecon({ ...COMPLET, quiz: prerequis, exercices }).map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });
});

describe("sasDeSortie", () => {
  it("ne s'affiche pas quand aucune question ne porte sur la leçon", () => {
    expect(sasDeSortie(0)).toBeNull();
    expect(sasDeSortie(-3)).toBeNull();
  });

  it("accorde le singulier", () => {
    expect(sasDeSortie(1)).toBe("1 question porte sur cette leçon");
  });

  it("accorde le pluriel", () => {
    expect(sasDeSortie(14)).toBe("14 questions portent sur cette leçon");
  });
});
