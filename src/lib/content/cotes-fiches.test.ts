import { describe, expect, it } from "vitest";

import { getFichesParArchetype } from "./archetypes";
import { getFiches, getFichesByCategory } from "./fiches";
import { getCategories, getCotesFiches, getCoteFiche } from "./referentials";

/**
 * Les cotes documentaires des notices techniques — lot M6b.
 *
 * Une cote de notice n'est pas un rang : c'est un **numéro d'enregistrement**.
 * Il est attribué une fois, à l'entrée de la notice au corpus, et ne bouge
 * plus — ni quand le titre change, ni quand le slug change, ni quand l'ordre
 * d'affichage change, ni quand une voisine disparaît.
 *
 * Cette table est le gel. Elle n'est pas une copie décorative du référentiel :
 * elle est la seule chose qui empêche un script de tout renuméroter proprement
 * et silencieusement. On ne l'ouvre que pour ajouter une ligne.
 *
 * 2026-07-29 (M6b) — 66 notices des trois concours.
 * 2026-07-29 (M7a) — 17 notices d'appareils étrangers, « CULT · C.1.NN »,
 * reclassées depuis Le Cahier. **Aucune des 66 premières n'a bougé** : c'est
 * exactement ce que le gel doit démontrer, une arrivée ne renumérote rien.
 */
const COTES_GELEES: Record<string, string> = {
  "alat.appareils.alouette-ii": "ALAT · C.6.01",
  "alat.appareils.alouette-iii": "ALAT · C.6.02",
  "alat.appareils.caracal": "ALAT · C.6.03",
  "alat.appareils.cougar": "ALAT · C.6.04",
  "alat.appareils.gazelle": "ALAT · C.6.05",
  "alat.appareils.guepard": "ALAT · C.6.06",
  "alat.appareils.nh90-caiman-tth": "ALAT · C.6.07",
  "alat.appareils.puma": "ALAT · C.6.08",
  "alat.appareils.tigre": "ALAT · C.6.09",
  "alat.grades.grades-de-l-armee-de-terre": "ALAT · C.13.01",
  "alat.organisation.aviation-legere-armee-de-terre": "ALAT · C.4.01",
  "alat.organisation.ecole-de-l-aviation-legere-de-l-armee-de-terre": "ALAT · C.4.02",
  "alat.organisation.la-4e-brigade-d-aerocombat": "ALAT · C.4.03",
  "alat.unites.1er-rhc": "ALAT · C.10.01",
  "alat.unites.3e-rhc": "ALAT · C.10.02",
  "alat.unites.4e-rhfs": "ALAT · C.10.03",
  "alat.unites.5e-rhc": "ALAT · C.10.04",
  "culture.aviation-mondiale.a-10-thunderbolt-ii": "CULT · C.1.01",
  "culture.aviation-mondiale.f-14-tomcat": "CULT · C.1.02",
  "culture.aviation-mondiale.f-16-fighting-falcon": "CULT · C.1.03",
  "culture.aviation-mondiale.focke-wulf-fw-190": "CULT · C.1.04",
  "culture.aviation-mondiale.hawker-hurricane": "CULT · C.1.05",
  "culture.aviation-mondiale.messerschmitt-bf-109": "CULT · C.1.06",
  "culture.aviation-mondiale.mikoyan-mig-29": "CULT · C.1.07",
  "culture.aviation-mondiale.mikoyan-mig-31": "CULT · C.1.08",
  "culture.aviation-mondiale.mitsubishi-a6m-zero": "CULT · C.1.09",
  "culture.aviation-mondiale.north-american-p-51-mustang": "CULT · C.1.10",
  "culture.aviation-mondiale.pilatus-pc-6-porter": "CULT · C.1.11",
  "culture.aviation-mondiale.sukhoi-su-27": "CULT · C.1.12",
  "culture.aviation-mondiale.sukhoi-su-34": "CULT · C.1.13",
  "culture.aviation-mondiale.sukhoi-su-35": "CULT · C.1.14",
  "culture.aviation-mondiale.sukhoi-su-57": "CULT · C.1.15",
  "culture.aviation-mondiale.supermarine-spitfire": "CULT · C.1.16",
  "culture.aviation-mondiale.uh-60-black-hawk": "CULT · C.1.17",
  "eopan.appareils.atlantique-2": "EOPAN · C.6.01",
  "eopan.appareils.cap-10": "EOPAN · C.6.02",
  "eopan.appareils.dauphin": "EOPAN · C.6.03",
  "eopan.appareils.e-2c-hawkeye": "EOPAN · C.6.04",
  "eopan.appareils.falcon-200-gardian": "EOPAN · C.6.05",
  "eopan.appareils.falcon-2000-albatros": "EOPAN · C.6.06",
  "eopan.appareils.falcon-50m": "EOPAN · C.6.07",
  "eopan.appareils.nh90-caiman": "EOPAN · C.6.08",
  "eopan.appareils.panther": "EOPAN · C.6.09",
  "eopan.appareils.rafale-m": "EOPAN · C.6.10",
  "eopan.appareils.super-etendard": "EOPAN · C.6.11",
  "eopan.ban.hyeres": "EOPAN · C.9.01",
  "eopan.ban.landivisiau": "EOPAN · C.9.02",
  "eopan.ban.lann-bihoue": "EOPAN · C.9.03",
  "eopan.ban.lanveoc-poulmic": "EOPAN · C.9.04",
  "eopan.bases.charles-de-gaulle": "EOPAN · C.7.01",
  "eopan.bases.flottille-11f": "EOPAN · C.10.01",
  "eopan.grades.grades-de-la-marine": "EOPAN · C.13.01",
  "eopan.organisation.aeronautique-navale": "EOPAN · C.4.01",
  "eopan.organisation.marine-nationale": "EOPAN · C.4.02",
  "eopan.unites.flottille-12f": "EOPAN · C.10.02",
  "eopan.unites.flottille-17f": "EOPAN · C.10.03",
  "eopan.unites.flottille-21f": "EOPAN · C.10.04",
  "eopan.unites.flottille-23f": "EOPAN · C.10.05",
  "eopan.unites.flottille-33f": "EOPAN · C.10.06",
  "eopan.unites.flottille-4f": "EOPAN · C.10.07",
  "eopn.appareils.a400m": "EOPN · C.6.01",
  "eopn.appareils.alphajet": "EOPN · C.6.02",
  "eopn.appareils.c-130-hercules": "EOPN · C.6.03",
  "eopn.appareils.e-3f-awacs": "EOPN · C.6.04",
  "eopn.appareils.falcon-8x-archange": "EOPN · C.6.05",
  "eopn.appareils.mirage-2000": "EOPN · C.6.06",
  "eopn.appareils.mirage-iii": "EOPN · C.6.07",
  "eopn.appareils.mirage-iv": "EOPN · C.6.08",
  "eopn.appareils.mrtt-phenix": "EOPN · C.6.09",
  "eopn.appareils.pc-21": "EOPN · C.6.10",
  "eopn.appareils.rafale": "EOPN · C.6.11",
  "eopn.bases.cognac": "EOPN · C.8.01",
  "eopn.bases.istres": "EOPN · C.8.02",
  "eopn.bases.mont-de-marsan": "EOPN · C.8.03",
  "eopn.bases.saint-dizier": "EOPN · C.8.04",
  "eopn.bases.salon-de-provence": "EOPN · C.8.05",
  "eopn.grades.grades-de-l-armee-de-l-air": "EOPN · C.13.01",
  "eopn.organisation.armee-de-l-air-et-de-l-espace": "EOPN · C.4.01",
  "eopn.organisation.ecole-de-l-aviation-de-chasse": "EOPN · C.4.02",
  "eopn.organisation.les-forces-aeriennes-strategiques": "EOPN · C.4.03",
  "eopn.unites.escadron-1-4-gascogne": "EOPN · C.10.01",
  "eopn.unites.la-patrouille-de-france": "EOPN · C.10.02",
  "eopn.unites.normandie-niemen": "EOPN · C.10.03",
};

