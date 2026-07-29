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

/** Les identifiants que le gabarit de notice pose lui-même. */
export const ANCRES_RESERVEES = [
  "l-essentiel",
  "signaletique",
  "pieges",
  "documents",
  "s-entrainer",
  "sources",
  "sommaire",
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
