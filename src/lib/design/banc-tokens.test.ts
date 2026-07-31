import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  BANC_CLAIR,
  BANC_SOMBRE,
  SEPARATION_CLAIR,
  SEPARATION_SOMBRE,
  SEUIL_TEXTE,
  chronoEnMots,
  contraste,
  dansGamutSrgb,
  deltaE2000,
  formatChrono,
  versOklch,
} from "./banc-tokens";

/**
 * Les arbitrages du lot F1b, refaits à chaque exécution.
 *
 * Rien ici n'est constaté à l'œil : l'encre du Banc a été choisie par la
 * mesure, et ces tests interdisent qu'elle dérive sans qu'on s'en aperçoive.
 */

/** Les sept encres PLANCHE, recopiées telles qu'elles sont gelées. */
const ENCRES_PLANCHE_CLAIR = {
  marine: "#1D5B8F",
  air: "#156383",
  terre: "#376441",
  bistre: "#79511E",
  violine: "#624581",
  sienne: "#8A3D2B",
  indigo: "#4F5882",
};
const ENCRES_PLANCHE_SOMBRE = {
  marine: "#7DB0E1",
  air: "#74B8DB",
  terre: "#8CB894",
  bistre: "#D2A979",
  violine: "#B599D6",
  sienne: "#E09582",
  indigo: "#A4AFDB",
};

describe("encre du Banc — famille F", () => {
  it("obéit à la loi isoluminante de la charte", () => {
    // La famille ne se distingue que par la teinte : clarté et chroma
    // restent dans les fourchettes mesurées sur les sept encres.
    const clair = versOklch(BANC_CLAIR.banc);
    expect(clair.L).toBeGreaterThanOrEqual(0.449);
    expect(clair.L).toBeLessThanOrEqual(0.471);
    expect(clair.C).toBeGreaterThanOrEqual(0.069);
    expect(clair.C).toBeLessThanOrEqual(0.11);

    const sombre = versOklch(BANC_SOMBRE.banc);
    expect(sombre.L).toBeGreaterThanOrEqual(0.73);
    expect(sombre.L).toBeLessThanOrEqual(0.761);
    expect(sombre.C).toBeGreaterThanOrEqual(0.064);
    expect(sombre.C).toBeLessThanOrEqual(0.095);
  });

  it("occupe le créneau de teinte laissé libre", () => {
    // Teintes déjà prises : 34, 69, 150, 231, 248, 274, 305 — plus le bleu
    // de navigation à 258. Le turquoise siège à 193, entre le vert de
    // validation et les bleus de module, sans prendre la place d'aucun.
    for (const registre of [BANC_CLAIR.banc, BANC_SOMBRE.banc]) {
      expect(versOklch(registre).h).toBeGreaterThan(180);
      expect(versOklch(registre).h).toBeLessThan(210);
    }
  });

  it("tient dans le gamut sRGB, dans les deux registres", () => {
    // C'est ce contrôle qui a écarté la première version de l'encre
    // (`#006766`, chroma 0,090) : hors gamut en clair, donc écrêtée par le
    // navigateur — la couleur mesurée n'aurait jamais été celle affichée.
    for (const hex of [BANC_CLAIR.banc, BANC_SOMBRE.banc]) {
      const { L, C, h } = versOklch(hex);
      expect(dansGamutSrgb(L, C, h), `${hex} hors gamut`).toBe(true);
    }
  });

  it.each(Object.keys(ENCRES_PLANCHE_CLAIR))(
    "se distingue de l'encre %s dans les deux registres",
    (nom) => {
      const clef = nom as keyof typeof ENCRES_PLANCHE_CLAIR;
      expect(deltaE2000(BANC_CLAIR.banc, ENCRES_PLANCHE_CLAIR[clef])).toBeGreaterThanOrEqual(
        SEPARATION_CLAIR
      );
      expect(deltaE2000(BANC_SOMBRE.banc, ENCRES_PLANCHE_SOMBRE[clef])).toBeGreaterThanOrEqual(
        SEPARATION_SOMBRE
      );
    }
  );

  it.each(["juste", "attention", "erreur"] as const)("ne se confond pas avec l'état %s", (etat) => {
    // En séance, l'encre cohabite avec le vert « juste » et le rouge
    // « erreur » : la séparation compte autant qu'avec les encres.
    expect(deltaE2000(BANC_CLAIR.banc, BANC_CLAIR[etat])).toBeGreaterThanOrEqual(SEPARATION_CLAIR);
    expect(deltaE2000(BANC_SOMBRE.banc, BANC_SOMBRE[etat])).toBeGreaterThanOrEqual(
      SEPARATION_SOMBRE
    );
  });

  it("reste lisible sur les trois fonds, dans les deux registres", () => {
    for (const [registre, fonds] of [
      [BANC_CLAIR, ["fond", "fond2", "fond3"]],
      [BANC_SOMBRE, ["fond", "fond2", "fond3"]],
    ] as const) {
      for (const fond of fonds) {
        expect(
          contraste(registre.banc, registre[fond]),
          `encre du Banc sur ${fond}`
        ).toBeGreaterThanOrEqual(SEUIL_TEXTE);
      }
    }
  });
});

