import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  contraste,
  melanger,
  oklchVersSrgb as versSrgb,
  type Oklch,
  type Srgb,
} from "@/lib/design/contraste";

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
function jeton(nom: string, registre: "clair" | "sombre"): Oklch {
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

const SEUIL_AA = 4.5;

/** Composition alpha : la teinte posée à `alpha` sur un fond opaque. */
const sur = (teinte: Srgb, fond: Srgb, alpha: number) => melanger(teinte, fond, alpha);

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
