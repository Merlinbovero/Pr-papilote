import { beforeEach, describe, expect, it, vi } from "vitest";

import { deplacerFocus, focusDeplacable } from "./focus-transition";

/**
 * Contrat de focus — lot F1a.
 *
 * Le point délicat n'est pas de donner le focus : c'est de savoir **quand ne
 * pas le prendre**. Ces tests décrivent la frontière.
 */

function bouton(id: string): HTMLButtonElement {
  const b = document.createElement("button");
  b.id = id;
  document.body.append(b);
  return b;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("focusDeplacable", () => {
  it("autorise quand le focus est retombé sur body", () => {
    expect(focusDeplacable({ declencheur: null, actuel: document.body })).toBe(true);
  });

  it("autorise quand plus rien n'a le focus", () => {
    expect(focusDeplacable({ declencheur: null, actuel: null })).toBe(true);
  });

  it("autorise quand le focus porte sur un nœud détaché du document", () => {
    // Cas réel : le bouton déclencheur vient d'être démonté par le re-rendu.
    const detache = document.createElement("button");
    expect(focusDeplacable({ declencheur: null, actuel: detache })).toBe(true);
  });

  it("autorise quand le focus est resté sur le déclencheur", () => {
    const b = bouton("valider");
    expect(focusDeplacable({ declencheur: b, actuel: b })).toBe(true);
  });

  it("REFUSE quand l'utilisateur a placé le focus ailleurs", () => {
    // C'est la garde principale : reprendre le focus ici serait pire que de
    // ne rien faire. Elle n'a de sens que parce que `declencheur` désigne le
    // bouton actionné et non le dernier élément focalisé — sinon les deux
    // valeurs coïncideraient toujours et rien ne serait jamais écarté.
    const declencheur = bouton("valider");
    const ailleurs = bouton("lien-de-navigation");
    expect(focusDeplacable({ declencheur, actuel: ailleurs })).toBe(false);
  });
});

describe("deplacerFocus", () => {
  it("donne le focus à la cible quand la voie est libre", () => {
    const cible = document.createElement("div");
    cible.tabIndex = -1;
    document.body.append(cible);

    expect(deplacerFocus(cible, { declencheur: null })).toBe(true);
    expect(document.activeElement).toBe(cible);
  });

  it("ne vole pas le focus posé ailleurs", () => {
    const declencheur = bouton("valider");
    const ailleurs = bouton("ailleurs");
    ailleurs.focus();
    const cible = document.createElement("div");
    cible.tabIndex = -1;
    document.body.append(cible);

    expect(deplacerFocus(cible, { declencheur })).toBe(false);
    expect(document.activeElement).toBe(ailleurs);
  });

  it("ne fait rien sans cible", () => {
    expect(deplacerFocus(null)).toBe(false);
  });

  it("amène la cible dans le cadre sans animation quand elle est réduite", () => {
    const scrollIntoView = vi.fn();
    const cible = document.createElement("div");
    cible.tabIndex = -1;
    cible.scrollIntoView = scrollIntoView;
    document.body.append(cible);

    vi.stubGlobal("matchMedia", (requete: string) => ({
      matches: requete.includes("reduce"),
      media: requete,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    deplacerFocus(cible, { declencheur: null });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "nearest" });
    vi.unstubAllGlobals();
  });

  it("défile en douceur lorsque les animations sont permises", () => {
    const scrollIntoView = vi.fn();
    const cible = document.createElement("div");
    cible.tabIndex = -1;
    cible.scrollIntoView = scrollIntoView;
    document.body.append(cible);

    vi.stubGlobal("matchMedia", (requete: string) => ({
      matches: false,
      media: requete,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    deplacerFocus(cible, { declencheur: null });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });
    vi.unstubAllGlobals();
  });
});
