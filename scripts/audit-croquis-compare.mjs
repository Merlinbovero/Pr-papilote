#!/usr/bin/env node
/**
 * Comparaison relecture humaine ↔ classifieur — lot C1, mesure de C2.
 *
 * ── Ce que ce script mesure ────────────────────────────────────────────────
 * L'écart entre ce qu'un relecteur a écrit dans la grille et ce que le
 * classifieur lexical avait prédit. Rien d'autre. En particulier, **il ne dit
 * pas qui a raison** : quand les deux divergent, c'est presque toujours la
 * machine qui se trompe, mais l'inverse existe et le rapport se contente
 * d'exposer la divergence.
 *
 * ── Pourquoi il refuse de conclure sur une grille vide ─────────────────────
 * Une grille non remplie ne produit pas « 0 % d'accord » : elle produit un
 * rapport disant qu'il n'y a rien à comparer, avec des listes vides générées.
 * Un taux calculé sur zéro relecture serait un chiffre inventé — le défaut
 * même que ce chantier corrige.
 *
 * Usage : node scripts/audit-croquis-compare.mjs [chemin/vers/grille-remplie.yaml]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const RACINE = resolve(import.meta.dirname, "..");
const DOSSIER = join(RACINE, "reports", "croquis", "validation-humaine");
const PREDICTIONS = join(DOSSIER, "predictions-machine.json");
const GRILLE_PAR_DEFAUT = join(DOSSIER, "grille-remplie.yaml");

const cheminGrille = process.argv[2] ? resolve(process.argv[2]) : GRILLE_PAR_DEFAUT;

if (!existsSync(PREDICTIONS)) {
  console.error("predictions-machine.json absent — lancer d'abord `npm run croquis:sample`.");
  process.exit(1);
}

const predictionsFichier = JSON.parse(readFileSync(PREDICTIONS, "utf8"));
const predictionParSchema = new Map(predictionsFichier.predictions.map((p) => [p.schemaId, p]));

// ---------------------------------------------------------------------------
// Lecture de la grille
// ---------------------------------------------------------------------------

const grilleExiste = existsSync(cheminGrille);
let grille = null;
let erreurGrille = null;

if (grilleExiste) {
  try {
    grille = parseYaml(readFileSync(cheminGrille, "utf8"));
  } catch (erreur) {
    erreurGrille = String(erreur.message ?? erreur).split("\n")[0];
  }
}

const rempli = (valeur) => typeof valeur === "string" && valeur.trim() !== "";

/** N'est relu que ce qui porte au moins un champ renseigné. */
const relectures = (grille?.diagrams ?? []).filter(
  (d) =>
    rempli(d?.family) || rempli(d?.function) || rempli(d?.level) || rempli(d?.scientificallyCorrect)
);

// ---------------------------------------------------------------------------
// Comparaison
// ---------------------------------------------------------------------------

const CHAMPS_COMPARES = [
  ["family", "predictedFamily"],
  ["function", "predictedFunction"],
];

const accords = Object.fromEntries(
  CHAMPS_COMPARES.map(([champ]) => [champ, { compared: 0, agreed: 0, machineSilent: 0 }])
);
const divergences = [];
const horsEchantillon = [];

for (const relecture of relectures) {
  const prediction = predictionParSchema.get(relecture.schemaId);
  if (!prediction) {
    horsEchantillon.push(relecture.schemaId);
    continue;
  }
  for (const [champHumain, champMachine] of CHAMPS_COMPARES) {
    const humain = rempli(relecture[champHumain]) ? relecture[champHumain].trim() : null;
    if (humain === null) continue;
    const machine = prediction[champMachine];
    if (machine === null) {
      accords[champHumain].machineSilent += 1;
      continue;
    }
    accords[champHumain].compared += 1;
    if (machine === humain) accords[champHumain].agreed += 1;
    else
      divergences.push({
        schemaId: relecture.schemaId,
        field: champHumain,
        human: humain,
        machine,
      });
  }
}

divergences.sort(
  (a, b) => a.schemaId.localeCompare(b.schemaId, "en") || a.field.localeCompare(b.field, "en")
);

/** La file de travail de C2 : ce que la relecture n'a pas validé. */
const aCorriger = relectures
  .filter((d) => rempli(d.scientificallyCorrect) && d.scientificallyCorrect.trim() !== "oui")
  .map((d) => ({
    schemaId: d.schemaId,
    verdict: d.scientificallyCorrect.trim(),
    notes: rempli(d.notes) ? d.notes.trim() : null,
  }))
  .sort((a, b) => a.schemaId.localeCompare(b.schemaId, "en"));

