/**
 * Le sommaire d'une leçon — lot M5.
 *
 * Fonction **pure** : elle décrit ce que la page rend, à partir de ce que la
 * leçon contient. Le sommaire est calculé côté serveur, si bien que ses
 * ancres existent dans le HTML et fonctionnent sans une ligne de JavaScript.
 *
 * L'ordre des entrées est celui du document. Les identifiants sont **stables** :
 * ils servent d'ancres publiques, donc de liens que l'on peut coller ailleurs.
 */
export interface EntreeSommaire {
  /** Ancre — identifiant du titre de section dans le document. */
  id: string;
  /** Libellé affiché, identique au titre de section. */
  libelle: string;
  /** Numéro de paragraphe affiché en marge, quand la section en porte un. */
  numero?: number;
}

export interface SourcesSommaire {
  /** Le cours propose-t-il des étapes obligatoires à valider ? */
  etapes: boolean;
  /** Une interaction est-elle montée ? */
  interaction: boolean;
  /** Un quiz est-il jouable (vivier non vide) ? */
  quiz: boolean;
  /** Le cours a-t-il des exercices guidés ? */
  exercices: boolean;
}

/**
 * Le numéro de paragraphe d'une section, ou `undefined` si elle n'en porte pas.
 *
 * La page **lit ici** le numéro qu'elle affiche en marge, au lieu de le coder
 * en dur : sans quoi le sommaire et le corps pourraient annoncer deux numéros
 * différents pour la même section — et c'est arrivé.
 */
export function numeroDeSection(
  sommaire: readonly EntreeSommaire[],
  id: string
): number | undefined {
  return sommaire.find((e) => e.id === id)?.numero;
}

/**
 * Les sections de la leçon, dans l'ordre où elles apparaissent.
 *
 * Les sections numérotées sont celles du **document** — objectifs, prérequis,
 * fiches, exercices. Les blocs d'activité — étapes, manipulation, quiz —
 * figurent au sommaire mais ne portent pas de numéro de paragraphe : on ne
 * cite pas « le § 5 » pour désigner un quiz.
 */
export function sommaireLecon(sources: SourcesSommaire): EntreeSommaire[] {
  const entrees: EntreeSommaire[] = [];
  let numero = 0;

  const numerotee = (id: string, libelle: string) => {
    numero += 1;
    entrees.push({ id, libelle, numero });
  };

  numerotee("objectifs", "Objectifs");
  // Les prérequis sont toujours rendus : quand il n'y en a pas, la section le
  // dit (« Aucun — c'est le point de départ »). C'est une information, pas un
  // vide, et le sommaire ne doit donc jamais la sauter.
  numerotee("prerequis", "Prérequis");
  numerotee("fiches", "Fiches à étudier");

  if (sources.etapes) {
    entrees.push({ id: "etapes", libelle: "Étapes à valider" });
  }
  if (sources.interaction) {
    entrees.push({ id: "manipuler", libelle: "Manipuler" });
  }
  if (sources.quiz) {
    entrees.push({ id: "se-tester", libelle: "Se tester" });
  }
  if (sources.exercices) {
    numerotee("exercices-titre", "Exercices guidés");
  }
  entrees.push({ id: "essentiel", libelle: "L’essentiel à retenir" });

  return entrees;
}

/**
 * Le sas de sortie : « → N questions portent sur cette leçon ».
 *
 * `n` est le nombre de questions **réellement jouables** — le vivier construit
 * par `buildCoursePool`, pas la liste déclarée : une question citée mais dans
 * un format non jouable ne serait pas au rendez-vous. Rend `null` quand il n'y
 * a rien à proposer : un sas vide est un mensonge poli.
 */
export function sasDeSortie(n: number): string | null {
  if (n <= 0) {
    return null;
  }
  return n === 1 ? "1 question porte sur cette leçon" : `${n} questions portent sur cette leçon`;
}
