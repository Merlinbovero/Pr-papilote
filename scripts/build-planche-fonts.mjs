#!/usr/bin/env node
/**
 * Génération reproductible des fontes du système PLANCHE.
 *
 *   node scripts/build-planche-fonts.mjs [--verify]
 *
 * Découpe Spectral, Fira Sans et Fira Mono depuis leurs sources OFL, en
 * conservant explicitement les fonctionnalités OpenType dont la charte
 * dépend — `smcp` et `c2sc` surtout, que le sous-ensemble webfont servi par
 * Google Fonts ne contient PAS. Sans ce script, les vraies petites capitales
 * dépendraient d'une manipulation manuelle : elles dépendent d'un fichier
 * versionné.
 *
 * Sortie : `src/fonts/planche/*.woff2` (consommés par `next/font/local`) et
 * les licences dans `public/fonts/planche/` (l'OFL exige que la licence
 * accompagne la fonte).
 *
 * `--verify` ne réécrit rien : il recalcule et compare les empreintes, pour
 * qu'une intégration continue puisse constater que les fichiers du dépôt
 * correspondent bien aux sources déclarées.
 *
 * La découpe est **reproductible au bit** : `SOURCE_DATE_EPOCH` fige
 * l'horodatage que fontTools inscrirait sinon dans la table `head`, et deux
 * exécutions rendent donc les mêmes fichiers.
 *
 * Prérequis : Python 3 avec `fonttools` et `brotli`.
 *   pip install fonttools brotli
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const SORTIE = join(RACINE, "src/fonts/planche");
const LICENCES = join(RACINE, "public/fonts/planche");
const BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/";

/** Les fichiers produits, et leur source exacte dans le dépôt google/fonts. */
const FICHIERS = [
  ["spectral/Spectral-Regular.ttf", "spectral-400.woff2"],
  ["spectral/Spectral-SemiBold.ttf", "spectral-600.woff2"],
  ["spectral/Spectral-Italic.ttf", "spectral-400-italic.woff2"],
  ["firasans/FiraSans-Regular.ttf", "fira-sans-400.woff2"],
  ["firasans/FiraSans-Medium.ttf", "fira-sans-500.woff2"],
  ["firasans/FiraSans-SemiBold.ttf", "fira-sans-600.woff2"],
  ["firamono/FiraMono-Regular.ttf", "fira-mono-400.woff2"],
];

const FAMILLES = ["spectral", "firasans", "firamono"];

/**
 * Le jeu de caractères : latin étendu suffisant pour le français (œ, ligatures,
 * guillemets), plus les signes employés par la charte — tiret cadratin,
 * flèches de renvoi, puces de légende.
 */
const UNICODES = [
  "U+0020-007E",
  "U+00A0-00FF",
  "U+0131",
  "U+0152-0153",
  "U+0160-0161",
  "U+0178",
  "U+017D-017E",
  "U+0192",
  "U+02C6",
  "U+02DC",
  "U+2013-2014",
  "U+2018-201A",
  "U+201C-201E",
  "U+2020-2022",
  "U+2026",
  "U+2030",
  "U+2039-203A",
  "U+2044",
  "U+20AC",
  "U+2122",
  "U+2190-2193",
  "U+2212",
  "U+25A0-25CF",
  "U+2713",
].join(",");

/**
 * Les fonctionnalités OpenType conservées. `smcp` et `c2sc` ne sont pas
 * négociables : la charte interdit la synthèse de petites capitales par le
 * navigateur, donc sans elles il n'y a pas de petites capitales du tout.
 */
const FONCTIONNALITES = [
  "ccmp",
  "liga",
  "kern",
  "locl",
  "mark",
  "mkmk",
  "calt",
  "smcp",
  "c2sc",
  "tnum",
  "lnum",
  "onum",
  "pnum",
  "case",
  "frac",
  "numr",
  "dnom",
].join(",");

