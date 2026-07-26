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

## Les familles (19)

| Famille                  | Règle de génération                                                                                                                                                                                                         | Difficulté 1 → 3                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `calcul-mental`          | opérations élémentaires puis conversions aéronautiques (temps, kt↔km/h, consommation) ; distracteurs = erreurs typiques (±10, chiffres transposés, ±1 sur la retenue)                                                       | additions/soustractions → multiplications/divisions exactes → conversions et problèmes à deux étapes       |
| `suites-numeriques`      | suites arithmétiques, géométriques, alternées, carrés ; question = terme suivant                                                                                                                                            | raison simple → alternances → deux suites entrelacées                                                      |
| `series-logiques`        | séries de lettres sur l'alphabet (pas constants, alternés, doubles)                                                                                                                                                         | pas +1/+2 → alternances → groupes de lettres à double règle                                                |
| `memoire`                | exposition chronométrée d'une liste (chiffres, lettres, mots du domaine), puis question de restitution (position, occurrence, présence)                                                                                     | 5 éléments/4 s → 7 éléments/4 s → 8 éléments/3 s                                                           |
| `attention`              | grille de caractères visuellement proches (b/d/p/q, 6/9, O/0) ; compter les occurrences de la cible, temps serré                                                                                                            | grille 4×8 → 5×10 → 6×12                                                                                   |
| `orientation`            | caps et virages (cap initial + virage gauche/droite de N° → nouveau cap ; sens du virage le plus court ; cap réciproque) — arithmétique modulo 360                                                                          | virages de 90° → virages quelconques → réciproques et cumuls                                               |
| `rapidite`               | deux chaînes type immatriculation/indicatif — identiques ou différentes ? temps très court                                                                                                                                  | chaînes courtes, différence franche → chaînes longues, différence d'un caractère ambigu                    |
| `dominos`                | série de dominos `[haut\|bas]` ; chaque moitié suit sa propre progression arithmétique modulo 7 (le blanc vaut 0 et suit le 6) ; question = domino manquant                                                                 | deux progressions positives → une descendante avec bouclage → haut entrelacé (deux pas alternés)           |
| `rotation-mentale`       | motif de flèches (8 directions) à faire pivoter de 90°/180° ; distracteurs = mauvais sens, mauvais angle, motif non tourné                                                                                                  | une flèche, 90°/180° → deux flèches, 90° → trois flèches, 90°/180°/270°                                    |
| `double-tache`           | attention partagée : retenir la nature d'une lettre (voyelle/consonne) puis appliquer le calcul de cap qu'elle commande (réciproque ou +angle)                                                                              | angle de 90° → angles quelconques → (idem, indices plus longs)                                             |
| `empan-chiffres`         | mémoire de travail : une courte séquence de chiffres s'affiche puis disparaît, à restituer **à l'envers** ; distracteurs = séquence à l'endroit, chiffres permutés/altérés                                                  | 4 chiffres → 5 chiffres → 6 chiffres                                                                       |
| `dissociation-attention` | attention répartie : panneau de 4-5 cadrans, chacun avec **sa** règle (min/max/plage) ; question = combien sont hors limite (N1-2) ou lequel (N3) ; distracteurs = comptes voisins / autres cadrans                         | 4 cadrans, « combien » → 5 cadrans, « combien » → 5 cadrans, « lequel »                                    |
| `lecture-instruments`    | lire un cadran de vol **rendu en SVG** ; le générateur ne produit que la donnée physique (cap/vitesse/altitude), la géométrie est calculée dans le player ; distracteur-piège = inversion des deux aiguilles de l'altimètre | compas (cap) → anémomètre (vitesse) → altimètre à deux aiguilles (altitude)                                |
| `memoire-associative`    | exposition chronométrée de paires « indicatif → nombre » puis restitution d'une association ; distracteurs = autres valeurs exposées ; le niveau 3 pose la question en sens inverse (nombre → indicatif)                    | 3 paires / 5 s, sens direct → 4 paires / 5 s → 5 paires / 4 s, sens inverse                                |
| `matrices`               | grille logique 3×3 (type Raven) **rendue en SVG**, case à trouver ; forme ← ligne, nombre ← colonne, remplissage ← règle de difficulté ; les 4 options sont des figures, chaque intrus ne casse qu'une règle                | contour, formes+nombres → remplissage par ligne → remplissage en damier                                    |
| `horloges-durees`        | calcul d'heures et de durées en base 60, modulo 24 h (contexte aéronautique : ETA, temps de vol, UTC/locale) ; distracteurs = erreurs de retenue (±1 h), sens de conversion inversé, oubli de la conversion UTC             | arrivée = départ + durée → durée entre deux heures (passage de minuit) → conversion locale↔UTC + vol       |
| `raisonnement-mecanique` | engrenages et poulies — sens de rotation (alternance des engrenages, courroie croisée ou non) et vitesse (dents ou diamètre) ; distracteurs = mauvais sens et/ou mauvaise vitesse, comptes voisins                          | deux roues engrenées (sens + vitesse) → chaîne de roues (alternance) → poulies à courroie                  |
| `analogies`              | « A est à B ce que C est à ? » — relation à identifier (addition, multiplication, carré, affine) puis à transposer ; distracteurs = règle voisine (addition au lieu de multiplication), étape oubliée, ±1                   | additive/multiplicative → carré → affine (× k puis + m)                                                    |
| `comparaison-nombres`    | vitesse perceptive : désigner le plus grand ou le plus petit d'une liste de nombres ; distracteurs = les autres nombres de la liste ; le niveau 3 introduit des négatifs (le plus grand = le plus proche de zéro)           | 4 nombres à 2 chiffres (le plus grand) → 4 nombres proches à 3 chiffres (le plus petit) → nombres négatifs |

