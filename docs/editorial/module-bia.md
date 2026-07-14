# Module BIA — architecture consignée

Consigné le 2026-07-14 (phase 2 du plan V1). Le BIA n'est pas une catégorie
isolée : c'est un **parcours** qui réutilise les fiches des Fondamentaux et
la banque de questions existante, avec un moteur d'examen blanc dédié.

## Principe directeur

Aucune duplication de contenu. Le module BIA est une **projection** de la
bibliothèque existante sur le programme officiel du BIA (arrêté du
19 février 2015 modifié) :

- une **matière BIA** = un sous-ensemble de fiches Fondamentaux, défini par
  le référentiel `content/_referentiels/bia.json` (mapping par catégories +
  surcharges fiche à fiche) ;
- une **question BIA** = une question de la banque dont la fiche évaluée
  appartient à une matière (aucun re-étiquetage des 759 questions) ;
- le contenu militaire hors programme BIA est **exclu explicitement**
  (listes `horsParcours` / `horsExamen` du référentiel).

## Les matières (programme officiel → catégories)

| Matière (ordre officiel)                               | Catégories fondamentaux                                                          | Surcharges                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1. Météorologie et aérologie                           | meteorologie                                                                     | —                                                                 |
| 2. Aérodynamique, aérostatique et principes du vol     | aerodynamique, mecanique-du-vol, physique                                        | la-propulsion et le-vol-de-l-helicoptere → matière 3              |
| 3. Étude des aéronefs et engins spatiaux               | instruments                                                                      | + la-propulsion, le-vol-de-l-helicoptere, la-conquete-de-l-espace |
| 4. Navigation, réglementation, sécurité des vols       | navigation, cartographie, reglementation, radio-communications, facteurs-humains | —                                                                 |
| 5. Histoire et culture de l'aéronautique et du spatial | culture-aeronautique                                                             | la-conquete-de-l-espace → matière 3                               |
| Épreuve facultative d'anglais                          | anglais-aeronautique                                                             | fiches militaires exclues                                         |

Exclusions consignées dans le référentiel :

- `horsParcours` (n'apparaissent pas dans l'espace BIA) — contenu
  spécifiquement militaire : aptitude médicale CEMPN, anglais des
  sélections, anglais militaire/OTAN, brevity code ;
- `horsExamen` (visibles dans le parcours, jamais tirées à l'examen) —
  fiches « méthode » ou méta : la fiche BIA elle-même, l'étude de cas
  BEA-É, la méthode de compréhension écrite.

## Le moteur d'examen blanc (`src/lib/bia/`)

Fonctions **pures**, réutilisant le moteur pédagogique existant
(`src/features/quiz/engine.ts` — tirage pondéré par historique, mélange
déterministe par graine, `isCorrect` par format) :

- `resolveBiaMatiere(fiche, config)` — projection fiche → matière ;
- `buildBiaPools(questions, fiches, config)` — les viviers par matière
  (une question suit sa première fiche évaluée) ;
- `composeBiaExam({ pools, config, seed, history })` — un examen de
  **100 questions** : 20 par matière (configurable), réparties par bandes
  de difficulté (~40 % faciles, 40 % moyennes, 20 % difficiles, avec
  repli si une bande manque), **sans doublon**, questions jamais vues
  d'abord (renouvellement entre deux examens), groupées par matière dans
  l'ordre officiel. Les pénuries éventuelles sont **retournées, pas
  masquées** (`shortages`) ;
- `gradeBiaExam(exam, answers)` — correction : note **sur 20 par
  matière** (proportionnelle), note globale = moyenne des cinq matières,
  **admission à 10/20**, mentions AB (12) / B (14) / TB (16) comme au vrai
  BIA ; questions ratées et sans réponse listées pour le carnet d'erreurs.

Le chronométrage de référence est celui de l'épreuve réelle — **2 h 30**
(9 000 s) pour l'écrit obligatoire.

## Les routes (`/bia`)

- `/bia` — accueil du parcours : présentation, les 5 matières avec leur
  progression, accès à l'examen blanc et au carnet d'erreurs ;
- `/bia/[matiere]` — une matière : ses fiches (dans l'ordre pédagogique),
  sa progression, son quiz thématique ;
- `/bia/examen-blanc` — l'examen : démarrage clair (consignes, durée),
  navigation entre questions, **marquage pour y revenir**, progression
  visible, chronomètre global, validation finale ; puis correction
  détaillée (réponse, explication, lien fiche), score global et par
  matière, temps passé, synthèse forces/faiblesses ;
- persistance — tentatives enregistrées via l'infrastructure existante
  (Supabase `question_attempts` si connecté ; sinon session locale, avec
  l'invitation à se connecter déjà en place dans le player).

Toutes les pages sont des compositions de composants du catalogue
(règle 10) ; le moteur vit dans `src/lib/bia`, les pages n'ont presque
aucune logique. Responsive mobile-first, navigation clavier, thèmes clair
et sombre — comme le reste du site.

## Audit de la banque (phase B4)

Avant d'ouvrir l'examen blanc : mesurer par matière le vivier réel
(questions éligibles, répartition de difficulté), lister les matières
sous-dotées, compléter la banque si nécessaire (les questions BIA sont des
questions normales de la banque — pas de silo), et exclure nommément les
questions inadaptées via les fiches `horsExamen`.