describe("états et encres du Banc", () => {
  it.each(["juste", "attention", "erreur"] as const)(
    "l'état %s reste lisible sur les fonds du cadre",
    (etat) => {
      for (const registre of [BANC_CLAIR, BANC_SOMBRE]) {
        for (const fond of ["fond", "fond2", "fond3"] as const) {
          expect(contraste(registre[etat], registre[fond])).toBeGreaterThanOrEqual(SEUIL_TEXTE);
        }
      }
    }
  );

  it("garde les trois états distincts les uns des autres", () => {
    for (const registre of [BANC_CLAIR, BANC_SOMBRE]) {
      const paires: [string, string][] = [
        [registre.juste, registre.attention],
        [registre.juste, registre.erreur],
        [registre.attention, registre.erreur],
      ];
      for (const [a, b] of paires) {
        expect(deltaE2000(a, b)).toBeGreaterThanOrEqual(SEPARATION_SOMBRE);
      }
    }
  });

  it("conserve les jetons d'état corrigés au lot F1a", () => {
    // Le Banc n'invente pas ses états : il reprend ceux du produit, dont la
    // clarté a été abaissée par le calcul en F1a. S'ils divergent, l'un des
    // deux a bougé sans l'autre.
    expect(BANC_CLAIR.juste).toBe("#117C40");
    expect(BANC_CLAIR.erreur).toBe("#BE2323");
  });
});

describe("portée des jetons", () => {
  const CSS = readFileSync(path.join(process.cwd(), "src", "styles", "banc.css"), "utf-8");

  it("n'émet aucun jeton sur :root", () => {
    // La garantie du lot : tant qu'aucun élément ne porte `.banc`, le
    // produit est strictement inchangé.
    expect(CSS).not.toMatch(/^\s*:root\s*\{/m);
    expect(CSS).not.toMatch(/^\s*html\s*\{/m);
    expect(CSS).not.toMatch(/^\s*body\s*\{/m);
  });

  it("déclare chaque variable sous .banc", () => {
    const declarations = [...CSS.matchAll(/(--bc-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
    expect(declarations.length).toBeGreaterThan(10);
    // Toutes les variables du Banc portent le préfixe `--bc-` : aucune ne
    // peut se confondre avec un jeton de production ou de PLANCHE.
    for (const nom of declarations) {
      expect(nom.startsWith("--bc-")).toBe(true);
    }
  });

  it("sert exactement les valeurs mesurées dans le module", () => {
    // Le CSS et le module TypeScript sont deux sources : si elles divergent,
    // les tests de mesure ne valident plus ce que le navigateur affiche.
    const clair = CSS.slice(0, CSS.indexOf(".dark .banc"));
    expect(clair).toContain(BANC_CLAIR.banc.toLowerCase());
    expect(clair).toContain(BANC_CLAIR.juste.toLowerCase());
    const sombre = CSS.slice(CSS.indexOf(".dark .banc"));
    expect(sombre).toContain(BANC_SOMBRE.banc.toLowerCase());
    expect(sombre).toContain(BANC_SOMBRE.juste.toLowerCase());
  });
});

describe("format du chronomètre", () => {
  it("écrit M:SS sous une heure", () => {
    expect(formatChrono(0)).toBe("0:00");
    expect(formatChrono(5)).toBe("0:05");
    expect(formatChrono(65)).toBe("1:05");
    expect(formatChrono(3599)).toBe("59:59");
  });

  it("écrit H:MM:SS à partir d'une heure", () => {
    expect(formatChrono(3600)).toBe("1:00:00");
    expect(formatChrono(4328)).toBe("1:12:08");
  });

  it("ne descend jamais sous zéro", () => {
    expect(formatChrono(-10)).toBe("0:00");
  });

  it("dit la durée en langue naturelle pour l'oreille", () => {
    // « 2:05 » se lit « deux-cent-cinq » ou « deux cinq » selon le lecteur
    // d'écran : l'affichage compact est fait pour l'œil.
    expect(chronoEnMots(425)).toBe("7 minutes et 5 secondes restantes");
    expect(chronoEnMots(4328)).toBe("1 heure, 12 minutes et 8 secondes restantes");
    expect(chronoEnMots(1)).toBe("1 seconde restante");
    expect(chronoEnMots(60)).toBe("1 minute restantes");
    expect(chronoEnMots(0)).toBe("Temps écoulé");
  });
});