Un **4ᵉ niveau de difficulté** homogène est à l'étude (le contrat reste à
3 niveaux pour l'instant).

## Le simulateur SECPIL (mode temps réel, hors QCM)

À côté des 15 familles QCM, le module propose un **entraîneur psychomoteur
temps réel** inspiré du **SECPIL** des sélections EOPN — une **reconstitution
pédagogique** du _principe_ de l'épreuve (attention partagée), sans lien avec
le logiciel officiel des armées, avec des **commandes accessibles** : souris
(ou doigt) pour le suivi sur un « 8 » (manche), flèches ◀ ▶ ou boutons tactiles
pour la cible horizontale (palonnier), clavier pour le calcul mental.

- **Écran unique immersif** (façon cockpit, toujours en thème sombre) : bande
  **palonnier** en haut (un point apparaît à des positions aléatoires, on pose
  le carré dessus aux flèches ◀ ▶), **« 8 »** au centre (~56 s le tour, suivi à
  la souris), **nombre du calcul** en gros dans le coin.
- **Deux axes réglables** via un écran de sélection :
  - **mode** (progression) — palonnier seul · « 8 » seul · chiffres seuls ·
    « 8 » + chiffres · tout ensemble ;
  - **niveau** 1→5 (quand les chiffres sont actifs) — quand la somme est
    demandée et la taille des nombres : 1 à chaque croisement, 2 à chaque « 8 »,
    3 nombres à deux chiffres, 4 tous les deux « 8 », 5 champ libre (à la fin).
- **Calcul** : un nombre s'affiche 3 s, puis 3 s de repos ; à chaque point de
  contrôle le jeu **se met en pause** et un **pavé numérique** demande la somme
  courante (le mouvement reprend après validation — le temps de pause ne compte
  pas dans le suivi).
- **Tutoriel d'accueil** (`secpil-tutorial.tsx`, sur l'écran de sélection, il
  disparaît pendant la session) : les **trois tâches** expliquées une à une,
  chacune avec une **figure** — le « 8 » avec la cible et le curseur en retard,
  la bande palonnier avec le point à rejoindre, le nombre et sa cadence
  affiché/masqué. Ces figures sont tracées **à partir des fonctions du moteur**
  (`mancheTarget`, constantes de cadence) : elles ne peuvent pas se
  désynchroniser du simulateur. Suivent la logique de progression (modes puis
  niveaux, sans redire les libellés que portent déjà les sélecteurs) et la
  **règle de méthode** de l'attention partagée : **dégrader un peu partout**
  plutôt qu'abandonner une tâche.