describe("cotes documentaires des notices", () => {
  it("chaque notice porte une cote", () => {
    const sans = getFichesParArchetype("identification")
      .filter((fiche) => getCoteFiche(fiche.id) === undefined)
      .map((fiche) => fiche.id);
    expect(sans, "notices sans cote").toEqual([]);
  });

  it("aucune autre famille n'en porte", () => {
    // Une cote attribuée à une fiche de La Leçon serait un gel prématuré : sa
    // grammaire documentaire n'est pas encore arrêtée. M6b ne cote que les
    // notices, et rien d'autre.
    const hors = getFiches()
      .filter((fiche) => getCoteFiche(fiche.id) !== undefined)
      .filter((fiche) => !getFichesParArchetype("identification").includes(fiche))
      .map((fiche) => fiche.id);
    expect(hors, "cotes hors de La Planche d'identification").toEqual([]);
  });

  it("aucune cote n'est portée par deux notices", () => {
    const cotes = [...getCotesFiches().values()];
    expect(new Set(cotes).size).toBe(cotes.length);
  });

  it("les cotes existantes n'ont pas bougé", () => {
    for (const [id, cote] of Object.entries(COTES_GELEES)) {
      expect(getCoteFiche(id), id).toBe(cote);
    }
    // Et rien n'a été ajouté en douce : le gel couvre exactement le corpus.
    expect([...getCotesFiches().keys()].sort()).toEqual(Object.keys(COTES_GELEES).sort());
  });

  it("suit la grammaire MODULE · C.C.NN", () => {
    for (const [id, cote] of getCotesFiches()) {
      expect(cote, id).toMatch(/^(EOPAN|EOPN|ALAT|CULT) · C\.\d{1,2}\.\d{2}$/);
    }
  });

  it("le segment de famille vaut C — La Planche d'identification", () => {
    for (const [id, cote] of getCotesFiches()) {
      expect(cote.split(" · ")[1].split(".")[0], id).toBe("C");
    }
  });

  it("le segment de catégorie est le rang déclaré au référentiel", () => {
    // Et non le préfixe de l'identifiant : « eopan.bases.charles-de-gaulle »
    // vit dans la catégorie « navires » (rang 7). L'identifiant est gelé, la
    // catégorie ne l'est pas — c'est la catégorie qui fait foi.
    for (const fiche of getFichesParArchetype("identification")) {
      const rangs = new Map(getCategories(fiche.module).map((c) => [c.slug, c.order]));
      const segment = getCoteFiche(fiche.id)?.split(".")[1];
      expect(Number(segment), `${fiche.id} : C doit valoir le rang de sa catégorie`).toBe(
        rangs.get(fiche.category)
      );
    }
  });

  it("le dernier segment est un numéro DANS LA CATÉGORIE, pas un rang global", () => {
    // La preuve tient en une ligne : deux notices de catégories différentes
    // portent le même NN sans se marcher dessus, parce que le segment de
    // catégorie les sépare. Un rang global l'interdirait.
    expect(getCoteFiche("eopan.appareils.atlantique-2")).toBe("EOPAN · C.6.01");
    expect(getCoteFiche("eopan.ban.hyeres")).toBe("EOPAN · C.9.01");

    // Chaque catégorie repart de 01 et se suit sans trou à l'initialisation.
    const parCategorie = new Map<string, number[]>();
    for (const fiche of getFichesParArchetype("identification")) {
      const cle = `${fiche.module}/${fiche.category}`;
      const nn = Number(getCoteFiche(fiche.id)?.slice(-2));
      parCategorie.set(cle, [...(parCategorie.get(cle) ?? []), nn]);
    }
    for (const [cle, nns] of parCategorie) {
      const tries = [...nns].sort((a, b) => a - b);
      expect(tries, cle).toEqual(Array.from({ length: tries.length }, (_, i) => i + 1));
    }
  });

  it("le numéro n'est pas un rang d'affichage", () => {
    // Contre-épreuve, et elle n'est pas tautologique : si NN suivait l'ordre
    // d'affichage, la suite des numéros lue dans cet ordre serait croissante
    // dans TOUTES les catégories. Elle ne l'est pas — cinq catégories
    // divergent aujourd'hui, dont « eopn/bases » où la notice affichée en
    // premier porte 03.
    const cles = new Set(
      getFichesParArchetype("identification").map((f) => `${f.module}/${f.category}`)
    );
    const divergentes = [...cles].filter((cle) => {
      const [mod, cat] = cle.split("/");
      const nns = getFichesByCategory(mod, cat).map((f) => Number(getCoteFiche(f.id)?.slice(-2)));
      return nns.some((nn, i) => i > 0 && nn < nns[i - 1]);
    });
    expect(divergentes.length, "aucune catégorie ne distingue cote et affichage").toBeGreaterThan(
      0
    );
  });

  it("ne dépend d'aucun tri courant : deux lectures rendent la même chose", () => {
    const premier = [...getCotesFiches().entries()];
    const melange = [...getFichesParArchetype("identification")]
      .reverse()
      .map((f) => [f.id, getCoteFiche(f.id)] as const);
    for (const [id, cote] of melange) {
      expect(premier.find(([i]) => i === id)?.[1]).toBe(cote);
    }
  });

  it("le référentiel ne contient aucune cote orpheline", () => {
    const ids = new Set(getFiches().map((f) => f.id));
    const orphelines = [...getCotesFiches().keys()].filter((id) => !ids.has(id));
    expect(orphelines).toEqual([]);
  });

  it("deux chiffres suffisent encore, avec de la marge", () => {
    // Garde-fou de capacité : le jour où une catégorie approche de 99, la
    // migration en trois chiffres doit être une décision, pas une surprise au
    // moment d'écrire la 100e notice.
    const parCategorie = new Map<string, number>();
    for (const fiche of getFichesParArchetype("identification")) {
      const cle = `${fiche.module}/${fiche.category}`;
      parCategorie.set(cle, (parCategorie.get(cle) ?? 0) + 1);
    }
    const max = Math.max(...parCategorie.values());
    expect(max, "une catégorie approche de 99 notices — passer à trois chiffres").toBeLessThan(90);
  });
});
