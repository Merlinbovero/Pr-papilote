# Module psychotechnique — socle V1 consigné

Consigné le 2026-07-14 (phase 3 du plan V1). Objectif : un **moteur
d'entraînement génératif**, robuste et extensible — pas la reproduction de
batteries commerciales.

## Règles de propriété intellectuelle

Aucun exercice n'est copié d'une batterie existante. Chaque famille est
**générée par des règles propres**, documentées ci-dessous, à partir de
compétences générales (arithmétique, logique sérielle, mémoire de travail,
attention sélective, repérage spatial). Les énoncés sont produits par un
générateur **déterministe par graine** (PRNG mulberry32 du moteur quiz) —
rejouable, testable, et infini.

## Les familles (10)

| Famille             | Règle de génération                                                                                                                                                   | Difficulté 1 → 3                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `calcul-mental`     | opérations élémentaires puis conversions aéronautiques (temps, kt↔km/h, consommation) ; distracteurs = erreurs typiques (±10, chiffres transposés, ±1 sur la retenue) | additions/soustractions → multiplications/divisions exactes → conversions et problèmes à deux étapes |
| `suites-numeriques` | suites arithmétiques, géométriques, alternées, carrés ; question = terme suivant                                                                                      | raison simple → alternances → deux suites entrelacées                                                |
| `series-logiques`   | séries de lettres sur l'alphabet (pas constants, alternés, doubles)                                                                                                   | pas +1/+2 → alternances → groupes de lettres à double règle                                          |
| `memoire`           | exposition chronométrée d'une liste (chiffres, lettres, mots du domaine), puis question de restitution (position, occurrence, présence)                               | 5 éléments/4 s → 7 éléments/4 s → 8 éléments/3 s                                                     |
| `attention`         | grille de caractères visuellement proches (b/d/p/q, 6/9, O/0) ; compter les occurrences de la cible, temps serré                                                      | grille 4×8 → 5×10 → 6×12                                                                             |
| `orientation`       | caps et virages (cap initial + virage gauche/droite de N° → nouveau cap ; sens du virage le plus court ; cap réciproque) — arithmétique modulo 360                    | virages de 90° → virages quelconques → réciproques et cumuls                                         |
| `rapidite`          | deux chaînes type immatriculation/indicatif — identiques ou différentes ? temps très court                                                                            | chaînes courtes, différence franche → chaînes longues, différence d'un caractère ambigu              |
| `dominos`           | série de dominos `[haut\|bas]` ; chaque moitié suit sa propre progression arithmétique modulo 7 (le blanc vaut 0 et suit le 6) ; question = domino manquant           | deux progressions positives → une descendante avec bouclage → haut entrelacé (deux pas alternés)     |
| `rotation-mentale`  | motif de flèches (8 directions) à faire pivoter de 90°/180° ; distracteurs = mauvais sens, mauvais angle, motif non tourné                                            | une flèche, 90°/180° → deux flèches, 90° → trois flèches, 90°/180°/270°                              |
| `double-tache`      | attention partagée : retenir la nature d'une lettre (voyelle/consonne) puis appliquer le calcul de cap qu'elle commande (réciproque ou +angle)                        | angle de 90° → angles quelconques → (idem, indices plus longs)                                       |

La famille « lecture d'instruments » (cadrans graphiques) est **reportée** — la
fiche de méthode existe, le générateur graphique viendra avec les SVG dédiés.
Un **4ᵉ niveau de difficulté** homogène est également à l'étude (le contrat
reste à 3 niveaux pour l'instant).

## Le moteur (`src/lib/psychotech/`)

Fonctions pures, format unique :

- chaque générateur produit une `PsyQuestion` : énoncé (+ éventuelle
  **phase d'exposition** chronométrée pour la mémoire, + grille monospace
  pour l'attention), **4 choix** (QCM strict), index de la bonne réponse,
  **explication de méthode**, difficulté, **temps limite par question**
  propre à la famille ;
- `composeSession({ families, size, seed })` — tirage équilibré entre les
  familles demandées, **difficulté progressive** (la session monte en
  difficulté par tiers), identifiants uniques ;
- tailles normalisées : courte (10), standard (20), longue (40),
  personnalisée (familles + taille au choix) ;
- `scoreSession(events)` — score brut, **précision** (justes/répondues),
  **vitesse** (temps moyen par question), détail par famille, familles
  fragiles (précision < 60 %) pour l'**entraînement ciblé** ;
- historique local (localStorage, même approche que l'examen BIA) : les
  20 dernières sessions, avec précision/vitesse par famille.

## Les routes

- `/psychotechnique/entrainement` — le hub : choix de la session (courte,
  standard, longue, personnalisée), consignes standardisées par famille,
  historique et familles à retravailler ;
- le player (client) : chronomètre par question, phase d'exposition pour
  la mémoire, correction immédiate ou en fin de session selon le mode,
  explication de méthode, renvoi vers la fiche de la famille.

Chaque famille est reliée à sa fiche méthodologique existante
(psychotechnique/exercices) — le moteur entraîne, la fiche enseigne.
