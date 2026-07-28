import { render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { AxesGouvernes } from "./axes-gouvernes";
import { Centrage } from "./centrage";
import { ForcesEtVecteurs } from "./forces-et-vecteurs";
import { IncidenceDecrochage } from "./incidence-decrochage";
import { Polaire } from "./polaire";
import { SoufflerieZones } from "./soufflerie-zones";
import { Venturi } from "./venturi";

/**
 * Intégrité du texte rendu des sept interactions.
 *
 * Pourquoi ce fichier existe : pendant le lot M4, un script de remplacement
 * qui normalisait aussi les espaces a transformé `{" "}` en `{""}` dans sept
 * fichiers — donc **supprimé des espaces rendus**. « à 20 m/s » devenait
 * « à20 m/s ». Aucune suite ne l'a signalé ; c'est la lecture du diff qui l'a
 * trouvé. Cette classe de régression n'était couverte par rien.
 *
 * Le garde-fou tient en deux temps, volontairement légers :
 *  1. une **sonde de source** : `{""}` n'a aucun sens en JSX — c'est toujours
 *     un espace perdu ou du code mort ;
 *  2. quelques **libellés composés** vérifiés au caractère près, là où du
 *     texte et des expressions se recollent. Pas d'instantané global : un
 *     instantané casserait à chaque virgule et finirait par être régénéré
 *     sans être lu, ce qui ne garde plus rien.
 */

const DOSSIER = path.join(process.cwd(), "src", "features", "interactions");

describe("intégrité de la source", () => {
  it('aucune expression `{""}` ne subsiste dans les interactions', () => {
    const coupables: string[] = [];
    for (const fichier of readdirSync(DOSSIER)) {
      // Ce fichier-ci cite le motif pour l'expliquer : il ne se scanne pas.
      if (!fichier.endsWith(".tsx") || fichier.endsWith(".test.tsx")) continue;
      const source = readFileSync(path.join(DOSSIER, fichier), "utf-8");
      // `{""}` ne rend rien : soit c'est un `{" "}` amputé, soit c'est mort.
      if (/\{""\}/.test(source)) coupables.push(fichier);
    }
    expect(coupables).toEqual([]);
  });
});

/**
 * Chaque cas donne une phrase composée que le rendu doit produire **exactement**,
 * choisie parmi celles qui recollent du texte et une expression.
 */
const LIBELLES: [string, React.ReactElement, string[]][] = [
  [
    "venturi",
    <Venturi key="v" />,
    [
      "Au col, la vitesse passe de 10 m/s à 20 m/s (×2) ; la pression statique chute d’environ 184 Pa.",
      "La pression totale (statique + dynamique) reste conservée — c’est le théorème de Bernoulli.",
    ],
  ],
  ["polaire", <Polaire key="p" />, ["Cz ≈ 0.63 · Cx ≈ 0.040 · finesse ≈ 15.8 — finesse maximale."]],
  [
    "incidence-decrochage",
    <IncidenceDecrochage key="i" />,
    [
      "Coefficient de portance Cz ≈ 0.35. L’écoulement suit le profil : la portance croît avec l’incidence.",
    ],
  ],
  [
    "centrage",
    <Centrage key="c" />,
    [
      "Marge statique 9 points — centrage avant (dans la plage). Le centre de gravité est dans la plage admise.",
    ],
  ],
  [
    "axes-gouvernes",
    <AxesGouvernes key="a" />,
    [
      "Tangage — gouverne : la gouverne de profondeur (empennage horizontal) ; commande : le manche, poussé ou tiré. Effet : le nez monte (cabré) ou descend (piqué).",
    ],
  ],
  [
    "forces-et-vecteurs",
    <ForcesEtVecteurs key="f" />,
    [
      "Résultante — nulle (équilibre). Une force est un vecteur : direction, sens, intensité et point d’application (le centre de gravité, ici).",
    ],
  ],
  [
    "soufflerie-zones",
    <SoufflerieZones key="s" />,
    [
      "Veine d'essai — Section où l'écoulement est le plus uniforme : on y place la maquette et la balance aérodynamique mesure les efforts.",
    ],
  ],
];

describe.each(LIBELLES)("libellés composés — %s", (_nom, element, phrases) => {
  it("rend ses phrases sans mot recollé ni espace perdu", () => {
    const { container } = render(element);
    // `textContent` colle les nœuds voisins comme le ferait un lecteur : si un
    // espace de jonction manque, la phrase attendue ne s'y trouve plus.
    const rendu = (container.textContent ?? "").replace(/\s+/g, " ");
    for (const phrase of phrases) {
      expect(rendu, phrase.slice(0, 40)).toContain(phrase);
    }
  });

  it("garde son alternative textuelle annoncée", () => {
    render(element);
    // L'annonce `aria-live` porte la description de l'état courant : c'est
    // elle que lit une technologie d'assistance, elle ne doit jamais être vide.
    const annonces = screen
      .getAllByText((_texte, element) => element?.getAttribute("aria-live") === "polite")
      .map((n) => n.textContent ?? "");
    expect(annonces.some((t) => t.trim().length > 20)).toBe(true);
  });
});
