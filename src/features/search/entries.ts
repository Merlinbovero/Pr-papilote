import { getFiches, getFicheHref, getTermes } from "@/lib/content/fiches";
import { getCategories, getCategory, getModule, getModules } from "@/lib/content/referentials";
import { normalizeText } from "./normalize";
import type { SearchEntry } from "./types";

/**
 * Indexeur du moteur de recherche : chaque objet documentaire produit
 * une entrée normalisée au build, sans être modifié. Le résultat est
 * mémoïsé (une seule construction par build).
 */

type SearchEntryInput = Omit<SearchEntry, "norm" | "aliases" | "keywords" | "priority"> &
  Partial<Pick<SearchEntry, "aliases" | "keywords" | "priority">>;

/** Fabrique une entrée d'index avec ses champs pré-normalisés. */
export function createSearchEntry(input: SearchEntryInput): SearchEntry {
  const aliases = input.aliases ?? [];
  const keywords = input.keywords ?? [];
  return {
    ...input,
    aliases,
    keywords,
    priority: input.priority ?? 0,
    norm: {
      title: normalizeText(input.title),
      aliases: aliases.map(normalizeText),
      keywords: keywords.map(normalizeText).filter(Boolean),
      summary: normalizeText(input.summary ?? ""),
    },
  };
}

/**
 * Outils interactifs et pages-destinations qui ne sont ni des fiches ni des
 * catégories, mais que l'on doit pouvoir retrouver par la recherche (« SECPIL »,
 * « révision », « examen blanc »…). Liste éditoriale courte et curée.
 */
const OUTILS: SearchEntryInput[] = [
  {
    id: "outil.secpil",
    type: "outil",
    family: "simulateur",
    title: "Simulateur SECPIL",
    summary:
      "Entraîneur psychomoteur : suivi au manche (souris) et au palonnier (flèches), puis calcul mental, en attention partagée.",
    moduleName: "Psychotechnique",
    moduleSlug: "psychotechnique",
    url: "/psychotechnique/secpil",
    aliases: [
      "SECPIL",
      "manche",
      "palonnier",
      "psychomoteur",
      "coordination",
      "tracking",
      "double tâche",
    ],
    priority: 3,
  },
  {
    id: "outil.psychotechnique-entrainement",
    type: "outil",
    family: "chrono",
    title: "Entraînement psychotechnique",
    summary:
      "Sessions chronométrées générées à l'infini : calcul, suites, mémoire, attention, orientation, dominos, matrices…",
    moduleName: "Psychotechnique",
    moduleSlug: "psychotechnique",
    url: "/psychotechnique/entrainement",
    aliases: [
      "entraînement",
      "psychotechnique",
      "tests psychotechniques",
      "calcul mental",
      "chronométré",
    ],
    priority: 2,
  },
  {
    id: "outil.revision",
    type: "outil",
    family: "revision",
    title: "Révision espacée",
    summary:
      "Revoyez au bon moment (méthode de Leitner) : les questions ratées reviennent vite, les acquises s'espacent.",
    moduleName: "Réviser",
    moduleSlug: "fondamentaux",
    url: "/reviser",
    aliases: [
      "révision",
      "réviser",
      "Leitner",
      "à revoir",
      "répétition espacée",
      "spaced repetition",
    ],
    priority: 2,
  },
  {
    id: "outil.bia-examen-blanc",
    type: "outil",
    family: "examen",
    title: "Examen blanc BIA",
    summary: "Épreuve complète du Brevet d'Initiation Aéronautique, chronométrée et corrigée.",
    moduleName: "BIA",
    moduleSlug: "fondamentaux",
    url: "/bia/examen-blanc",
    aliases: ["examen blanc", "BIA", "brevet initiation aéronautique", "examen", "épreuve"],
    priority: 2,
  },
  {
    id: "outil.anglais",
    type: "outil",
    family: "anglais",
    title: "Anglais aéronautique",
    summary: "Alphabet OACI, épeleur, vocabulaire bilingue et entraîneur de phonétique.",
    moduleName: "Anglais",
    moduleSlug: "fondamentaux",
    url: "/anglais",
    aliases: [
      "anglais",
      "anglais aéronautique",
      "OACI",
      "alphabet",
      "phonétique",
      "aviation english",
    ],
    priority: 2,
  },
  {
    id: "outil.cartes",
    type: "outil",
    family: "carte",
    title: "Cartes des bases",
    summary:
      "Implantations des trois armées : bases aériennes, aéronavales et régiments de l'ALAT.",
    moduleName: "Cartes",
    moduleSlug: "fondamentaux",
    url: "/cartes",
    aliases: [
      "cartes",
      "bases",
      "implantations",
      "base aérienne",
      "BAN",
      "régiments",
      "géographie",
    ],
    priority: 1,
  },
  {
    id: "outil.dictionnaire",
    type: "outil",
    family: "lexique",
    title: "Dictionnaire",
    summary: "Toutes les définitions et sigles du domaine aéronautique et militaire.",
    moduleName: "Dictionnaire",
    moduleSlug: "fondamentaux",
    url: "/dictionnaire",
    aliases: ["dictionnaire", "définitions", "lexique", "glossaire", "sigles", "vocabulaire"],
    priority: 1,
  },
];

let entriesCache: SearchEntry[] | undefined;

export function buildSearchEntries(): SearchEntry[] {
  if (entriesCache) {
    return entriesCache;
  }
  const entries: SearchEntry[] = [];

  for (const mod of getModules()) {
    entries.push(
      createSearchEntry({
        id: mod.id,
        type: "module",
        title: mod.fullName ? `${mod.name} — ${mod.fullName}` : mod.name,
        summary: mod.description,
        moduleName: mod.name,
        moduleSlug: mod.slug,
        url: `/${mod.slug}`,
        aliases: [mod.name, mod.fullName ?? "", mod.organization ?? ""].filter(Boolean),
      })
    );

    for (const category of getCategories(mod.slug)) {
      entries.push(
        createSearchEntry({
          id: `${mod.id}.${category.slug}`,
          type: "categorie",
          title: `${category.name} — ${mod.name}`,
          moduleName: mod.name,
          moduleSlug: mod.slug,
          url: `/${mod.slug}/${category.slug}`,
          aliases: [category.name],
        })
      );
    }
  }

  for (const fiche of getFiches()) {
    const mod = getModule(fiche.module);
    entries.push(
      createSearchEntry({
        id: fiche.id,
        type: "fiche",
        family: fiche.type,
        title: fiche.title,
        summary: fiche.summary,
        moduleName: mod?.name ?? fiche.module,
        moduleSlug: fiche.module,
        categoryName: getCategory(fiche.module, fiche.category)?.name,
        url: getFicheHref(fiche),
        aliases: fiche.aliases,
        keywords: fiche.tags,
        priority: fiche.searchPriority,
      })
    );
  }

  for (const outil of OUTILS) {
    entries.push(createSearchEntry(outil));
  }

  for (const terme of getTermes()) {
    entries.push(
      createSearchEntry({
        id: terme.id,
        type: "terme",
        family: "terme",
        title: terme.title,
        summary: terme.definition,
        moduleName: "Dictionnaire",
        moduleSlug: "fondamentaux",
        categoryName: "Dictionnaire",
        url: `/dictionnaire/${terme.id.replace(/^terme\./, "")}`,
        aliases: [terme.sigleExpansion ?? "", ...terme.synonyms].filter(Boolean),
      })
    );
  }

  entriesCache = entries;
  return entries;
}
