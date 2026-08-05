#!/usr/bin/env node
/**
 * Échantillon de relecture humaine — lot C1, préparation de C2.
 *
 * ── Ce que ce script prépare ───────────────────────────────────────────────
 * La relecture scientifique de C2 ne peut pas porter sur cent six croquis d'un
 * coup. Ce script tire un échantillon reproductible, produit une **grille
 * vierge** à remplir à la main, et range **à part** ce que la machine croit
 * savoir.
 *
 * ── Pourquoi les prédictions sont dans un autre fichier ────────────────────
 * Parce qu'une grille pré-remplie n'est plus une relecture : c'est une
 * validation d'accord. Si le relecteur lit « F10 » avant de regarder le
 * dessin, il confirmera F10. La séparation n'est pas de la prudence, c'est la
 * condition pour que la comparaison veuille dire quelque chose.
 *
 * ── Ce que le classifieur vaut ─────────────────────────────────────────────
 * Il est **lexical** : il lit les mots des `<text>` du SVG et le titre de la
 * fiche, et applique des règles de mots-clés. Il ne voit pas le dessin. Il ne
 * peut donc pas dire si un croquis est juste — seulement de quoi il a l'air de
 * parler. Aucun taux de justesse n'est affiché ici : il sera **mesuré** par
 * `audit-croquis-compare.mjs` une fois la grille remplie, ou pas affiché du
 * tout.
 *
 * ── Déterminisme ──────────────────────────────────────────────────────────
 * Le tirage n'est pas aléatoire : il est ordonné par une empreinte stable du
 * `schemaId`, stratifiée par module. Deux exécutions donnent le même
 * échantillon, indéfiniment — sans quoi la relecture ne serait pas
 * reproductible et l'on ne saurait jamais ce qui a été relu.
 *
 * Comme pour l'inventaire, l'instant de génération est complet et change donc
 * à chaque exécution ; c'est `contentDigest` qui porte la preuve que le tirage
 * et les prédictions, eux, n'ont pas bougé.
 *
 * Usage : node scripts/audit-croquis-sample.mjs
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const RACINE = resolve(import.meta.dirname, "..");
const DOSSIER_RAPPORTS = join(RACINE, "reports", "croquis");
const DOSSIER_SORTIE = join(DOSSIER_RAPPORTS, "validation-humaine");
const INVENTAIRE = join(DOSSIER_RAPPORTS, "inventory.json");

/** Taille de l'échantillon. Un tiers du parc : assez pour voir, tenable à relire. */
const TAILLE_ECHANTILLON = 30;

if (!existsSync(INVENTAIRE)) {
  console.error(
    "reports/croquis/inventory.json absent — lancer d'abord `npm run croquis:inventory`."
  );
  process.exit(1);
}

const inventaire = JSON.parse(readFileSync(INVENTAIRE, "utf8"));

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: RACINE, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Tirage reproductible
// ---------------------------------------------------------------------------

/**
 * Empreinte FNV-1a 32 bits.
 *
 * Un générateur pseudo-aléatoire même graine aurait marché, mais son ordre
 * dépend de l'ordre d'appel : ajouter un croquis aurait décalé tout
 * l'échantillon. Une empreinte par identifiant est **stable par élément** —
 * ajouter un croquis n'en retire aucun autre du tirage.
 */