const PYTHON = `
import io, sys, json, subprocess
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

base, unicodes, features, sortie, fichiers = json.loads(sys.stdin.read())

codes = []
for plage in unicodes.split(","):
    plage = plage[2:]
    if "-" in plage:
        a, b = plage.split("-")
        codes += list(range(int(a, 16), int(b, 16) + 1))
    else:
        codes.append(int(plage, 16))

resultat = {}
for source, nom in fichiers:
    data = subprocess.run(["curl", "-sSL", base + source], capture_output=True).stdout
    if not data:
        raise SystemExit("téléchargement vide : " + source)
    f = TTFont(io.BytesIO(data))
    o = Options()
    o.layout_features = features.split(",")
    o.flavor = "woff2"
    o.desubroutinize = True
    o.notdef_outline = True
    o.name_IDs = ["*"]
    o.name_legacy = True
    s = Subsetter(options=o)
    s.populate(unicodes=codes)
    s.subset(f)
    tampon = io.BytesIO()
    f.flavor = "woff2"
    f.save(tampon)
    octets = tampon.getvalue()
    presentes = set()
    if "GSUB" in f and f["GSUB"].table.FeatureList:
        presentes = {r.FeatureTag for r in f["GSUB"].table.FeatureList.FeatureRecord}
    # Une fonte de lecture sans smcp ne sert à rien ici : on échoue tôt.
    if nom.startswith(("spectral", "fira-sans")) and "smcp" not in presentes:
        raise SystemExit("smcp absent après découpe : " + nom)
    resultat[nom] = [list(octets), sorted(presentes)]

print(json.dumps(resultat))
`;

function empreinte(octets) {
  return createHash("sha256").update(octets).digest("hex").slice(0, 16);
}

const verification = process.argv.includes("--verify");

mkdirSync(SORTIE, { recursive: true });
mkdirSync(LICENCES, { recursive: true });

console.log(verification ? "Vérification des fontes PLANCHE…" : "Génération des fontes PLANCHE…");

const brut = execFileSync("python3", ["-c", PYTHON], {
  input: JSON.stringify([BASE, UNICODES, FONCTIONNALITES, SORTIE, FICHIERS]),
  maxBuffer: 64 * 1024 * 1024,
  encoding: "utf-8",
  // fontTools horodate la table `head` : sans époque fixe, deux exécutions
  // produisent des octets différents et `--verify` ne peut rien affirmer.
  env: { ...process.env, SOURCE_DATE_EPOCH: "1700000000" },
});

const produits = JSON.parse(brut);
let total = 0;
let ecarts = 0;

for (const [, nom] of FICHIERS) {
  const [octetsTableau, fonctionnalites] = produits[nom];
  const octets = Buffer.from(octetsTableau);
  const chemin = join(SORTIE, nom);
  total += octets.length;

  if (verification) {
    if (!existsSync(chemin)) {
      console.error(`  MANQUANT  ${nom}`);
      ecarts += 1;
      continue;
    }
    const actuel = empreinte(readFileSync(chemin));
    const attendu = empreinte(octets);
    if (actuel !== attendu) {
      console.error(`  DIFFÈRE   ${nom}  dépôt ${actuel} ≠ source ${attendu}`);
      ecarts += 1;
    } else {
      console.log(`  conforme  ${nom.padEnd(26)} ${(octets.length / 1024).toFixed(1)} kB`);
    }
  } else {
    writeFileSync(chemin, octets);
    const smcp = fonctionnalites.includes("smcp");
    console.log(
      `  écrit     ${nom.padEnd(26)} ${(octets.length / 1024).toFixed(1)} kB  ` +
        `smcp=${smcp ? "oui" : "non"}  empreinte ${empreinte(octets)}`
    );
  }
}

if (!verification) {
  for (const famille of FAMILLES) {
    const licence = execFileSync("curl", ["-sSL", `${BASE}${famille}/OFL.txt`], {
      maxBuffer: 4 * 1024 * 1024,
    });
    writeFileSync(join(LICENCES, `OFL-${famille}.txt`), licence);
    console.log(`  licence   OFL-${famille}.txt`);
  }
}

console.log(`\nTotal : ${(total / 1024).toFixed(1)} kB de woff2`);

if (verification && ecarts > 0) {
  console.error(`\n${ecarts} fichier(s) ne correspondent pas aux sources déclarées.`);
  process.exit(1);
}