const nonRelus = predictionsFichier.predictions
  .map((p) => p.schemaId)
  .filter((id) => !relectures.some((r) => r.schemaId === id))
  .sort((a, b) => a.localeCompare(b, "en"));

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

const rapport = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generator: "scripts/audit-croquis-compare.mjs",
  gridPath: relative(RACINE, cheminGrille),
  gridPresent: grilleExiste,
  gridParseError: erreurGrille,
  reviewer: rempli(grille?.reviewer) ? grille.reviewer : null,
  reviewedAt: rempli(grille?.reviewedAt) ? grille.reviewedAt : null,
  sampleSize: predictionsFichier.predictions.length,
  reviewedCount: relectures.length,
  agreement: accords,
  divergences,
  toFix: aCorriger,
  notReviewed: nonRelus,
  outOfSample: horsEchantillon.sort((a, b) => a.localeCompare(b, "en")),
};

/** Une liste vide s'écrit comme une liste vide — jamais comme une phrase. */
function bloc(titre, elements, rendu) {
  const lignes = [`### ${titre} (${elements.length})`, ""];
  if (elements.length === 0) lignes.push("_(liste vide)_", "");
  else lignes.push(...elements.map(rendu), "");
  return lignes;
}

const md = [
  "# Comparaison relecture humaine ↔ classifieur lexical",
  "",
  "<!-- Fichier généré par scripts/audit-croquis-compare.mjs — ne pas modifier à la main. -->",
  "",
  "| Provenance | Valeur |",
  "| ---------- | ------ |",
  `| Date de génération (UTC, jour) | ${rapport.generatedAt} |`,
  `| Grille lue | \`${rapport.gridPath}\` |`,
  `| Grille présente | ${rapport.gridPresent ? "oui" : "**non**"} |`,
  `| Erreur d'analyse | ${rapport.gridParseError ?? "aucune"} |`,
  `| Relecteur | ${rapport.reviewer ?? "(non renseigné)"} |`,
  `| Date de relecture | ${rapport.reviewedAt ?? "(non renseignée)"} |`,
  `| Croquis de l'échantillon | ${rapport.sampleSize} |`,
  `| Croquis relus | ${rapport.reviewedCount} |`,
  "",
];

if (relectures.length === 0) {
  md.push(
    "## Aucun taux d'accord",
    "",
    "La grille ne contient aucune relecture. **Aucun pourcentage n'est calculé** :",
    "un taux mesuré sur zéro relecture ne serait pas un résultat faible, ce serait",
    "un chiffre inventé.",
    "",
    "Pour produire une comparaison : remplir",
    "`reports/croquis/validation-humaine/grille-vierge.yaml`, l'enregistrer sous",
    "`grille-remplie.yaml`, puis relancer `npm run croquis:compare`.",
    ""
  );
} else {
  md.push(
    "## Accord par champ",
    "",
    "| Champ | Comparés | Accords | Machine muette |",
    "| ----- | -------- | ------- | -------------- |",
    ...Object.entries(accords).map(
      ([champ, v]) => `| ${champ} | ${v.compared} | ${v.agreed} | ${v.machineSilent} |`
    ),
    "",
    "Le taux se lit sur ces nombres. Il n'est pas recopié ici : un pourcentage",
    "écrit à la main est exactement ce que ce chantier a cessé de faire.",
    ""
  );
}

md.push(
  "## Détail",
  "",
  ...bloc(
    "Divergences humain / machine",
    divergences,
    (d) => `- \`${d.schemaId}\` — ${d.field} : humain **${d.human}**, machine **${d.machine}**`
  ),
  ...bloc(
    "Croquis non validés par la relecture (file de travail C2)",
    aCorriger,
    (d) => `- \`${d.schemaId}\` — ${d.verdict}${d.notes ? ` — ${d.notes}` : ""}`
  ),
  ...bloc("Croquis de l'échantillon non relus", nonRelus, (id) => `- \`${id}\``),
  ...bloc(
    "Entrées de la grille hors échantillon",
    rapport.outOfSample,
    (id) => `- \`${id}\` — absent des prédictions, non comparable`
  )
);

writeFileSync(join(DOSSIER, "comparaison.json"), `${JSON.stringify(rapport, null, 2)}\n`);
writeFileSync(join(DOSSIER, "comparaison.md"), md.join("\n"));

console.log(`Comparaison écrite (grille ${grilleExiste ? "présente" : "absente"}).`);
console.log(`  croquis relus : ${rapport.reviewedCount} / ${rapport.sampleSize}`);
for (const [champ, v] of Object.entries(accords)) {
  console.log(`  ${champ} : ${v.agreed} accords sur ${v.compared} comparés`);
}
