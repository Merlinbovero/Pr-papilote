#!/usr/bin/env node
/**
 * Inventaire des croquis — lot C1.
 *
 * ── Pourquoi ce script existe ──────────────────────────────────────────────
 * Le rapport C0 a affirmé « 24 croquis lus » (il y en avait 18), « 21 visuels
 * décoratifs » (16), et le premier rapport C1 a annoncé « 105 croquis
 * référencés pour 106 fichiers » — un orphelin qui n'existait pas, sur lequel
 * une conclusion entière avait été bâtie. Le script disait 106 depuis le
 * début ; c'est la recopie à la main qui a fabriqué l'écart.
 *
 * D'où la règle du chantier : **aucun total ne s'écrit à la main.** Tout
 * nombre publié sur les croquis sort d'ici, ou n'est pas publié.
 *
 * ── Ce que ce script mesure, et ce qu'il ne mesure pas ─────────────────────
 * Il compte des fichiers et des références. Il ne dit rien de la justesse
 * scientifique d'un dessin, ni de sa qualité pédagogique : aucune lecture de
 * fichier ne peut établir qu'un croquis est vrai. Cette part-là est le travail
 * de relecture humaine (C2), et l'échantillon qu'il prépare est produit par un
 * autre script.
 *
 * ── Déterminisme, et pourquoi il ne se mesure plus à l'octet ───────────────
 * La première version datait le rapport au **jour UTC**. Deux exécutions le
 * même jour donnaient donc des fichiers identiques à l'octet près — mais le
 * lendemain, un rapport inchangé affichait la veille, et rien ne permettait de
 * distinguer « le contenu n'a pas bougé » de « le rapport n'a pas été
 * régénéré ». Une date tronquée au jour crée cette ambiguïté sans rien
 * apporter.
 *
 * `generatedAt` porte donc l'**instant complet** de la génération, et le
 * déterminisme est prouvé autrement : `contentDigest` est l'empreinte SHA-256
 * de tout le rapport **sauf sa provenance**. Deux exécutions sur le même
 * contenu donnent la même empreinte ; si un diff ne touche que `generatedAt`,
 * l'empreinte le prouve, ligne à ligne.
 *
 * L'état réellement décrit reste identifié par `sourceCommit`.
 *
 * Usage : node scripts/audit-croquis-inventory.mjs
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { parseAllDocuments as parseAllYamlDocuments, parse as parseYaml } from "yaml";

const RACINE = resolve(import.meta.dirname, "..");
const DOSSIER_CONTENU = join(RACINE, "content");
const DOSSIER_SVG = join(DOSSIER_CONTENU, "schemas");
const DOSSIER_RAPPORTS = join(RACINE, "reports", "croquis");
const REGISTRE_INTERACTIONS = join(RACINE, "src", "features", "interactions", "registry.ts");

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: RACINE, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

/**
 * Les chemins réellement lus par ce script. La provenance porte sur eux, et
 * sur eux seuls.
 */
const ENTREES_MESUREES = ["content", "src/features/interactions/registry.ts"];

/*
  Pourquoi le commit source n'est PAS `HEAD`.

  Un rapport épinglé sur `HEAD` n'a pas de point fixe : le commit qui enregistre
  le rapport change `HEAD`, donc la régénération suivante produit un fichier
  différent alors que rien de mesuré n'a bougé — et le rapport ne pourrait
  jamais être committé dans un état stable.

  Le commit retenu est donc le dernier qui a TOUCHÉ les entrées mesurées. Il
  identifie exactement l'état décrit, et il ne bouge pas quand on committe le
  rapport lui-même.
*/
const provenance = {
  /** Instant complet, UTC. Voir la note sur le déterminisme en tête de fichier. */
  generatedAt: new Date().toISOString(),
  generator: "scripts/audit-croquis-inventory.mjs",
  measuredInputs: ENTREES_MESUREES,
  sourceCommit: git("log", "-1", "--format=%H", "--", ...ENTREES_MESUREES),
  sourceCommitDate: git("log", "-1", "--format=%cI", "--", ...ENTREES_MESUREES),
  /**
   * Une entrée mesurée modifiée signifie que le rapport ne décrit AUCUN commit :
   * il décrit un état de travail non reproductible. Le dire est plus utile que
   * de le taire.
   */
  measuredInputsClean: git("status", "--porcelain", "--", ...ENTREES_MESUREES) === "",
};