- **Séparation logique/rendu** : toute la logique pure et testée vit dans
  `src/lib/psychotech/secpil.ts` (géométrie des cibles, cadence des points de
  contrôle, séquence de nombres déterministe, conversion erreur → précision) ;
  le rendu temps réel (boucle `requestAnimationFrame`, SVG impératif, pavé de
  pause) vit dans `src/features/psychotech/secpil-simulator.tsx`.
- **Notation** : précision de suivi par tâche + pourcentage de sommes justes,
  score global par session.
- **Progression** (`src/lib/psychotech/secpil-progress.ts`, logique pure et
  testée ; vues dans `secpil-progress-panel.tsx`) : les sessions sont
  conservées **localement** (40 dernières). Une session n'est jamais comparée
  qu'à celles de la **même configuration** — un « palonnier seul » à 90 % et un
  « tout ensemble » à 90 % n'ont rien à voir ; le **niveau** n'entre dans la
  clé de comparaison **que si le calcul est actif**. Le bilan de fin de session
  affiche l'**écart au record antérieur** (rien à la première session : il n'y
  a pas de repère), la **courbe** des dernières sessions (échelle toujours
  0–100 %, jamais ajustée aux données) et un **conseil** — rejouer, consolider,
  ou monter d'un cran. L'écran de sélection porte un **tableau par mode**
  (sessions, record, dernière date) où les modes jamais joués restent visibles.
  Le repère de maîtrise (80 % sur 3 sessions) est un **repère du site**,
  toujours présenté comme tel, jamais comme un barème officiel.
- **Route** : `/psychotechnique/secpil` ; fiche méthode
  `/psychotechnique/exercices/le-secpil` (sources : cockpitseeker, piloteready,
  pilotemilitaire).

## Le test d'orientation spatiale (rendu 3D, hors QCM texte)

Reconstitution pédagogique du **test d'orientation** des sélections (type
EOPN/SPEP), **sans lien avec le logiciel officiel**. Le candidat lit un
**instrument** (horizon artificiel + compas) donnant une **attitude** — cap,
assiette, inclinaison — et choisit, parmi **cinq vues 3D d'un aéronef**, celle
dont l'attitude correspond.

- **Conventions de lecture** (conformes à la description de l'épreuve EOPN sur
  pilotemilitaire.fr, vérifiées une à une) : la vue est **toujours orientée vers
  le nord** — nez droit devant = nord, vers la droite = est, vers soi = sud, à
  gauche = ouest ; une **pente d'horizon montant à droite** = inclinaison à
  droite ; **plus de brun que de bleu** = appareil à piquer. Cinq propositions
  par question.
