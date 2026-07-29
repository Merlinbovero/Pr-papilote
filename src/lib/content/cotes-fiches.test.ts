import { describe, expect, it } from "vitest";

import { getFichesParArchetype } from "./archetypes";
import { getFiches, getFichesByCategory } from "./fiches";
import {
  getCategories,
  getCotesCours,
  getCotesFiches,
  getCoteCours,
  getCoteFiche,
} from "./referentials";

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
 * 2026-07-29 (M6b) — 66 notices des trois concours, famille « C ».
 * 2026-07-29 (M7a) — 17 notices d'appareils étrangers, « CULT · C.1.NN »,
 * reclassées depuis Le Cahier.
 * 2026-07-29 (M7b) — 20 articles du Cahier (« D ») et 4 situations (« E »).
 * 2026-07-29 (M8a) — 108 fiches explicatives de notion (« G »).
 *
 * **Aucune cote antérieure n'a jamais bougé** à chacune de ces arrivées : c'est
 * exactement ce que le gel doit démontrer, une arrivée ne renumérote rien.
 *
 * Les 131 fiches de La Leçon n'ont **pas** de cote, et c'est délibéré : on ne
 * gèle pas une référence avant d'avoir arrêté la grammaire de sa famille.
 */

/** La lettre de famille attendue, par archétype (docs/design-archetypes.md §1). */
const FAMILLE: Record<string, string> = {
  identification: "C",
  cahier: "D",
  situation: "E",
  lecon: "G",
};

