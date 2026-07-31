import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  deltaE2000,
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

/**
 * Le module TypeScript et la feuille CSS sont deux sources pour les mêmes
 * valeurs. Ce test les confronte : sans lui, une correction faite d'un côté
 * dériverait silencieusement de l'autre, et les tests de contraste
 * vérifieraient une palette que le site n'emploie pas.
 */
describe("la feuille de jetons et le module ne divergent pas", () => {
  const css = readFileSync(join(process.cwd(), "src/styles/planche-tokens.css"), "utf-8");

  function bloc(selecteur: string): Record<string, string> {
    const debut = css.indexOf(selecteur);
    expect(debut, `bloc « ${selecteur} » introuvable`).toBeGreaterThan(-1);
    const ouvrante = css.indexOf("{", debut);
    const fermante = css.indexOf("}", ouvrante);
    const corps = css.slice(ouvrante + 1, fermante);
    const jetons: Record<string, string> = {};
    for (const ligne of corps.split(";")) {
      const m = /--planche-([a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})/i.exec(ligne);
      if (m) jetons[m[1]] = m[2].toUpperCase();
    }
    return jetons;
  }

  const CORRESPONDANCE: [keyof PlancheRegister, string][] = [
    ["fond", "fond"],
    ["fond2", "fond-2"],
    ["fond3", "fond-3"],
    ["encre", "encre"],
    ["encre2", "encre-2"],
    ["encre3", "encre-3"],
    ["filet", "filet"],
    ["filetFort", "filet-fort"],
    ["marine", "marine"],
    ["air", "air"],
    ["terre", "terre"],
    ["bistre", "bistre"],
    ["violine", "violine"],
    ["sienne", "sienne"],
    ["indigo", "indigo"],
    ["juste", "juste"],
    ["attention", "attention"],
    ["erreur", "erreur"],
  ];

  it.each([
    ["clair", CLAIR, ".planche {"],
    ["sombre", SOMBRE, ".dark .planche,"],
  ] as const)(
    "registre %s : chaque jeton CSS vaut celui du module",
    (_nom, registre, selecteur) => {
      const jetons = bloc(selecteur);
      for (const [cle, nomCss] of CORRESPONDANCE) {
        expect(jetons[nomCss], `--planche-${nomCss}`).toBe(registre[cle].toUpperCase());
      }
    }
  );

  it("les jetons ne sont jamais posés sur :root", () => {
    // Toute la garantie du lot M1 tient dans cette ligne : tant que les
    // jetons vivent sous `.planche`, aucun écran public ne change.
    expect(css).not.toMatch(/:root\s*\{[^}]*--planche-/);
  });
});

/**
 * Lot M4 — les figures des interactions.
 *
 * Les tracés vivent sur `fond2`, le fond du cadre `.pl-fig`, et non sur le
 * fond de page. Une couleur validée sur le papier ne l'est pas d'office sur
 * le creux : c'est exactement l'erreur qu'avait révélée la palette en M1.
 */
describe("contrastes des figures d'interaction (lot M4)", () => {
  const TRACES = [
    // [jeton, seuil, ce que la couleur porte dans les figures]
    ["encre", SEUIL_TEXTE, "libellés de figure et traits pleins"],
    ["encre2", SEUIL_TEXTE, "libellés secondaires et barres de mesure"],
    ["filetFort", SEUIL_GRAPHIQUE, "axes, repères et traits d'appel"],
    ["juste", SEUIL_GRAPHIQUE, "plage de centrage admissible"],
    ["erreur", SEUIL_GRAPHIQUE, "dépassement de limite"],
  ] as const;

  it.each([
    ["clair", CLAIR],
    ["sombre", SOMBRE],
  ] as const)("registre %s : chaque tracé tient son seuil sur le fond de figure", (_nom, r) => {
    for (const [jeton, seuil, role] of TRACES) {
      const ratio = contrastRatio(r[jeton], r.fond2);
      expect(ratio, `${jeton} (${role})`).toBeGreaterThanOrEqual(seuil);
    }
  });

  it.each([
    ["clair", CLAIR],
    ["sombre", SOMBRE],
  ] as const)(
    "registre %s : les six encres de module tiennent 3:1 sur le fond de figure",
    (_nom, r) => {
      for (const encre of ENCRES_MODULE) {
        expect(contrastRatio(r[encre], r.fond2), encre).toBeGreaterThanOrEqual(SEUIL_GRAPHIQUE);
      }
    }
  );
});

/**
 * Lot M6b — la feuille du SYSTÈME et le module de jetons.
 *
 * `planche-tokens.css` (lot M1) déclarait bien les six encres de module ;
 * `planche.css`, la feuille que les routes publiques chargent réellement, n'en
 * déclarait que trois. `air` et `terre` existaient, étaient testées pour leur
 * contraste, et n'atteignaient aucune page — une divergence entre deux fichiers
 * que rien ne confrontait. Les notices EOPN et ALAT l'ont révélée au lot M6b.
 *
 * Ce test ferme la brèche : toute encre sélectionnable par `data-module` doit
 * être déclarée dans les trois blocs de la feuille, à la valeur du module.
 */