- **Génération infinie et déterministe** : une attitude tient en trois nombres,
  donc l'espace des questions est immense. Chaque question tire une attitude
  cible au hasard (amplitude croissante par difficulté) + **quatre distracteurs**
  qui reproduisent les confusions classiques (inclinaison inversée, cap
  réciproque ou ±90°, assiette inversée, remise à l'endroit…), écartés s'ils sont
  « confondables » pour garantir une seule bonne réponse. Logique pure, testée,
  dans `src/lib/psychotech/orientation.ts`.
- **Progression de difficulté fidèle à l'épreuve** : niveaux 1-2 en attitudes
  usuelles (inclinaison ≤ 90°), puis niveau 3 en **fortes assiettes (jusqu'à
  ±55°) et vol sur le dos** (inclinaison au-delà de 90°, jusqu'à 180° — le sol
  passe alors au-dessus de l'horizon), comme la fin du test réel. L'inclinaison
  est traitée comme un **angle circulaire** : +175° et −175° ne sont distants que
  de 10°, ce dont le filtre anti-ambiguïté tient compte.
- **Rendu 3D** : deux **modèles glTF de libre réutilisation** (CC BY —
  registre `src/lib/models-3d.ts`, crédités sur `/credits-photos`), tirés au
  hasard selon les questions, orientés en direct via **Three.js** (importé
  dynamiquement, code-splitté sur cette seule page). Les vignettes sont rendues
  hors écran puis affichées comme images ; l'instrument est en SVG. Rendu et
  logique séparés — même doctrine que le SECPIL.
- **Deux formats** : **test officiel** (27 questions / 7 min, le format des
  sélections) et **format court** (10 questions / 2 min 35). Le format court
  conserve **exactement la même cadence** (≈ 15,5 s par question) : seule la
  longueur change, jamais la pression temporelle — un score court reste donc
  comparable. Les deux vivent dans `ORIENTATION_FORMATS`, et l'historique
  mémorise le format joué.
- **Tutoriel d'accueil** : un bloc « Comment lire l'instrument » explique le
  code (bleu = ciel, brun = sol, avion central fixe) puis déroule **trois
  exemples** — assiette, inclinaison, cap — chacun montrant l'instrument à côté
  de l'appareil correspondant. Ces exemples sont produits par le **même moteur
  de rendu que le test** : ils ne peuvent pas se désynchroniser du jeu réel, et
  leur chargement préchauffe la 3D avant la première question.
- **Écran d'intro** : choix du format, case **Mode entraînement** (correction
  immédiate), puis barre de progression, résultats et historique local
  (10 dernières sessions).
- **Route** : `/psychotechnique/orientation` ; méthode rattachée à la fiche
  `la-vision-spatiale`.

## Le test de dominos (réponse composée, hors QCM)

Reconstitution du **test de dominos** (type D70/D48). Une série suit une règle,
une tuile est masquée : le candidat la **compose au pavé**, une moitié après
l'autre. Pas de propositions à éliminer — donc **aucune bonne réponse trouvée
par hasard**, comme sur la feuille du test papier.

- **Trois niveaux, dix dominos chacun**, avec des durées calées sur le rythme
  du test papier (44 dominos en 25 min, soit ≈ 34 s l'unité) puis élargies à
  mesure que les règles se superposent : **facile** 6 min (une règle par
  moitié, indépendantes), **difficile** 8 min (règles opposées, somme
  constante, pas alterné), **impossible** 10 min (chaînes entrelacées, cascade
  croisée, somme en suite de Fibonacci, écart croissant).
- **Dispositions** : ligne et grille au niveau 1 ; cercle au niveau 2 ; spirale
  et arbre au niveau 3. Règle de justesse : **la règle peut être retorse,
  l'ordre de lecture jamais**. Ligne et grille se lisent par convention (gauche
  → droite, haut → bas) et ne portent aucun lien ; toute autre disposition
  affiche des **liens pointillés** qui donnent le chemin. L'anneau ne se
  referme pas (la règle est linéaire) et l'**arbre est réservé à la règle
  entrelacée**, dont ses deux branches sont la clé visuelle.
- **Notation** : une tuile n'est juste que si **ses deux moitiés** le sont —
  règle du test papier. Le détail par moitié est tout de même exposé : savoir
  qu'on a tenu le haut et manqué le bas vaut mieux qu'un « faux ».
- **Mode entraînement** : sans chronomètre, la règle est expliquée après chaque
  domino. En test, la correction complète (série, bonne tuile, règle) arrive au
  bilan.
- **Rendu** : SVG maison sur les tokens, points en disposition de dé, **blanc =
  0** (moitié vide, jamais un « 0 » écrit). Le même composant sert au test et à
  la famille « Dominos » de l'entraînement chronométré : un domino se lit
  partout pareil.
- **Logique pure** : `src/lib/psychotech/dominos.ts` (génération, règles,
  dispositions, notation), testée dans `dominos.test.ts`.
- **Route** : `/psychotechnique/dominos` ; méthode rattachée à la fiche
  `les-dominos`. Une mention rappelle que les dominos ont été **retirés de la
  sélection EOPAN en 2025** mais restent au programme d'autres sélections.

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