// ---------------------------------------------------------------------------
// Lecture du contenu
// ---------------------------------------------------------------------------

/** Parcours récursif, ordre trié — le déterminisme commence ici. */
function listerFichiers(dossier, filtre) {
  const trouves = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name, "en")
  )) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) trouves.push(...listerFichiers(chemin, filtre));
    else if (filtre(entree.name)) trouves.push(chemin);
  }
  return trouves;
}

const fichiersYaml = listerFichiers(
  DOSSIER_CONTENU,
  (n) => n.endsWith(".yaml") || n.endsWith(".yml")
);
const fichiersSvg = listerFichiers(DOSSIER_SVG, (n) => n.endsWith(".svg"));

/**
 * Collecte les figures partout où elles se trouvent.
 *
 * Le parcours est générique — tout objet portant un `schemaId` est une figure,
 * quelle que soit sa profondeur. Cibler `sections[].figures[]` aurait manqué
 * toute figure placée ailleurs plus tard, et le silence d'un inventaire est
 * pire que son absence.
 */
function collecterFigures(valeur, chemin, sortie) {
  if (Array.isArray(valeur)) {
    valeur.forEach((v, i) => collecterFigures(v, `${chemin}[${i}]`, sortie));
    return;
  }
  if (valeur === null || typeof valeur !== "object") return;
  if (typeof valeur.schemaId === "string") {
    sortie.push({
      schemaId: valeur.schemaId,
      path: chemin,
      hasAlt: typeof valeur.alt === "string" && valeur.alt.length > 0,
      hasCaption: typeof valeur.caption === "string" && valeur.caption.length > 0,
      hasMeta: valeur.meta !== undefined && valeur.meta !== null,
    });
  }
  for (const [cle, sousValeur] of Object.entries(valeur)) {
    collecterFigures(sousValeur, chemin ? `${chemin}.${cle}` : cle, sortie);
  }
}

const documents = [];
const erreursAnalyse = [];

/*
  Fichiers portant plusieurs documents YAML (séparateurs `---`).

  L'analyse ne lit que la racine de chaque fichier. Si un fichier en contenait
  deux, le second serait ignoré **en silence** — et l'inventaire mentirait par
  omission sans qu'aucun compteur ne bouge. La liste ci-dessous existe pour que
  ce cas ne puisse pas se produire sans être vu ; elle est vide, et c'est ce qui
  autorise à dire « un fichier = un document ».
*/
const fichiersMultiDocuments = [];

for (const chemin of fichiersYaml) {
  const relatif = relative(RACINE, chemin);
  let donnees;
  try {
    const brut = readFileSync(chemin, "utf8");
    const racines = parseAllYamlDocuments(brut);
    if (racines.length !== 1) {
      fichiersMultiDocuments.push({ file: relatif, documents: racines.length });
    }
    donnees = parseYaml(brut);
  } catch (erreur) {
    erreursAnalyse.push({ file: relatif, error: String(erreur.message ?? erreur).split("\n")[0] });
    continue;
  }
  const figures = [];
  collecterFigures(donnees, "", figures);
  documents.push({
    file: relatif,
    id: typeof donnees?.id === "string" ? donnees.id : null,
    module: typeof donnees?.module === "string" ? donnees.module : null,
    type: typeof donnees?.type === "string" ? donnees.type : null,
    level: typeof donnees?.level === "number" ? donnees.level : null,
    figures,
  });
}

// ---------------------------------------------------------------------------
// Croisement fichiers ↔ références
// ---------------------------------------------------------------------------

const svgSurDisque = new Map(
  fichiersSvg.map((chemin) => [
    chemin.slice(chemin.lastIndexOf("/") + 1, -4),
    { file: relative(RACINE, chemin), bytes: statSync(chemin).size },
  ])
);

/** schemaId → liste des documents qui le citent (triée). */
const referencesParSchema = new Map();
for (const document of documents) {
  for (const figure of document.figures) {
    if (!referencesParSchema.has(figure.schemaId)) referencesParSchema.set(figure.schemaId, []);
    referencesParSchema.get(figure.schemaId).push({
      file: document.file,
      contentId: document.id,
      module: document.module,
      path: figure.path,
      hasAlt: figure.hasAlt,
      hasCaption: figure.hasCaption,
      hasMeta: figure.hasMeta,
    });
  }
}