/** Les familles cotées à ce jour. Le Dossier n'en fait pas encore partie. */
const FAMILLES_COTEES = ["identification", "cahier", "situation", "lecon"] as const;
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
  "alat.histoire.histoire-de-l-alat": "ALAT · D.15.01",
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
  "culture.culture-aeronautique.commando-parachutiste-air-cpa-10": "CULT · D.3.01",
  "culture.culture-aeronautique.escadrons-agresseurs": "CULT · D.3.02",
  "culture.culture-aeronautique.jumelles-de-vision-nocturne": "CULT · D.3.03",
  "culture.geopolitique-defense.grandes-dates-aviation-militaire-francaise": "CULT · E.2.01",
  "culture.geopolitique-defense.operations-exterieures-recentes": "CULT · E.2.02",
  "culture.geopolitique-defense.organisation-de-la-defense-francaise": "CULT · E.2.03",
  "culture.geopolitique-defense.red-flag": "CULT · E.2.04",
  "culture.personnalites.antoine-de-saint-exupery": "CULT · D.4.01",
  "culture.personnalites.georges-guynemer": "CULT · D.4.02",
  "culture.personnalites.helene-boucher": "CULT · D.4.03",
  "culture.personnalites.henri-guillaumet": "CULT · D.4.04",
  "culture.personnalites.jean-mermoz": "CULT · D.4.05",
  "culture.personnalites.louis-bleriot": "CULT · D.4.06",
  "culture.personnalites.roland-garros": "CULT · D.4.07",
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
  "eopan.culture-militaire.culture-et-valeurs-de-la-marine": "EOPAN · D.5.01",
  "eopan.grades.grades-de-la-marine": "EOPAN · C.13.01",
  "eopan.histoire.histoire-de-l-aeronautique-navale": "EOPAN · D.15.01",
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
  "eopn.histoire.histoire-de-l-armee-de-l-air": "EOPN · D.15.01",
  "eopn.organisation.armee-de-l-air-et-de-l-espace": "EOPN · C.4.01",
  "eopn.organisation.ecole-de-l-aviation-de-chasse": "EOPN · C.4.02",
  "eopn.organisation.les-forces-aeriennes-strategiques": "EOPN · C.4.03",
  "eopn.unites.escadron-1-4-gascogne": "EOPN · C.10.01",
  "eopn.unites.la-patrouille-de-france": "EOPN · C.10.02",
  "eopn.unites.normandie-niemen": "EOPN · C.10.03",
  "fondamentaux.aerodynamique.air-et-proprietes": "FOND · G.3.01",
  "fondamentaux.aerodynamique.conservation-du-debit": "FOND · G.3.02",
  "fondamentaux.aerodynamique.decrochage": "FOND · G.3.03",
  "fondamentaux.aerodynamique.ecoulement-de-l-air": "FOND · G.3.04",
  "fondamentaux.aerodynamique.l-aerostatique": "FOND · G.3.05",
  "fondamentaux.aerodynamique.l-allongement-et-les-winglets": "FOND · G.3.06",
  "fondamentaux.aerodynamique.la-couche-limite": "FOND · G.3.07",
  "fondamentaux.aerodynamique.la-force-aerodynamique": "FOND · G.3.08",
  "fondamentaux.aerodynamique.la-polaire": "FOND · G.3.09",
  "fondamentaux.aerodynamique.la-trainee-induite": "FOND · G.3.10",
  "fondamentaux.aerodynamique.les-axes-et-les-gouvernes": "FOND · G.3.11",
  "fondamentaux.aerodynamique.les-bilans-de-forces": "FOND · G.3.12",
  "fondamentaux.aerodynamique.les-effets-moteur": "FOND · G.3.13",
  "fondamentaux.aerodynamique.les-souffleries": "FOND · G.3.14",
  "fondamentaux.aerodynamique.les-types-de-profils": "FOND · G.3.15",
  "fondamentaux.aerodynamique.les-volets-et-becs": "FOND · G.3.16",
  "fondamentaux.aerodynamique.mur-du-son-et-vol-supersonique": "FOND · G.3.17",
  "fondamentaux.aerodynamique.portance": "FOND · G.3.18",
  "fondamentaux.aerodynamique.pression-statique-dynamique-totale": "FOND · G.3.19",
  "fondamentaux.aerodynamique.profil-d-aile": "FOND · G.3.20",
  "fondamentaux.aerodynamique.spoilers-et-aerofreins": "FOND · G.3.21",
  "fondamentaux.aerodynamique.stabilite-et-centrage": "FOND · G.3.22",
  "fondamentaux.aerodynamique.theoreme-de-bernoulli": "FOND · G.3.23",
  "fondamentaux.aerodynamique.trainee": "FOND · G.3.24",
  "fondamentaux.anglais-aeronautique.l-anglais-de-l-approche": "FOND · G.12.01",
  "fondamentaux.anglais-aeronautique.l-anglais-des-selections": "FOND · G.12.02",
  "fondamentaux.anglais-aeronautique.l-anglais-des-urgences": "FOND · G.12.03",
  "fondamentaux.anglais-aeronautique.l-anglais-du-sol-et-du-decollage": "FOND · G.12.04",
  "fondamentaux.anglais-aeronautique.l-anglais-militaire": "FOND · G.12.05",
  "fondamentaux.anglais-aeronautique.la-cellule-et-les-commandes": "FOND · G.12.06",
  "fondamentaux.anglais-aeronautique.la-comprehension-ecrite": "FOND · G.12.07",
  "fondamentaux.anglais-aeronautique.la-meteo-en-anglais": "FOND · G.12.08",
  "fondamentaux.anglais-aeronautique.la-phraseologie-anglaise": "FOND · G.12.09",
  "fondamentaux.anglais-aeronautique.le-brevity-code": "FOND · G.12.10",
  "fondamentaux.anglais-aeronautique.le-moteur-et-le-carburant": "FOND · G.12.11",
  "fondamentaux.anglais-aeronautique.les-faux-amis": "FOND · G.12.12",
  "fondamentaux.anglais-aeronautique.les-instruments-en-anglais": "FOND · G.12.13",
  "fondamentaux.anglais-aeronautique.les-modaux": "FOND · G.12.14",
  "fondamentaux.anglais-aeronautique.les-temps-du-recit": "FOND · G.12.15",
  "fondamentaux.anglais-aeronautique.les-verbes-du-vol": "FOND · G.12.16",
  "fondamentaux.anglais-aeronautique.lire-un-notam": "FOND · G.12.17",
  "fondamentaux.anglais-aeronautique.vocabulaire-de-base": "FOND · G.12.18",
  "fondamentaux.cartographie.echelle-et-mesures": "FOND · G.8.01",
  "fondamentaux.cartographie.lire-une-carte-aeronautique": "FOND · G.8.02",
  "fondamentaux.culture-aeronautique.l-epner": "FOND · D.15.01",
  "fondamentaux.culture-aeronautique.la-conquete-de-l-espace": "FOND · D.15.02",
  "fondamentaux.culture-aeronautique.le-bia": "FOND · D.15.03",
  "fondamentaux.culture-aeronautique.les-grandes-ecoles-aeronautiques": "FOND · D.15.04",
  "fondamentaux.culture-aeronautique.les-pionniers-et-l-aeropostale": "FOND · D.15.05",
  "fondamentaux.culture-aeronautique.naissance-de-l-aviation-francaise": "FOND · D.15.06",
  "fondamentaux.facteurs-humains.culture-de-securite-et-rex": "FOND · G.10.01",
  "fondamentaux.facteurs-humains.desorientation-et-illusions": "FOND · G.10.02",
  "fondamentaux.facteurs-humains.etude-de-cas-abordage-de-cognac": "FOND · G.10.03",
  "fondamentaux.facteurs-humains.hypoxie-et-altitude": "FOND · G.10.04",
  "fondamentaux.facteurs-humains.l-aptitude-medicale-du-navigant": "FOND · G.10.05",
  "fondamentaux.facteurs-humains.le-retour-d-experience": "FOND · G.10.06",
  "fondamentaux.instruments.altimetre": "FOND · G.7.01",
  "fondamentaux.instruments.anemometre": "FOND · G.7.02",
  "fondamentaux.instruments.chaine-pitot-statique": "FOND · G.7.03",
  "fondamentaux.instruments.compas-et-conservateur": "FOND · G.7.04",
  "fondamentaux.instruments.horizon-artificiel": "FOND · G.7.05",
  "fondamentaux.instruments.les-six-instruments-de-base": "FOND · G.7.06",
  "fondamentaux.mecanique-du-vol.axes-et-gouvernes": "FOND · G.4.01",
  "fondamentaux.mecanique-du-vol.decrochage-et-vrille": "FOND · G.4.02",
  "fondamentaux.mecanique-du-vol.equilibre-et-centrage": "FOND · G.4.03",
  "fondamentaux.mecanique-du-vol.la-propulsion": "FOND · G.4.04",
  "fondamentaux.mecanique-du-vol.le-vol-de-l-helicoptere": "FOND · G.4.05",
  "fondamentaux.mecanique-du-vol.quatre-forces": "FOND · G.4.06",
  "fondamentaux.mecanique-du-vol.turbomoteur-et-helicopteres": "FOND · G.4.07",
  "fondamentaux.mecanique-du-vol.virage": "FOND · G.4.08",
  "fondamentaux.meteorologie.atmosphere-standard": "FOND · G.5.01",
  "fondamentaux.meteorologie.le-vent": "FOND · G.5.02",
  "fondamentaux.meteorologie.les-nuages": "FOND · G.5.03",
  "fondamentaux.meteorologie.lire-un-metar": "FOND · G.5.04",
  "fondamentaux.meteorologie.lire-un-taf": "FOND · G.5.05",
  "fondamentaux.meteorologie.masses-d-air-et-fronts": "FOND · G.5.06",
  "fondamentaux.meteorologie.phenomenes-dangereux": "FOND · G.5.07",
  "fondamentaux.meteorologie.pression-et-calage": "FOND · G.5.08",
  "fondamentaux.meteorologie.temperature-et-humidite": "FOND · G.5.09",
  "fondamentaux.navigation.cap-route-et-derive": "FOND · G.6.01",
  "fondamentaux.navigation.declinaison-magnetique": "FOND · G.6.02",
  "fondamentaux.navigation.la-radionavigation": "FOND · G.6.03",
  "fondamentaux.navigation.temps-vitesse-distance": "FOND · G.6.04",
  "fondamentaux.navigation.terre-et-coordonnees": "FOND · G.6.05",
  "fondamentaux.physique.les-trois-lois-de-newton": "FOND · G.1.01",
  "fondamentaux.physique.pression-forces-unites": "FOND · G.1.02",
  "fondamentaux.physique.systeme-international-et-unites": "FOND · G.1.03",
  "fondamentaux.radio-communications.alphabet-oaci": "FOND · G.11.01",
  "fondamentaux.radio-communications.la-bande-uhf": "FOND · G.11.02",
  "fondamentaux.radio-communications.la-bande-vhf": "FOND · G.11.03",
  "fondamentaux.radio-communications.la-phraseologie-de-base": "FOND · G.11.04",
  "fondamentaux.reglementation.espaces-aeriens": "FOND · G.9.01",
  "fondamentaux.reglementation.les-regles-de-l-air": "FOND · G.9.02",
  "psychotechnique.exercices.l-attention-et-le-multitache": "PSY · G.3.01",
  "psychotechnique.exercices.la-comparaison-de-nombres": "PSY · G.3.02",
  "psychotechnique.exercices.la-dissociation-d-attention": "PSY · G.3.03",
  "psychotechnique.exercices.la-lecture-d-instruments": "PSY · G.3.04",
  "psychotechnique.exercices.la-memoire": "PSY · G.3.05",
  "psychotechnique.exercices.la-memoire-associative": "PSY · G.3.06",
  "psychotechnique.exercices.la-vision-spatiale": "PSY · G.3.07",
  "psychotechnique.exercices.le-calcul-mental": "PSY · G.3.08",
  "psychotechnique.exercices.le-raisonnement-mecanique": "PSY · G.3.09",
  "psychotechnique.exercices.le-secpil": "PSY · G.3.10",
  "psychotechnique.exercices.le-test-d-orientation": "PSY · G.3.11",
  "psychotechnique.exercices.le-test-de-codage": "PSY · G.3.12",
  "psychotechnique.exercices.le-test-des-appareils-photos": "PSY · G.3.13",
  "psychotechnique.exercices.le-test-des-triangles": "PSY · G.3.14",
  "psychotechnique.exercices.les-analogies": "PSY · G.3.15",
  "psychotechnique.exercices.les-dominos": "PSY · G.3.16",
  "psychotechnique.exercices.les-formes-imbriquees": "PSY · G.3.17",
  "psychotechnique.exercices.les-horloges-et-durees": "PSY · G.3.18",
  "psychotechnique.exercices.les-matrices": "PSY · G.3.19",
  "psychotechnique.exercices.les-suites-logiques": "PSY · G.3.20",
  "psychotechnique.methodologie.reussir-les-tests-psychotechniques": "PSY · G.1.01",
};