function empreinte(texte) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** schemaId → premier document citant (ordre déjà trié dans l'inventaire). */
const citantParSchema = new Map();
for (const document of inventaire.documentsWithFigures) {
  for (const schemaId of document.schemaIds) {
    if (!citantParSchema.has(schemaId)) citantParSchema.set(schemaId, document);
  }
}

const population = inventaire.svgFiles.map((svg) => {
  const citant = citantParSchema.get(svg.schemaId) ?? null;
  return {
    schemaId: svg.schemaId,
    file: svg.file,
    bytes: svg.bytes,
    referenceCount: svg.referenceCount,
    module: citant?.module ?? "(non cité)",
    contentId: citant?.id ?? null,
    ficheFile: citant?.file ?? null,
    ficheLevel: citant?.level ?? null,
    hash: empreinte(svg.schemaId),
  };
});

/**
 * Stratification par module, répartition au plus fort reste.
 *
 * Sans elle, un tirage par empreinte pure aurait pu ne contenir que des
 * croquis d'aérodynamique — l'échantillon aurait alors dit quelque chose des
 * Fondamentaux, et rien du reste du produit.
 */
const strates = new Map();
for (const element of population) {
  if (!strates.has(element.module)) strates.set(element.module, []);
  strates.get(element.module).push(element);
}

const nomsStrates = [...strates.keys()].sort((a, b) => a.localeCompare(b, "en"));
const quotas = nomsStrates.map((nom) => {
  const exact = (strates.get(nom).length * TAILLE_ECHANTILLON) / population.length;
  return { nom, exact, base: Math.floor(exact) };
});

let restant = TAILLE_ECHANTILLON - quotas.reduce((n, q) => n + q.base, 0);
for (const quota of [...quotas].sort(
  (a, b) => b.exact - b.base - (a.exact - a.base) || a.nom.localeCompare(b.nom, "en")
)) {
  if (restant <= 0) break;
  if (quota.base < strates.get(quota.nom).length) {
    quota.base += 1;
    restant -= 1;
  }
}

const echantillon = quotas
  .flatMap(({ nom, base }) =>
    [...strates.get(nom)]
      .sort((a, b) => a.hash - b.hash || a.schemaId.localeCompare(b.schemaId, "en"))
      .slice(0, base)
  )
  .sort((a, b) => a.schemaId.localeCompare(b.schemaId, "en"));

// ---------------------------------------------------------------------------
// Classifieur lexical
// ---------------------------------------------------------------------------

/*
  Règles de mots-clés, famille par famille. Elles sont volontairement peu
  nombreuses et lisibles : une règle qu'on ne peut pas relire ne peut pas être
  contestée, et c'est bien la contestation qu'on organise ici.

  L'ordre compte : la première famille dont un indice apparaît l'emporte, et
  les familles les plus spécifiques passent d'abord.
*/
const REGLES_FAMILLE = [
  [
    "F13",
    [
      "altimètre",
      "badin",
      "variomètre",
      "cadran",
      "aiguille",
      "horizon artificiel",
      "instrument",
      "compas",
      "anémomètre",
    ],
  ],
  [
    "F12",
    ["organigramme", "frise", "chronologie", "cursus", "hiérarchie", "commandement", "étape 1"],
  ],
  [
    "F11",
    ["base", "carte", "région", "aérodrome", "littoral", "implantation", "france", "porte-avions"],
  ],
  [
    "F10",
    [
      "courbe",
      "cz",
      "cx",
      "polaire",
      "abaque",
      "graphique",
      "axe des",
      "finesse",
      "altitude",
      "température",
      "profil isa",
    ],
  ],
  ["F5", ["pression", "dépression", "surpression", "extrados", "intrados", "répartition"]],
  [
    "F4",
    [
      "écoulement",
      "filet",
      "turbulent",
      "laminaire",
      "couche limite",
      "tourbillon",
      "sillage",
      "souffle",
    ],
  ],
  ["F3", ["composante", "projection", "résultante", "décomposition", "vecteur"]],
  ["F2", ["portance", "traînée", "poids", "poussée", "équilibre", "bilan des forces"]],
  [
    "F7",
    [
      "chaîne",
      "circuit",
      "commande",
      "transmission",
      "capteur",
      "prise",
      "gouverne",
      "hélice",
      "moteur",
    ],
  ],
  ["F8", ["séquence", "phase", "cycle", "avant", "après"]],
  ["F9", ["comparaison", "configuration", "volets sortis", "sans volets", "cas 1"]],
  ["F6", ["coupe", "vue en coupe", "section", "écorché"]],
  [
    "F1",
    [
      "corde",
      "envergure",
      "angle",
      "incidence",
      "dièdre",
      "flèche",
      "géométrie",
      "définition",
      "axe de",
      "roulis",
      "tangage",
      "lacet",
    ],
  ],
];

const INDICES_DOCUMENTAIRE = ["base", "carte", "frise", "organigramme", "insigne", "grade"];

/** Texte lisible d'un SVG : contenu des `<text>`, rien d'autre. */
function texteDuSvg(cheminRelatif) {
  const brut = readFileSync(join(RACINE, cheminRelatif), "utf8");
  return [...brut.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
    .map((m) =>
      m[1]
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .join(" ");
}

function classer(element) {
  const texte = texteDuSvg(element.file).toLowerCase();
  /*
    Le `schemaId` fait partie du corpus. C'est un indice lexical réel — un
    fichier nommé `chronologie-aeronavale` dit quelque chose — mais un indice
    NOMINAL : il reflète l'intention de celui qui a nommé le fichier, pas le
    contenu du dessin. Un croquis mal nommé sera mal classé, et c'est
    exactement le genre d'erreur que la relecture humaine doit attraper.
  */
  const contexte = `${element.schemaId} ${element.contentId ?? ""} ${element.ficheFile ?? ""}`
    .replace(/-/g, " ")
    .toLowerCase();
  const corpus = `${texte} ${contexte}`;

  const indices = [];
  let famille = null;
  for (const [candidate, motsCles] of REGLES_FAMILLE) {
    const touches = motsCles.filter((mot) => corpus.includes(mot));
    if (touches.length > 0 && famille === null) {
      famille = candidate;
      indices.push(...touches);
    }
  }

  const documentaire = INDICES_DOCUMENTAIRE.some((mot) => corpus.includes(mot));
  const chiffres = /\d/.test(texte);

  return {
    schemaId: element.schemaId,
    predictedFamily: famille,
    predictedFunction:
      famille === null ? null : documentaire && famille === "F11" ? "map" : "scientific_diagram",
    /** Un croquis portant des valeurs lisibles engage davantage qu'un croquis de principe. */
    carriesNumbers: chiffres,
    matchedKeywords: [...new Set(indices)].sort((a, b) => a.localeCompare(b, "fr")),
    textLength: texte.length,
    /** Aucune confiance chiffrée : elle serait inventée. Le champ dit ce qui a servi. */
    basis: "lexical — texte des <text> du SVG + identifiant de la fiche citante",
  };
}

const predictions = echantillon.map(classer);

/*
  Couverture mesurée sur les 106 croquis, pas sur les 30 tirés.

  Régler les règles sur l'échantillon reviendrait à les ajuster sur le jeu qui
  doit les évaluer : le taux d'accord obtenu ensuite ne voudrait plus rien
  dire. Les chiffres ci-dessous sont **agrégés** — ils ne révèlent la
  prédiction d'aucun croquis en particulier, donc ils ne contaminent pas la
  relecture.

  Une couverture n'est pas une justesse : elle dit combien de croquis reçoivent
  une famille, pas combien la reçoivent juste. Ce second chiffre n'existera
  qu'après la grille remplie.
*/
const predictionsPopulation = population.map(classer);
const couverture = { classified: 0, unclassified: 0, byFamily: {} };
for (const prediction of predictionsPopulation) {
  if (prediction.predictedFamily === null) couverture.unclassified += 1;
  else {
    couverture.classified += 1;
    couverture.byFamily[prediction.predictedFamily] =
      (couverture.byFamily[prediction.predictedFamily] ?? 0) + 1;
  }
}
couverture.byFamily = Object.fromEntries(
  Object.entries(couverture.byFamily).sort(([a], [b]) => a.localeCompare(b, "en"))
);

// ---------------------------------------------------------------------------
// Écriture
// ---------------------------------------------------------------------------

const provenance = {
  generatedAt: new Date().toISOString(),
  generator: "scripts/audit-croquis-sample.mjs",
  sourceCommit: inventaire.sourceCommit,
  inventoryGeneratedAt: inventaire.generatedAt,
  inventoryContentDigest: inventaire.contentDigest,
  sampleSize: echantillon.length,
  populationSize: population.length,
  selection: "empreinte FNV-1a du schemaId, stratifiée par module, plus fort reste",
};

const echapper = (valeur) => (valeur === null ? "" : String(valeur).replace(/"/g, '\\"'));

const grille = [
  "# Grille de relecture scientifique des croquis — à remplir à la main.",
  "#",
  "# NE PAS ouvrir predictions-machine.json avant d'avoir rempli cette grille.",
  "# Une grille remplie en connaissant la prédiction ne mesure plus rien.",
  "#",
  "# Champs à renseigner pour chaque croquis (laisser vide = non relu) :",
  "#   family            F1..F13        (doctrine §4)",
  "#   function          scientific_diagram | identification | orientation | map |",
  "#                     organization_chart | timeline",
  "#   level             P1 | P2 | P3   (doctrine §3)",
  "#   scientificallyCorrect  oui | non | a-revoir",
  "#   notes             ce qui est faux, ambigu ou manquant — en clair",
  "#",
  `# Échantillon : ${echantillon.length} croquis sur ${population.length}.`,
  `# Commit source : ${provenance.sourceCommit ?? "(indisponible)"}`,
  "",
  'reviewer: ""',
  'reviewedAt: ""',
  "diagrams:",
  ...echantillon.flatMap((element) => [
    `  - schemaId: "${element.schemaId}"`,
    `    file: "${element.file}"`,
    `    citedBy: "${echapper(element.ficheFile)}"`,
    `    module: "${echapper(element.module)}"`,
    '    family: ""',
    '    function: ""',
    '    level: ""',
    '    scientificallyCorrect: ""',
    '    notes: ""',
  ]),
  "",
].join("\n");

/**
 * Même règle que l'inventaire : l'instant de génération est complet et change
 * à chaque exécution, donc la reproductibilité se prouve par une empreinte du
 * contenu seul. Le tirage et les prédictions sont déterministes ; leur
 * empreinte doit rester identique d'une exécution à l'autre.
 */
const ecrireAvecEmpreinte = (nom, contenu) => {
  const contentDigest = createHash("sha256").update(JSON.stringify(contenu)).digest("hex");
  writeFileSync(
    join(DOSSIER_SORTIE, nom),
    `${JSON.stringify({ ...provenance, contentDigest, ...contenu }, null, 2)}\n`
  );
};

mkdirSync(DOSSIER_SORTIE, { recursive: true });
writeFileSync(join(DOSSIER_SORTIE, "grille-vierge.yaml"), grille);
ecrireAvecEmpreinte("predictions-machine.json", {
  populationCoverage: couverture,
  predictions,
});
ecrireAvecEmpreinte("echantillon.json", {
  sample: echantillon.map(({ hash: _h, ...reste }) => reste),
});

console.log(`Échantillon de ${echantillon.length} croquis sur ${population.length}.`);
console.log("  reports/croquis/validation-humaine/grille-vierge.yaml  (à remplir)");
console.log(
  "  reports/croquis/validation-humaine/predictions-machine.json  (à NE PAS ouvrir avant)"
);
console.log(`  arbre git : ${git("rev-parse", "--short", "HEAD") ?? "(indisponible)"}`);
