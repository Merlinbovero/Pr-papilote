# Les cours — architecture pédagogique

> Système permettant de composer des **parcours pédagogiques** (14 cours issus du guide « Mécanique du Vol », puis météo, navigation, aéronefs, histoire, anglais…) **sans dupliquer** le contenu entre les Fondamentaux et le BIA. Introduit au Lot 2B.

## Principe : un objet canonique, plusieurs parcours

Un **cours** (`content/cours/**/*.yaml`, schéma `src/lib/content/cours-schema.ts`) est une **séquence pédagogique** qui **ne contient aucun texte de fiche** : il ne fait que **référencer** des objets canoniques déjà existants — fiches, termes, exercices, questions, interactions.

Le même cours est donc consultable depuis :

- **les Fondamentaux** — sa catégorie scientifique (`categorieFondamentaux`), via `/{module}/{categorie}` ;
- **le parcours BIA** — sa matière officielle (`matiereBia`), via `/bia/{matiere}` ;
- (plus tard) d'éventuels parcours EOPAN/EOPN/ALAT.

C'est le **même identifiant canonique** (`cours.<slug>`) partout : la progression n'en connaît qu'un, quel que soit le point d'entrée. On étend le modèle déjà appliqué aux fiches (projection BIA par référence, `src/lib/bia/schema.ts`) — **jamais de copie**.

## Métadonnées d'un cours

`id`, `slug`, `title`, `description`, `module`, `categorieFondamentaux`, `matiereBia`, `objectifs`, `prerequisites` (cours), `ordre` (unique par matière), `niveau` (1–3), `dureeEstimeeMin`, `pdfPages` (traçabilité), `competencies`, puis les **références** : `fiches`, `termes`, `exercices`, `questions`, `interactions` ; la `sequence` pédagogique ordonnée (étapes `obligatoire`s ou non), le `resumeRevision` (fiche de révision du cours), `sources`, `status`, dates et `revisions`.

## Intégrité référentielle (build)

Le chargeur `src/lib/content/cours.ts` **fait échouer le build** si : une fiche / question / terme / exercice / interaction / prérequis référencé n'existe pas ; deux cours partagent un identifiant, ou un même ordre dans une matière ; une page PDF sort de l'intervalle valide ; un cours publié n'a aucune source ou aucune question ; une étape de séquence pointe vers une référence non déclarée. Couvert par `cours.test.ts`.

## Page de cours

`/cours/{slug}` (`src/app/cours/[slug]/page.tsx`) — ce n'est pas « une fiche plus longue » : titre + matière, objectifs, prérequis, durée/niveau, **fiches à étudier** (liens), **interaction**, **quiz du cours**, **exercices guidés**, **fiche de révision**, **sources**, et une **navigation** (précédent/suivant dans la matière, retour Fondamentaux, retour BIA). Les parties interactives (progression, interaction, quiz) sont portées par `CourseExperience` (client).

## Progression (règle V1)

Fonction pure `deriveCourseStatus` (`src/lib/progression/cours.ts`), documentée et stable — pas de bouton arbitraire « terminé ». Le statut est **dérivé** :

| Statut       | Condition                                                       |
| ------------ | --------------------------------------------------------------- |
| non-commencé | cours jamais ouvert                                             |
| découverte   | page ouverte                                                    |
| en cours     | au moins une étape consultée                                    |
| étudié       | toutes les étapes **obligatoires** consultées                   |
| maîtrisé     | quiz réussi ≥ seuil (80 %) **et** aucune erreur active critique |

Stockage local sous la clé canonique `cours:<id>` (forme prête pour Supabase). Ouvrir le cours depuis les Fondamentaux ou depuis le BIA écrit la **même** progression.

## Interactions

Framework commun léger `src/features/interactions/` : `Interactive` (conteneur : titre, consigne, zone, légende, réinitialisation, **alternative textuelle** `aria-live` + `<details>`, indication clavier), un `registry` d'identifiants (source de vérité pour la validation des cours) et un `InteractionSlot` (id → composant). Première interaction : **`forces-et-vecteurs`** (afficher/masquer les quatre forces, basculer équilibre/accélération, lire la résultante) — modèle pur testé (`forces-model.ts`), commandes natives donc utilisables au clavier.

## Exercices

`content/exercices/**/*.yaml` (schéma `exerciceSchema`) : consigne, données, méthode, correction, **interprétation aéronautique**, notion liée (fiche). Référencés par les cours, rendus sur la page de cours.

## Dette / suites

- Statut de cours affiché dans le tableau de bord global de progression (aujourd'hui local à la page de cours).
- Synchronisation Supabase de la progression de cours (schéma déjà compatible).
- Interactions suivantes (Venturi, polaire, incidence/décrochage, axes/gouvernes, centrage) — Lots 3+.