const trier = (liste) => [...liste].sort((a, b) => a.localeCompare(b, "en"));

/** SVG présent sur disque que personne ne cite. */
const orphelins = trier([...svgSurDisque.keys()].filter((id) => !referencesParSchema.has(id))).map(
  (id) => ({ schemaId: id, ...svgSurDisque.get(id) })
);

/** Référence pointant vers un fichier absent — un build cassé en puissance. */
const referencesCassees = trier(
  [...referencesParSchema.keys()].filter((id) => !svgSurDisque.has(id))
).map((id) => ({ schemaId: id, referencedBy: referencesParSchema.get(id).map((r) => r.file) }));

/** Croquis cité par plusieurs fiches — légitime, mais à connaître avant toute retouche. */
const partages = trier([...referencesParSchema.keys()])
  .filter((id) => new Set(referencesParSchema.get(id).map((r) => r.file)).size > 1)
  .map((id) => ({
    schemaId: id,
    files: trier([...new Set(referencesParSchema.get(id).map((r) => r.file))]),
  }));

/** Figures dépourvues de métadonnées scientifiques (contrat `meta`, lot C1). */
const figuresSansMeta = [];
const figuresAvecMeta = [];
for (const id of trier([...referencesParSchema.keys()])) {
  for (const reference of referencesParSchema.get(id)) {
    (reference.hasMeta ? figuresAvecMeta : figuresSansMeta).push({
      schemaId: id,
      file: reference.file,
      path: reference.path,
    });
  }
}

/** Figures sans texte alternatif — impossible en principe (le schéma l'exige). */
const figuresSansAlt = [];
for (const id of trier([...referencesParSchema.keys()])) {
  for (const reference of referencesParSchema.get(id)) {
    if (!reference.hasAlt) figuresSansAlt.push({ schemaId: id, file: reference.file });
  }
}

// ---------------------------------------------------------------------------
// Répartitions
// ---------------------------------------------------------------------------

function compter(paires) {
  const compteur = new Map();
  for (const clef of paires) compteur.set(clef, (compteur.get(clef) ?? 0) + 1);
  return Object.fromEntries(trier([...compteur.keys()]).map((k) => [k, compteur.get(k)]));
}

const documentsAvecFigure = documents.filter((d) => d.figures.length > 0);

/*
  Nature des documents — ajouté après le contrôle de cohérence de C1.

  Le rapport annonçait « 1 569 fichiers YAML analysés » quand les rapports
  antérieurs parlaient de 238 fiches et de 442 documents. Les trois nombres
  étaient exacts et **ne comptaient pas la même chose** : 1 569 est le nombre de
  fichiers YAML de `content/`, banque de questions comprise ; 442 est ce même
  total sans la banque ; 238 est le nombre de fiches. Rien n'était faux, et
  pourtant le rapport laissait le lecteur en tirer une contradiction.

  La parade n'est pas une note de bas de page : c'est que le rapport dise
  lui-même ce qu'il compte. La nature d'un document est déduite de son dossier
  de tête, et « fiche » est défini comme le chargeur le définit — un YAML placé
  sous un dossier de module de `modules.json` — plutôt que par une liste écrite
  ici, qui divergerait au premier module ajouté.
*/
const modulesDeContenu = new Set(
  JSON.parse(readFileSync(join(DOSSIER_CONTENU, "_referentiels", "modules.json"), "utf8")).map(
    (m) => m.slug
  )
);
const natureDuDocument = (cheminRelatifContenu) => {
  const dossier = cheminRelatifContenu.split("/")[0];
  return modulesDeContenu.has(dossier) ? "fiche" : dossier;
};

const repartitions = {
  /** Fichiers YAML analysés, par premier segment de chemin sous `content/`. */
  yamlFilesByFolder: compter(fichiersYaml.map((c) => relative(DOSSIER_CONTENU, c).split("/")[0])),
  /** Les mêmes fichiers, regroupés par nature d'entité éditoriale. */
  yamlDocumentsByKind: compter(
    fichiersYaml.map((c) => natureDuDocument(relative(DOSSIER_CONTENU, c)))
  ),
  /** Documents portant au moins une figure, par module déclaré. */
  documentsWithFigureByModule: compter(documentsAvecFigure.map((d) => d.module ?? "(sans module)")),
  /** Références de figures, par module du document citant. */
  figureReferencesByModule: compter(
    documentsAvecFigure.flatMap((d) => d.figures.map(() => d.module ?? "(sans module)"))
  ),
  /** Références de figures, par niveau déclaré de la fiche (`level`, 1 à 3). */
  figureReferencesByLevel: compter(
    documentsAvecFigure.flatMap((d) => d.figures.map(() => String(d.level ?? "(sans niveau)")))
  ),
};