describe("la feuille du système déclare les encres qu'elle sait sélectionner", () => {
  const systeme = readFileSync(join(process.cwd(), "src/styles/planche.css"), "utf-8");

  /** Les encres que `PlancheRoot` peut demander via `data-module`. */
  const selectionnables = [...systeme.matchAll(/\.pl-root\[data-module="([a-z]+)"\]/g)].map(
    (m) => m[1]
  );

  it("connaît au moins les trois armées", () => {
    for (const encre of ["marine", "air", "terre"]) {
      expect(selectionnables, `data-module="${encre}"`).toContain(encre);
    }
  });

  it.each([
    ["clair", CLAIR, ".pl-root,"],
    ["sombre", SOMBRE, ".dark .pl-root,"],
  ] as const)("registre %s : chaque encre sélectionnable vaut celle du module", (_n, r, debut) => {
    const ouvrante = systeme.indexOf("{", systeme.indexOf(debut));
    const bloc = systeme.slice(ouvrante, systeme.indexOf("}", ouvrante));
    for (const encre of selectionnables) {
      const m = new RegExp(`--pl-${encre}\\s*:\\s*(#[0-9a-f]{6})`, "i").exec(bloc);
      expect(m, `--pl-${encre} absent du bloc ${_n}`).not.toBeNull();
      expect(m?.[1].toUpperCase(), `--pl-${encre}`).toBe(r[encre as keyof typeof r].toUpperCase());
    }
  });
});

describe("l'encre du Dossier — séparation perceptuelle (lot M9a)", () => {
  /**
   * Le seuil n'est pas choisi : c'est celui que la charte s'accorde DÉJÀ.
   * La paire la plus serrée des six encres antérieures est marine/air, à
   * ΔE00 7,4 en clair et 6,2 en sombre. Une septième encre qui ferait moins
   * bien introduirait une confusion que le système n'a jamais tolérée.
   */
  const PLANCHER = { clair: 7.4, sombre: 6.2 } as const;

  /** Le bleu fonctionnel de navigation, `--primary` de `globals.css`. */
  const NAVIGATION = "#1A57AD";

  /** Les gris : une encre qui s'en approche cesse de se lire comme une couleur. */
  const NEUTRES = ["encre", "encre2", "encre3", "filetFort"] as const;

  it.each(REGISTRES)(
    "registre %s : la paire la plus serrée reste marine/air, pas une paire d'indigo",
    (nom, r) => {
      const autres = ENCRES_MODULE.filter((e) => e !== "indigo");
      for (const encre of autres) {
        expect(
          deltaE2000(r.indigo, r[encre]),
          `indigo/${encre} doit rester au-dessus du plancher de la charte`
        ).toBeGreaterThanOrEqual(PLANCHER[nom as keyof typeof PLANCHER]);
      }
    }
  );

  it.each(REGISTRES)("registre %s : indigo ne se confond pas avec les gris", (_nom, r) => {
    for (const neutre of NEUTRES) {
      expect(deltaE2000(r.indigo, r[neutre]), `indigo/${neutre}`).toBeGreaterThan(10);
    }
  });

  it("indigo se distingue du bleu fonctionnel de navigation", () => {
    // Bleu = navigation dans le framework UI. L'encre d'une famille
    // documentaire ne doit pas être prise pour un lien.
    expect(deltaE2000(CLAIR.indigo, NAVIGATION)).toBeGreaterThan(PLANCHER.clair);
    expect(deltaE2000(SOMBRE.indigo, NAVIGATION)).toBeGreaterThan(PLANCHER.sombre);
  });

  it("les deux variantes écartées le sont bien par la mesure, pas par goût", () => {
    // h 264 (côté marine) et h 288 (côté violine) : toutes deux tombent SOUS le
    // plancher en registre clair. Si un jour l'une d'elles était retenue, c'est
    // que le plancher aurait été abaissé — décision qui doit être explicite.
    expect(deltaE2000("#435883", CLAIR.marine)).toBeLessThan(PLANCHER.clair);
    expect(deltaE2000("#57527F", CLAIR.violine)).toBeLessThan(PLANCHER.clair);
  });

  it("deltaE2000 rend 0 pour une couleur avec elle-même, et est symétrique", () => {
    expect(deltaE2000(CLAIR.indigo, CLAIR.indigo)).toBeCloseTo(0, 10);
    expect(deltaE2000(CLAIR.indigo, CLAIR.marine)).toBeCloseTo(
      deltaE2000(CLAIR.marine, CLAIR.indigo),
      10
    );
  });
});
