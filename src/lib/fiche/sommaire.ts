import type { EntreeSommaire } from "@/lib/lecon/sommaire";

/**
 * Le sommaire d'une notice technique — lot M6b.
 *
 * Fonction **pure**, calquée sur `sommaireLecon` : elle décrit ce que la page
 * rend, à partir de ce que la notice contient. Le sommaire est calculé au
 * serveur, donc ses ancres existent dans le HTML et fonctionnent sans une
 * ligne de JavaScript.
 *
 * **Les identifiants sont ceux du gabarit historique** — `l-essentiel`,
 * l'identifiant déclaré de chaque section, `pieges`, `documents`, `sources`,
 * `s-entrainer`. Ce ne sont pas des détails d'implémentation : ce sont des
 * ancres publiques, que l'on colle dans un message ou un cahier. Une migration
 * graphique n'a pas le droit de les casser. Seule `signaletique` est nouvelle :
 * le bloc de spécifications n'en portait aucune. Son nom évite volontairement
 * `caracteristiques`, que quatre fiches du corpus rédigent déjà comme section —
 * deux éléments ne peuvent pas porter le même identifiant. `ANCRES_RESERVEES`
 * énumère ce que le gabarit s'attribue ; un test de corpus vérifie qu'aucune
 * notice ne le contredit.
 */

/**
 * Les identifiants que les gabarits de fiche posent eux-mêmes, toutes familles
 * confondues. Un test de corpus vérifie qu'aucune fiche migrée ne rédige une
 * section portant l'un d'eux.
 */
export const ANCRES_RESERVEES = [
  "l-essentiel",
  "signaletique",
  "pieges",
  "documents",
  "s-entrainer",
  "sources",
  "sommaire",
  // Lot M7b — la section obligatoire de La Situation.
  "ce-qui-reste-incertain",
] as const;

export interface SourcesSommaireNotice {
  /** Identifiants et titres des sections rédigées, dans l'ordre du document. */
  sections: readonly { id: string; title: string }[];
  /** La notice porte-t-elle un tableau de caractéristiques ? */
  caracteristiques: boolean;
  /** La notice porte-t-elle des pièges ? */
  pieges: boolean;
  /** Des documents publics lui sont-ils rattachés ? */
  documents: boolean;
  /** Un quiz est-il jouable (vivier non vide) ? */
  quiz: boolean;
}

export function sommaireNotice(sources: SourcesSommaireNotice): EntreeSommaire[] {
  const entrees: EntreeSommaire[] = [];
  let numero = 0;

  const numerotee = (id: string, libelle: string) => {
    numero += 1;
    entrees.push({ id, libelle, numero });
  };

  numerotee("l-essentiel", "L’essentiel");
  for (const section of sources.sections) {
    numerotee(section.id, section.title);
  }
  if (sources.caracteristiques) {
    numerotee("signaletique", "Fiche signalétique");
  }
  if (sources.pieges) {
    numerotee("pieges", "Pièges fréquents");
  }
  if (sources.documents) {
    numerotee("documents", "Documents");
  }
  // Se tester est un bloc d'activité, pas un paragraphe du document : on ne
  // cite pas « le § 7 » pour désigner un quiz. Même règle que dans La Leçon.
  if (sources.quiz) {
    entrees.push({ id: "s-entrainer", libelle: "Se tester" });
  }
  numerotee("sources", "Sources");

  return entrees;
}

/**
 * Le sommaire d'un article du Cahier — lot M7b.
 *
 * Le Cahier n'a ni fiche signalétique ni documents : c'est un récit, pas une
 * notice. Son plan est donc plus court, et ses ancres sont exactement celles du
 * gabarit historique — `l-essentiel`, les sections rédigées, `pieges`,
 * `sources`. Aucune n'est inventée pour la circonstance.
 */
export interface SourcesSommaireCahier {
  sections: readonly { id: string; title: string }[];
  pieges: boolean;
  quiz: boolean;
}

export function sommaireCahier(sources: SourcesSommaireCahier): EntreeSommaire[] {
  const entrees: EntreeSommaire[] = [];
  let numero = 0;
  const numerotee = (id: string, libelle: string) => {
    numero += 1;
    entrees.push({ id, libelle, numero });
  };

  numerotee("l-essentiel", "L’essentiel");
  for (const section of sources.sections) {
    numerotee(section.id, section.title);
  }
  if (sources.pieges) {
    numerotee("pieges", "Pièges fréquents");
  }
  if (sources.quiz) {
    entrees.push({ id: "s-entrainer", libelle: "Se tester" });
  }
  numerotee("sources", "Sources");
  return entrees;
}

/**
 * Le sommaire d'une situation — lot M7b.
 *
 * **`ce-qui-reste-incertain` est toujours présent**, quel que soit le contenu.
 * C'est la seule entrée du système qu'une fiche ne peut pas faire disparaître :
 * la famille La Situation doit énoncer ce que ses sources ne permettent pas de
 * trancher (docs/design-archetypes.md, archétype V). Une situation qui ne
 * documente aucune incertitude le dit ; elle ne se tait pas.
 */
export interface SourcesSommaireSituation {
  sections: readonly { id: string; title: string }[];
  pieges: boolean;
  quiz: boolean;
}

export function sommaireSituation(sources: SourcesSommaireSituation): EntreeSommaire[] {
  const entrees: EntreeSommaire[] = [];
  let numero = 0;
  const numerotee = (id: string, libelle: string) => {
    numero += 1;
    entrees.push({ id, libelle, numero });
  };

  numerotee("l-essentiel", "L’essentiel");
  for (const section of sources.sections) {
    numerotee(section.id, section.title);
  }
  numerotee("ce-qui-reste-incertain", "Ce qui reste incertain");
  if (sources.pieges) {
    numerotee("pieges", "Pièges fréquents");
  }
  if (sources.quiz) {
    entrees.push({ id: "s-entrainer", libelle: "Se tester" });
  }
  numerotee("sources", "Sources");
  return entrees;
}
