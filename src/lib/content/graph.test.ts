import { describe, expect, it } from "vitest";
import type { Predicate } from "./content-schemas";
import { resolveFactualGraph, type GraphNode } from "./graph";
import { getPredicates } from "./referentials";

const predicates: Predicate[] = [
  {
    id: "embarque-sur",
    label: "Embarque sur",
    inverseLabel: "Embarque",
    weight: "forte",
    sourceFamilies: ["appareil"],
    targetFamilies: ["navire"],
  },
  {
    id: "applique",
    label: "Applique",
    inverseLabel: "Est appliqué par",
    weight: "moyenne",
    sourceFamilies: ["procedure"],
    targetFamilies: ["concept"],
  },
];

const nodes: GraphNode[] = [
  {
    id: "demo.appareils.alpha",
    family: "appareil",
    title: "Appareil Alpha (démo)",
    edges: [{ predicate: "embarque-sur", target: "demo.navires.beta" }],
  },
  { id: "demo.navires.beta", family: "navire", title: "Navire Bêta (démo)", edges: [] },
  {
    id: "demo.procedures.gamma",
    family: "procedure",
    title: "Procédure Gamma (démo)",
    edges: [{ predicate: "applique", target: "demo.concepts.delta", weight: "complementaire" }],
  },
  { id: "demo.concepts.delta", family: "concept", title: "Concept Delta (démo)", edges: [] },
];

describe("resolveFactualGraph", () => {
  it("produit le lien sortant et le lien entrant (libellé inverse) d'une arête", () => {
    const { linksByObject, errors } = resolveFactualGraph(nodes, predicates);
    expect(errors).toEqual([]);

    const sortants = linksByObject.get("demo.appareils.alpha");
    expect(sortants?.[0]).toMatchObject({
      targetId: "demo.navires.beta",
      label: "Embarque sur",
      weight: "forte",
      direction: "sortante",
    });

    const entrants = linksByObject.get("demo.navires.beta");
    expect(entrants?.[0]).toMatchObject({
      targetId: "demo.appareils.alpha",
      label: "Embarque",
      direction: "entrante",
    });
  });

  it("laisse une arête surcharger le poids par défaut du prédicat", () => {
    const { linksByObject } = resolveFactualGraph(nodes, predicates);
    expect(linksByObject.get("demo.procedures.gamma")?.[0]?.weight).toBe("complementaire");
  });

  it("signale prédicat inconnu, cible absente et familles interdites", () => {
    const invalid: GraphNode[] = [
      {
        id: "demo.a",
        family: "appareil",
        title: "A",
        edges: [
          { predicate: "inexistant", target: "demo.b" },
          { predicate: "embarque-sur", target: "demo.absent" },
          { predicate: "applique", target: "demo.b" },
        ],
      },
      { id: "demo.b", family: "navire", title: "B", edges: [] },
    ];
    const { errors } = resolveFactualGraph(invalid, predicates);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toContain("prédicat inconnu");
    expect(errors[1]).toContain("cible inexistante");
    expect(errors[2]).toContain("n'est pas admise en source");
  });

  it("trie les liens par poids : forte avant moyenne avant complémentaire", () => {
    const multi: GraphNode[] = [
      {
        id: "demo.p",
        family: "procedure",
        title: "P",
        edges: [{ predicate: "applique", target: "demo.c1" }],
      },
      { id: "demo.c1", family: "concept", title: "C1", edges: [] },
      {
        id: "demo.x",
        family: "appareil",
        title: "X",
        edges: [{ predicate: "embarque-sur", target: "demo.n" }],
      },
      { id: "demo.n", family: "navire", title: "N", edges: [] },
    ];
    const { linksByObject } = resolveFactualGraph(multi, predicates);
    const weights = [...linksByObject.values()].flat().map((l) => l.weight);
    expect(new Set(weights)).toEqual(new Set(["forte", "moyenne"]));
  });
});

describe("référentiel des prédicats", () => {
  it("charge un référentiel valide aux identifiants uniques", () => {
    const loaded = getPredicates();
    expect(loaded.length).toBeGreaterThanOrEqual(6);
    expect(new Set(loaded.map((p) => p.id)).size).toBe(loaded.length);
    for (const predicate of loaded) {
      expect(predicate.inverseLabel.length).toBeGreaterThan(0);
    }
  });
});
