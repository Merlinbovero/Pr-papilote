import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Contraste des jetons d'état — lot F1a.
 *
 * Les valeurs ne sont pas recopiées ici : elles sont **lues dans
 * `globals.css`**, de sorte qu'une retouche de la charte fasse tomber ce test
 * plutôt que de passer inaperçue jusqu'au prochain audit.
 *
 * Ce qui est vérifié, c'est le motif réellement rendu : un texte en teinte
 * pleine sur un fond composé de cette même teinte à 10 % — celui des badges de
 * correction, qui portait 58 nœuds non conformes à l'audit F0b.
 */

const CSS = readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf-8");

/** Lit un jeton `--nom: oklch(L C H)` dans le bloc demandé. */
function jeton(nom: string, registre: "clair" | "sombre"): [number, number, number] {
  // Le bloc clair est `:root`, le bloc sombre `.dark` : on coupe le fichier au
  // début de `.dark` pour ne jamais confondre les deux déclarations.
  const debutSombre = CSS.indexOf(".dark {");
  const zone = registre === "clair" ? CSS.slice(0, debutSombre) : CSS.slice(debutSombre);
  const trouve = new RegExp(`--${nom}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`).exec(
    zone
  );
  if (!trouve) {
    throw new Error(`Jeton --${nom} introuvable dans le registre ${registre}`);
  }
  return [Number(trouve[1]), Number(trouve[2]), Number(trouve[3])];
}

/** OKLCH → sRGB (composantes 0–1). */
function versSrgb([L, C, h]: [number, number, number]): [number, number, number] {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  }) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contraste(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composition alpha : la teinte posée à `alpha` sur un fond opaque. */
function sur(
  teinte: [number, number, number],
  fond: [number, number, number],
  alpha: number
): [number, number, number] {
  return teinte.map((c, i) => c * alpha + fond[i] * (1 - alpha)) as [number, number, number];
}

const SEUIL_AA = 4.5;

describe.each([
  { registre: "clair" as const, carte: "card", texteSurPlein: "success-foreground" },
  { registre: "sombre" as const, carte: "card", texteSurPlein: "success-foreground" },
])("jetons d'état — registre $registre", ({ registre, carte, texteSurPlein }) => {
  const fondCarte = versSrgb(jeton(carte, registre));
  const surPlein = versSrgb(jeton(texteSurPlein, registre));

  it.each(["destructive", "success"])("%s : lisible sur son propre fond à 10 %%", (nom) => {
    const teinte = versSrgb(jeton(nom, registre));
    // Le motif des badges de correction : c'est lui qui échouait.
    expect(contraste(teinte, sur(teinte, fondCarte, 0.1))).toBeGreaterThanOrEqual(SEUIL_AA);
  });

  it.each(["destructive", "success"])("%s : lisible en texte sur la carte", (nom) => {
    expect(contraste(versSrgb(jeton(nom, registre)), fondCarte)).toBeGreaterThanOrEqual(SEUIL_AA);
  });

  it.each(["destructive", "success"])("%s : bouton plein lisible", (nom) => {
    // Le texte posé sur la teinte pleine. En clair comme en sombre, c'est le
    // jeton `*-foreground` qui s'y pose.
    expect(contraste(surPlein, versSrgb(jeton(nom, registre)))).toBeGreaterThanOrEqual(SEUIL_AA);
  });
});

describe("registre sombre — témoin non modifié par F1a", () => {
  it("conserve les clartés d'origine", () => {
    // F1a ne touche QUE le registre clair. Si ces valeurs bougent, c'est que
    // la correction a débordé de son périmètre.
    expect(jeton("destructive", "sombre")[0]).toBe(0.704);
    expect(jeton("success", "sombre")[0]).toBe(0.7);
  });
});