/*
  Une échelle « S0–S4 » de sensibilité scientifique a circulé dans les rapports
  C0. Elle n'existe dans aucun champ de contenu, donc aucune répartition S0–S4
  ne peut être générée ici — et n'en sera donc écrite nulle part. La seule
  échelle réellement portée par les fiches est `level` (1 à 3), reprise
  ci-dessus.
*/

// ---------------------------------------------------------------------------
// Interactions (l'autre moitié du parc visuel)
// ---------------------------------------------------------------------------

/*
  Les interactions ne sont pas des fichiers SVG : elles dessinent en React. Un
  inventaire des croquis qui les ignorerait laisserait croire que le parc
  visuel se résume à `content/schemas/`. Les identifiants sont lus dans le
  registre, qui fait autorité.
*/
const interactions = trier(
  [...readFileSync(REGISTRE_INTERACTIONS, "utf8").matchAll(/^\s{4}id: "([^"]+)",$/gm)].map(
    (m) => m[1]
  )
);

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

const totaux = {
  /** Fichiers YAML physiques de `content/`, banque de questions comprise. */
  yamlFilesScanned: fichiersYaml.length,
  yamlFilesParsed: documents.length,
  /** Documents racines. Égal au nombre de fichiers tant que la liste ci-dessous est vide. */
  yamlRootDocuments:
    documents.length + fichiersMultiDocuments.reduce((n, f) => n + f.documents - 1, 0),
  multiDocumentFiles: fichiersMultiDocuments.length,
  parseErrors: erreursAnalyse.length,
  svgFilesOnDisk: svgSurDisque.size,
  distinctSchemaIdsReferenced: referencesParSchema.size,
  figureReferences: documents.reduce((n, d) => n + d.figures.length, 0),
  documentsWithAtLeastOneFigure: documentsAvecFigure.length,
  orphanSvg: orphelins.length,
  brokenReferences: referencesCassees.length,
  sharedSchemas: partages.length,
  figuresWithMeta: figuresAvecMeta.length,
  figuresWithoutMeta: figuresSansMeta.length,
  figuresWithoutAlt: figuresSansAlt.length,
  interactions: interactions.length,
};

const contenu = {
  totals: totaux,
  distributions: repartitions,
  multiDocumentFiles: fichiersMultiDocuments,
  parseErrors: erreursAnalyse,
  orphanSvg: orphelins,
  brokenReferences: referencesCassees,
  sharedSchemas: partages,
  figuresWithoutAlt: figuresSansAlt,
  figuresWithMeta: figuresAvecMeta,
  interactions,
  documentsWithFigures: documentsAvecFigure.map((d) => ({
    file: d.file,
    id: d.id,
    module: d.module,
    type: d.type,
    level: d.level,
    schemaIds: d.figures.map((f) => f.schemaId),
  })),
  svgFiles: trier([...svgSurDisque.keys()]).map((id) => ({
    schemaId: id,
    ...svgSurDisque.get(id),
    referenceCount: referencesParSchema.get(id)?.length ?? 0,
  })),
};

/**
 * Empreinte de tout le rapport **sauf sa provenance**.
 *
 * C'est elle qui porte la preuve de reproductibilité, à la place de l'égalité
 * octet à octet que l'instant de génération rend impossible. Deux exécutions
 * sur le même contenu donnent la même empreinte ; un diff qui ne touche que
 * `generatedAt` est donc démontrablement sans effet.
 */
const contentDigest = createHash("sha256").update(JSON.stringify(contenu)).digest("hex");

const rapport = { ...provenance, contentDigest, ...contenu };

/** Une liste vide s'écrit comme une liste vide — jamais comme une phrase. */
function bloc(titre, elements, rendu) {
  const lignes = [`### ${titre} (${elements.length})`, ""];
  if (elements.length === 0) lignes.push("_(liste vide)_", "");
  else lignes.push(...elements.map(rendu), "");
  return lignes;
}

