import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Le triangle des vitesses est-il une somme vectorielle exacte ? — pilote P-6.
 *
 * ── Pourquoi ce test existe séparément ──────────────────────────────────
 * La garde structurelle vérifie des propriétés de forme : un `viewBox`, des
 * identifiants préfixés, des couleurs jetonnées. Elle ne peut rien dire de la
 * **géométrie**. Or c'est là, et seulement là, que ce croquis peut être faux :
 * un triangle des vitesses dessiné « à peu près proportionnel » est une erreur
 * de fond déguisée en approximation graphique.
 *
 * `scientificNatures: ["analytical"]` est une déclaration engageante. Si les
 * longueurs ne respectent pas l'échelle annoncée, cette déclaration devient un
 * mensonge de métadonnée — exactement ce que le contrat C1 existe pour rendre
 * impossible. Ce fichier est ce qui la rend vérifiable.
 *
 * ── Ce qu'il vérifie sur le dessin, pas sur une intention ───────────────
 * Les coordonnées sont **lues dans le SVG**. Retoucher le tracé sans refaire le
 * calcul fait tomber ce test.
 */

const SVG = readFileSync(
  path.join(process.cwd(), "content", "schemas", "triangle-des-vitesses.svg"),
  "utf-8"
);

/** Échelle annoncée sur le croquis et dans ses métadonnées. */
const UNITES_PAR_NOEUD = 1.8;

/** L'exemple construit, tel qu'il est écrit sur le dessin. */
const EXEMPLE = {
  vitessePropre: 120,
  cap: 90,
  vent: 30,
  ventDe: 360,
  vitesseSolAffichee: 124,
  routeAffichee: 104,
  deriveAffichee: 14,
};

/** Les segments du croquis, lus par leur classe. */
function segment(classe: string): { x1: number; y1: number; x2: number; y2: number } {
  const balise = new RegExp(`<line class="${classe}"[^>]*>`).exec(SVG)?.[0];
  if (!balise) throw new Error(`aucun <line class="${classe}"> dans le croquis`);
  const lire = (nom: string) => Number(new RegExp(`\\s${nom}="([-\\d.]+)"`).exec(balise)?.[1]);
  return { x1: lire("x1"), y1: lire("y1"), x2: lire("x2"), y2: lire("y2") };
}

/**
 * Composantes est/nord d'un segment, en nœuds.
 * L'axe `y` du SVG descend ; le nord est donc `-dy`.
 */
function composantes(classe: string): { est: number; nord: number } {
  const s = segment(classe);
  return { est: (s.x2 - s.x1) / UNITES_PAR_NOEUD, nord: -(s.y2 - s.y1) / UNITES_PAR_NOEUD };
}

/** Relèvement vrai (degrés, du Nord, sens horaire) d'un vecteur est/nord. */
const releve = ({ est, nord }: { est: number; nord: number }) =>
  ((Math.atan2(est, nord) * 180) / Math.PI + 360) % 360;

const norme = ({ est, nord }: { est: number; nord: number }) => Math.hypot(est, nord);

describe("triangle des vitesses — la construction est exacte", () => {
  it("les trois vecteurs partagent bien la même échelle", () => {
    // Sans échelle commune, le triangle se referme quand même à l'écran mais ne
    // signifie plus rien : c'est le défaut le plus facile à ne pas voir.
    expect(norme(composantes("air"))).toBeCloseTo(EXEMPLE.vitessePropre, 6);
    expect(norme(composantes("vent"))).toBeCloseTo(EXEMPLE.vent, 6);
  });

  it("vitesse sol = vitesse propre + vent, composante par composante", () => {
    const air = composantes("air");
    const vent = composantes("vent");
    const sol = composantes("sol");

    expect(sol.est).toBeCloseTo(air.est + vent.est, 6);
    expect(sol.nord).toBeCloseTo(air.nord + vent.nord, 6);
  });

  it("le vecteur vent est tracé vers où l'air VA, pas d'où il vient", () => {
    // La faute que la doctrine §8 bis interdit. Un vent « du 360° » doit
    // pointer vers le 180° ; l'inverse referme quand même un triangle, mais un
    // triangle faux.
    expect(releve(composantes("vent"))).toBeCloseTo((EXEMPLE.ventDe + 180) % 360, 6);
  });

  it("le vecteur air suit le cap déclaré", () => {
    expect(releve(composantes("air"))).toBeCloseTo(EXEMPLE.cap, 6);
  });

  it("les valeurs affichées sont celles que la géométrie produit", () => {
    // Elles sont arrondies à l'unité sur le dessin : le test vérifie que
    // l'arrondi est correct, pas que le nombre a été recopié.
    const sol = composantes("sol");
    expect(Math.round(norme(sol))).toBe(EXEMPLE.vitesseSolAffichee);
    expect(Math.round(releve(sol))).toBe(EXEMPLE.routeAffichee);
  });

  it("la dérive affichée est bien l'écart entre la route et le cap", () => {
    // Définition FR-02 (manuel BIA, p. 198) : Route = Cap + Dérive.
    const derive = releve(composantes("sol")) - releve(composantes("air"));
    expect(Math.round(derive)).toBe(EXEMPLE.deriveAffichee);
  });

  it("le signe de la dérive respecte la convention française", () => {
    // FR-02 : vent venant de la gauche → dérive positive. Ici le vent vient du
    // 360° et l'avion est au cap 090° : il vient donc de la gauche, et la
    // dérive doit être positive.
    const derive = releve(composantes("sol")) - releve(composantes("air"));
    expect(derive).toBeGreaterThan(0);
  });

  it("le croquis annonce lui-même qu'il s'agit de valeurs construites", () => {
    // §7.4 : un exemple non mesuré doit le dire. Sans cette mention, un lecteur
    // pourrait croire à un relevé.
    expect(SVG).toContain("valeurs construites");
    expect(SVG).toContain("même échelle");
  });
});
