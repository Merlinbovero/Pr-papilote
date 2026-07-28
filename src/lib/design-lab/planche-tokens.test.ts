import { describe, expect, it } from "vitest";
import {
  CLAIR,
  ENCRES_MODULE,
  ETATS,
  FONDS,
  type PlancheRegister,
  SEUIL_GRAPHIQUE,
  SEUIL_TEXTE,
  SOMBRE,
  contrastRatio,
  relativeLuminance,
} from "./planche-tokens";

const REGISTRES: [string, PlancheRegister][] = [
  ["clair", CLAIR],
  ["sombre", SOMBRE],
];

describe("contrastRatio", () => {
  it("rend 21:1 entre noir et blanc", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("rend 1:1 pour une couleur avec elle-même", () => {
    expect(contrastRatio("#1D5B8F", "#1D5B8F")).toBeCloseTo(1, 10);
  });

  it("est symétrique", () => {
    expect(contrastRatio(CLAIR.encre, CLAIR.fond)).toBeCloseTo(
      contrastRatio(CLAIR.fond, CLAIR.encre),
      10
    );
  });

  it("refuse une valeur qui n'est pas #RRGGBB", () => {
    expect(() => relativeLuminance("rouge")).toThrow(/hexadécimale/);
    expect(() => relativeLuminance("#FFF")).toThrow(/hexadécimale/);
  });
});

describe("seuils de contraste des jetons PLANCHE", () => {
  // La règle du manifeste : aucun texte sous 4,5:1, sur AUCUN des trois fonds.
  describe.each(REGISTRES)("registre %s", (_nom, r) => {
    it.each(["encre", "encre2", "encre3"] as const)(
      "%s tient 4,5:1 sur les trois fonds",
      (encre) => {
        for (const fond of FONDS) {
          expect(contrastRatio(r[encre], r[fond])).toBeGreaterThanOrEqual(SEUIL_TEXTE);
        }
      }
    );

    it.each(ENCRES_MODULE)("l'encre de module %s tient 4,5:1 sur les trois fonds", (encre) => {
      for (const fond of FONDS) {
        expect(contrastRatio(r[encre], r[fond])).toBeGreaterThanOrEqual(SEUIL_TEXTE);
      }
    });

    it.each(ETATS)("l'état %s tient 4,5:1 sur les trois fonds", (etat) => {
      for (const fond of FONDS) {
        expect(contrastRatio(r[etat], r[fond])).toBeGreaterThanOrEqual(SEUIL_TEXTE);
      }
    });

    // Le filet appuyé porte de l'information (séparation de premier rang,
    // cadre de figure, anneau de focus) : 3:1 exigé. Le filet simple est
    // décoratif et n'est pas soumis au seuil.
    it("le filet appuyé tient 3:1 sur les trois fonds", () => {
      for (const fond of FONDS) {
        expect(contrastRatio(r.filetFort, r[fond])).toBeGreaterThanOrEqual(SEUIL_GRAPHIQUE);
      }
    });

    it("les trois fonds restent distincts sans jamais se confondre", () => {
      expect(contrastRatio(r.fond, r.fond2)).toBeGreaterThan(1);
      expect(contrastRatio(r.fond2, r.fond3)).toBeGreaterThan(1);
      // ... mais assez proches pour ne pas se lire comme des blocs colorés.
      expect(contrastRatio(r.fond, r.fond3)).toBeLessThan(1.6);
    });
  });
});

describe("le registre clair reste un blanc cassé, pas un beige", () => {
  it("s'écarte du blanc pur de moins de 8 unités sRGB sur chaque canal", () => {
    const canaux = [1, 3, 5].map((i) => 255 - Number.parseInt(CLAIR.fond.slice(i, i + 2), 16));
    for (const ecart of canaux) {
      expect(ecart).toBeGreaterThan(0); // jamais #FFFFFF
      expect(ecart).toBeLessThanOrEqual(8); // jamais un sépia
    }
  });

  it("garde une chaleur perceptible : le bleu est plus retiré que le rouge", () => {
    const [r, , b] = [1, 3, 5].map((i) => Number.parseInt(CLAIR.fond.slice(i, i + 2), 16));
    expect(b).toBeLessThan(r);
  });
});

describe("le registre sombre est un charbon bleuté, pas un gris inversé", () => {
  it("le fond garde une composante bleue supérieure à la rouge", () => {
    const [r, , b] = [1, 3, 5].map((i) => Number.parseInt(SOMBRE.fond.slice(i, i + 2), 16));
    expect(b).toBeGreaterThan(r);
  });

  it("n'est pas l'inversion du registre clair", () => {
    // Une inversion naïve donnerait des luminances complémentaires.
    const somme = relativeLuminance(CLAIR.fond) + relativeLuminance(SOMBRE.fond);
    expect(somme).not.toBeCloseTo(1, 2);
  });
});