const md = [
  "# Inventaire des croquis",
  "",
  "<!-- Fichier généré par scripts/audit-croquis-inventory.mjs — ne pas modifier à la main. -->",
  "",
  "| Provenance | Valeur |",
  "| ---------- | ------ |",
  `| Instant de génération (UTC) | ${rapport.generatedAt} |`,
  `| Empreinte du contenu | \`${rapport.contentDigest}\` |`,
  `| Commit source | \`${rapport.sourceCommit ?? "(indisponible)"}\` |`,
  `| Date du commit source | ${rapport.sourceCommitDate ?? "(indisponible)"} |`,
  `| Entrées mesurées inchangées | ${rapport.measuredInputsClean ? "oui" : "**non — le rapport ne décrit aucun commit**"} |`,
  "",
  "L'instant de génération change à chaque exécution ; **l'empreinte du contenu",
  "ne change que si le contenu change**. Deux rapports de même empreinte disent",
  "exactement la même chose, quelle que soit leur date.",
  "",
  "## Ce que compte ce rapport",
  "",
  "`yamlFilesScanned` compte **tous les fichiers YAML de `content/`**, banque de",
  "questions comprise. Ce n'est ni le nombre de fiches, ni le total employé par",
  "les rapports antérieurs à ce chantier : la répartition `yamlDocumentsByKind`",
  "ci-dessous donne le détail, et une fiche y est définie comme le chargeur la",
  "définit — un YAML placé sous un dossier de module de `modules.json`.",
  "",
  "## Totaux",
  "",
  "| Mesure | Valeur |",
  "| ------ | ------ |",
  ...Object.entries(totaux).map(([clef, valeur]) => `| ${clef} | ${valeur} |`),
  "",
  "## Répartitions",
  "",
  ...Object.entries(repartitions).flatMap(([nom, valeurs]) => [
    `### ${nom}`,
    "",
    "| Clé | Nombre |",
    "| --- | ------ |",
    ...Object.entries(valeurs).map(([clef, valeur]) => `| ${clef} | ${valeur} |`),
    "",
  ]),
  "## Anomalies",
  "",
  ...bloc("Erreurs d'analyse YAML", erreursAnalyse, (e) => `- \`${e.file}\` — ${e.error}`),
  ...bloc(
    "Fichiers portant plusieurs documents YAML (le second serait ignoré en silence)",
    fichiersMultiDocuments,
    (f) => `- \`${f.file}\` — ${f.documents} documents`
  ),
  ...bloc(
    "SVG orphelins (présents sur disque, cités par aucun contenu)",
    orphelins,
    (o) => `- \`${o.schemaId}\` — \`${o.file}\` (${o.bytes} octets)`
  ),
  ...bloc(
    "Références cassées (citées, absentes du disque)",
    referencesCassees,
    (r) => `- \`${r.schemaId}\` — cité par ${r.referencedBy.map((f) => `\`${f}\``).join(", ")}`
  ),
  ...bloc(
    "Figures sans texte alternatif",
    figuresSansAlt,
    (f) => `- \`${f.schemaId}\` — \`${f.file}\``
  ),
  "## Couverture des métadonnées scientifiques",
  "",
  ...bloc(
    "Figures portant le contrat `meta`",
    figuresAvecMeta,
    (f) => `- \`${f.schemaId}\` — \`${f.file}\``
  ),
  ...bloc(
    "Croquis partagés par plusieurs contenus",
    partages,
    (p) => `- \`${p.schemaId}\` — ${p.files.map((f) => `\`${f}\``).join(", ")}`
  ),
  "## Interactions enregistrées",
  "",
  ...interactions.map((id) => `- \`${id}\``),
  "",
].join("\n");

mkdirSync(DOSSIER_RAPPORTS, { recursive: true });
writeFileSync(join(DOSSIER_RAPPORTS, "inventory.json"), `${JSON.stringify(rapport, null, 2)}\n`);
writeFileSync(join(DOSSIER_RAPPORTS, "inventory.md"), md);

console.log(`Inventaire écrit dans reports/croquis/ (commit ${rapport.sourceCommit?.slice(0, 7)})`);
for (const [clef, valeur] of Object.entries(totaux)) console.log(`  ${clef}: ${valeur}`);
if (!rapport.measuredInputsClean)
  console.log("  ⚠ entrées mesurées modifiées — rapport non reproductible");