describe("cotes documentaires des fiches", () => {
  it.each(FAMILLES_COTEES)("chaque fiche de la famille %s porte une cote", (famille) => {
    const sans = getFichesParArchetype(famille)
      .filter((fiche) => getCoteFiche(fiche.id) === undefined)
      .map((fiche) => fiche.id);
    expect(sans, `fiches sans cote — famille ${famille}`).toEqual([]);
  });

  it("Le Dossier n'en porte aucune : sa grammaire n'est pas arrêtée", () => {
    const hors = getFichesParArchetype("dossier")
      .filter((fiche) => getCoteFiche(fiche.id) !== undefined)
      .map((fiche) => fiche.id);
    expect(hors, "cotes attribuées avant l'heure").toEqual([]);
  });

  /**
   * LA GARANTIE CENTRALE DE LA DOCTRINE M8a.
   *
   * L'unicité était vérifiée DANS `cours` et DANS `fiches`, jamais ENTRE les
   * deux. Aucune collision n'existait — les lettres différaient — mais rien ne
   * l'empêchait, et c'est exactement le risque qu'introduisait la famille des
   * fiches de notion : réutiliser « B » aurait produit quatorze doublons entre
   * les deux tables, tous invisibles à une vérification table par table.
   */
  it("l'unicité vaut sur l'UNION des référentiels, pas table par table", () => {
    const toutes = [...getCotesCours().values(), ...getCotesFiches().values()];
    const doublons = toutes.filter((c, i) => toutes.indexOf(c) !== i);
    expect([...new Set(doublons)], "cotes portées par deux documents").toEqual([]);
    expect(new Set(toutes).size).toBe(toutes.length);
  });

  it("B et G ne se rencontrent jamais", () => {
    // B est réservé aux leçons canoniques, G aux fiches explicatives. Si l'une
    // des deux familles débordait sur l'autre lettre, la citation redeviendrait
    // ambiguë entre deux documents voisins.
    for (const [slug, cote] of getCotesCours()) {
      expect(cote.split(" · ")[1].startsWith("B."), `leçon ${slug}`).toBe(true);
    }
    for (const fiche of getFichesParArchetype("lecon")) {
      expect(getCoteFiche(fiche.id)?.split(" · ")[1].startsWith("G."), fiche.id).toBe(true);
    }
  });

  it("aucune clé n'appartient aux deux tables", () => {
    // Les deux tables sont clées différemment — slug d'un côté, identifiant de
    // contenu de l'autre. Une clé partagée signalerait une confusion entre les
    // deux objets de contenu.
    const slugs = new Set(getCotesCours().keys());
    const ids = new Set(getCotesFiches().keys());
    expect([...slugs].filter((s) => ids.has(s))).toEqual([]);
  });

  it("les 14 leçons canoniques gardent les leurs — elles ne sont pas visées", () => {
    // Le pendant du test précédent : sans lui, « La Leçon n'a pas de cote »
    // pourrait être lu comme une consigne de retrait.
    expect(getCotesCours().size).toBe(14);
    expect(getCoteCours("couche-limite-et-decrochage")).toBe("FOND · B.3.07");
  });

  it("aucune fiche non classée dans une famille cotée n'en porte", () => {
    const cotables = new Set(FAMILLES_COTEES.flatMap((f) => getFichesParArchetype(f)));
    const hors = getFiches()
      .filter((fiche) => getCoteFiche(fiche.id) !== undefined && !cotables.has(fiche))
      .map((fiche) => fiche.id);
    expect(hors).toEqual([]);
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

  it("suit la grammaire MODULE · F.C.NN", () => {
    for (const [id, cote] of getCotesFiches()) {
      expect(cote, id).toMatch(/^(EOPAN|EOPN|ALAT|FOND|PSY|CULT) · [CDEG]\.\d{1,2}\.\d{2}$/);
    }
  });

  it("le segment de famille est celui de l'archétype de la fiche", () => {
    // C'est la cote qui doit suivre la famille, jamais l'inverse. Reclasser une
    // fiche sans réécrire sa cote laisserait une référence qui ment.
    for (const famille of FAMILLES_COTEES) {
      for (const fiche of getFichesParArchetype(famille)) {
        const lettre = getCoteFiche(fiche.id)?.split(" · ")[1].split(".")[0];
        expect(lettre, `${fiche.id} (${famille})`).toBe(FAMILLE[famille]);
      }
    }
  });

  it("le segment de catégorie est le rang déclaré au référentiel", () => {
    // Et non le préfixe de l'identifiant : « eopan.bases.charles-de-gaulle »
    // vit dans la catégorie « navires » (rang 7). L'identifiant est gelé, la
    // catégorie ne l'est pas — c'est la catégorie qui fait foi.
    for (const fiche of FAMILLES_COTEES.flatMap((f) => getFichesParArchetype(f))) {
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
    for (const fiche of FAMILLES_COTEES.flatMap((f) => getFichesParArchetype(f))) {
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
      FAMILLES_COTEES.flatMap((f) => getFichesParArchetype(f)).map(
        (f) => `${f.module}/${f.category}`
      )
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
    const melange = [...FAMILLES_COTEES.flatMap((f) => getFichesParArchetype(f))]
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
    for (const fiche of FAMILLES_COTEES.flatMap((f) => getFichesParArchetype(f))) {
      const cle = `${fiche.module}/${fiche.category}`;
      parCategorie.set(cle, (parCategorie.get(cle) ?? 0) + 1);
    }
    const max = Math.max(...parCategorie.values());
    expect(max, "une catégorie approche de 99 notices — passer à trois chiffres").toBeLessThan(90);
  });
});
