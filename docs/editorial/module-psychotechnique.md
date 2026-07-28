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

## Le test des appareils photos (rendu 3D, hors QCM)

Reconstitution du **test des appareils photos** des sélections EOPAN. Une scène
contient quelques objets posés au sol et **trois appareils numérotés**, chacun
à une place et une orientation distinctes ; une seule photo est montrée :
laquelle des trois l'a prise ?

- **Aucun modèle 3D importé.** Les objets sont des **primitives calculées**
  (cube, cône, cylindre, sphère, pyramide, tore). Pour une épreuve de
  perspective, seules comptent la silhouette et la position relative — un
  modèle téléchargé n'apporterait rien et coûterait un chargement, une échelle
  à recaler et une licence à créditer. Le moteur ne manipule que des positions
  et des rayons : brancher de vrais objets plus tard ne toucherait pas la
  logique.
- **La garantie d'unicité de la réponse est le cœur du générateur.** Trois
  appareils tirés au hasard donnent vite deux vues quasi identiques — scène
  symétrique, objectifs trop proches, objets alignés. La question devient alors
  indécidable, et le candidat a raison de ne pas pouvoir trancher : c'est le
  générateur qui est fautif. Chaque vue reçoit donc une **signature** — ordre
  gauche-droite des objets visibles, et qui masque qui — et une question n'est
  retenue que si la bonne vue s'écarte assez des deux autres. Le seuil se
  resserre avec le niveau. Un test le vérifie sur **360 scènes**.
- **Difficulté progressive au fil de la session**, comme au test réel : le
  premier tiers sépare franchement les points de vue (≥ 75°), le dernier les
  resserre (22 à 55°), où seule une occultation tranche.
- **Formats** : **officiel** (30 vues en 8 min, soit 16 s l'unité) et **court**
  (10 vues, même cadence — un score reste comparable). Mode entraînement sans
  chronomètre, avec la réponse commentée après chaque vue.
- **Le plan vue de dessus** (SVG, `camera-plan.tsx`) est une **béquille
  pédagogique** : offerte en entraînement et sur le premier tiers du test
  seulement. S'en passer fait partie de l'aptitude évaluée.
- **La correction nomme ce qui tranche** : quel objet un autre appareil ne
  verrait pas, ou lequel occuperait cette place — jamais un vague « un autre
  ordre ».
- **Logique pure** : `src/lib/psychotech/cameras.ts` (géométrie de prise de
  vue, occultations, signatures, génération, notation), testée dans
  `cameras.test.ts` (41 tests). Rendu dans `camera-scene.tsx` (Three.js importé
  dynamiquement) et `camera-plan.tsx`.
- **Route** : `/psychotechnique/appareils-photos` ; méthode rattachée à la
  fiche `la-vision-spatiale`.

## Une fiche de méthode par épreuve

**Règle éditoriale, posée après un retour utilisateur** (« je n'ai pas compris
pourquoi tu me renvoies vers les matrices 3×3, il faut bien une explication par
test »).

Chaque entraîneur renvoie vers **sa** fiche de méthode, et une fiche ne traite
**qu'une** épreuve. Le raccourci qui consiste à ajouter une section à une fiche
voisine — parce que le raisonnement se ressemble — produit un renvoi
incompréhensible : on clique sur « Avant de vous lancer » depuis le test des
triangles et l'on tombe sur une fiche intitulée « Les matrices ».

L'état corrigé, huit entraîneurs pour huit fiches :

| Entraîneur                           | Fiche de méthode               |
| ------------------------------------ | ------------------------------ |
| `/psychotechnique/calcul-mental`     | `le-calcul-mental`             |
| `/psychotechnique/dominos`           | `les-dominos`                  |
| `/psychotechnique/secpil`            | `le-secpil`                    |
| `/psychotechnique/triangles`         | `le-test-des-triangles`        |
| `/psychotechnique/codage`            | `le-test-de-codage`            |
| `/psychotechnique/formes-imbriquees` | `les-formes-imbriquees`        |
| `/psychotechnique/appareils-photos`  | `le-test-des-appareils-photos` |
| `/psychotechnique/orientation`       | `le-test-d-orientation`        |

Les fiches de famille — `les-matrices`, `la-comparaison-de-nombres`,
`la-vision-spatiale` — gardent leur périmètre propre et sont reliées aux fiches
d'épreuve par `relations.related`. Le lien de parenté reste donc navigable,
sans que la fiche de famille prétende expliquer une épreuve qu'elle ne traite
pas.

## Le test des triangles (SVG, hors QCM)

Reconstitution du **test des triangles** des sélections EOPAN. Un grand
triangle est découpé en petits triangles coloriés ; **deux triangles adjacents
sont laissés blancs** et il faut désigner, parmi quatre **losanges**, celui qui
complète la figure. Format officiel : **20 figures en 8 minutes**, seize petits
triangles, quatre propositions.

- **La figure n'est pas coloriée au hasard.** C'est le point qui décide de
  tout : l'épreuve annonce des motifs — alternance, répétitions par
  lignes/colonnes, sous-triangles, décalage « un sur deux », rotations,
  symétries — et c'est cette règle qui rend la pièce manquante déductible. Le
  générateur part donc de la règle et en déduit la figure, jamais l'inverse.
- **Une règle est un classement.** Toutes les familles de motifs se ramènent à
  une seule abstraction : la règle range les cases en classes, et toutes les
  cases d'une classe portent la même couleur. Cette formulation unique donne
  gratuitement les deux propriétés dont on a besoin — une case est
  **déductible** dès qu'une autre case de sa classe est visible, et la règle se
  **nomme** en français pour la correction. Sept règles sont implémentées :
  lignes, orientation, symétrie axiale, diagonales, couronnes concentriques,
  alternance une case sur trois, motif d'un quart répété.
- **Le trou doit rester déductible.** Si la règle est « une couleur par ligne »
  et que le trou emporte les deux seules cases visibles de cette ligne, la
  question n'a plus de réponse — et le candidat a raison de ne pas pouvoir
  trancher. Le trou n'est retenu que si chaque case manquante garde une sœur
  visible dans sa classe, couleur **et** décor. Un test le vérifie.
- **Les couleurs sont distribuées en balayant une palette mélangée**, et non
  tirées indépendamment : la règle doit se **voir**. Un premier tirage libre
  produisait régulièrement des figures quasi unies, où plus rien ne trahissait
  le motif — la question devenait une devinette. Le mélange de la palette et
  celui de l'ordre des classes suffisent à garder la variété.
- **Les mauvaises pièces n'emploient que des couleurs présentes dans la
  figure.** Une couleur qu'on ne voit nulle part ailleurs s'écarterait sans
  réfléchir, et la question perdrait un quart de sa difficulté. Corollaire :
  sans décor, la couleur porte seule la difficulté et la règle doit produire au
  moins **trois** classes — à deux tons, on ne peut pas construire trois fausses
  pièces qui se tiennent.
- **La même géométrie dessine la figure et les losanges proposés** : une pièce
  apparaît donc exactement dans l'orientation du trou qu'elle doit combler,
  comme à l'épreuve. Deux géométries séparées auraient fini par diverger, et la
  question serait devenue injuste. Les trois orientations de losange (penché à
  gauche, penché à droite, vertical) sont toutes produites.
- **Difficulté progressive au fil de la session** : niveau 1, seize triangles
  et une règle de couleur sans décor — le format réel ; niveau 2, vingt-cinq
  triangles et des marques ; niveau 3, **couleurs et marques obéissant à deux
  règles différentes**, ce qui oblige à lire la figure deux fois.
- **Le test reste sec, le débrief est généreux.** Pendant la session, rien
  d'autre que la figure et les quatre losanges, comme aux sélections. La
  correction **nomme la règle**, montre la **figure complétée** par la bonne
  pièce et, en cas d'erreur, la figure complétée par la pièce choisie avec ce
  qui clochait. Le débrief n'est pas l'épreuve : c'est là qu'on apprend à
  reconnaître les motifs, ce que la page de référence donne comme la clé de
  l'entraînement.
- **Rendu SVG calculé**, sans dépendance ni chargement différé — contrairement
  aux appareils photos et aux formes imbriquées, aucune 3D n'est nécessaire.
- **Logique pure** : `src/lib/psychotech/triangles.ts` (géométrie de la grille
  triangulaire, règles, déductibilité, distracteurs, notation), testée dans
  `triangles.test.ts` (25 tests). Rendu dans `triangle-figure.tsx`.
- **Route** : `/psychotechnique/triangles` ; méthode rattachée à la fiche
  `les-matrices`, section « Le test des triangles » — le raisonnement des
  matrices s'y applique mot pour mot.

## Le test de codage (TAMI-C, hors QCM)

Reconstitution du **test de codage du TAMI-C** (sélections EOPN). Une **grille
de mots** est affichée, chacun associé à un **code à quatre chiffres** ; on
demande un mot, il faut désigner son code parmi **cinq propositions**. Format
officiel : **45 questions en 2 min 30**, soit 3,3 s l'unité.

- **La grille ne change pas de toute la session.** C'est le trait qui définit
  l'épreuve : la mémoire ne remplace pas la recherche, elle l'accélère. Au fil
  des questions on cesse de chercher les mots fréquents, on sait où ils sont.
- **Les cinq propositions sont des codes de la grille**, jamais des nombres
  inventés — relevé sur les captures de l'épreuve, où les vingt propositions
  observées figuraient toutes au tableau. Conséquence : aucun code ne s'élimine
  parce qu'il « n'existe pas », il faut vraiment retrouver la ligne du mot.
  C'est le point qu'on n'aurait pas deviné, et celui qui fait la difficulté.
- **Les codes se ressemblent, de plus en plus avec le niveau.** Ils sont bâtis
  par **familles** : un code de référence, puis des variantes qui n'en changent
  qu'un ou deux chiffres — ce qui reproduit les grilles réelles, où l'on trouve
  1985, 1988, 1485 et 1785 côte à côte. Les distracteurs sont pris parmi les
  plus proches du bon code : **61 % d'entre eux ne diffèrent que d'un ou deux
  chiffres au niveau 1, 81 % au niveau 2, 96 % au niveau 3** — mesuré, et tenu
  par un test.
- **Les mots aussi se ressemblent.** Le vocabulaire est rangé par groupes de
  ressemblance visuelle (`portail`, `portier`, `portique`, `portage`) ; les
  niveaux élevés piochent plusieurs mots du même groupe, si bien qu'on ne peut
  plus reconnaître une silhouette, il faut lire jusqu'au bout.
- **Le niveau vaut pour la session entière**, contrairement à nos autres
  épreuves où il monte par tiers : la grille étant fixe, la difficulté ne peut
  pas monter en cours de route sans la remplacer — ce que l'épreuve ne fait
  pas. Le **niveau 1 est le format réel** (douze mots) ; les niveaux 2 et 3
  portent la grille à vingt puis trente mots.
- **Répondre enchaîne aussitôt.** À 3,3 s la question, un bouton « suivant »
  mangerait la moitié du temps. En entraînement, la bonne ligne de la grille
  s'allume une seconde avant d'enchaîner — assez pour voir son erreur, pas
  assez pour casser le rythme que l'épreuve exige d'installer.
- **La session occupe l'écran seule** : à cette cadence, tout ce qui reste
  au-dessus est une distraction.
- **La correction nomme le mot du code donné par erreur** : « vous avez
  répondu 1988, c'est le code de _galerie_ ». On comprend aussitôt qu'on a lu
  une ligne à côté — ce qu'un simple « faux » ne dirait pas. Le bilan affiche
  aussi le **débit** : les questions non traitées comptent comme fausses, et la
  justesse sur ce qui a été traité est donnée à part.
- **Le vocabulaire est une donnée de moteur, pas du contenu éditorial** : il
  n'énonce aucun fait, ne se cite pas, n'a pas de source à créditer. Il vit
  donc dans `codage.ts` et non dans `content/`.
- **Logique pure** : `src/lib/psychotech/codage.ts` (grille, familles de codes,
  distance entre codes, questions, notation), testée dans `codage.test.ts`
  (16 tests). Lecteur dans `codage-test.tsx` — aucun rendu 3D, donc aucun
  chargement différé.
- **Route** : `/psychotechnique/codage` ; méthode rattachée à la fiche
  `la-comparaison-de-nombres`, section « Le test de codage » — la comparaison
  chiffre par chiffre qu'elle enseigne est exactement ce que le codage exige.

## Le test des formes imbriquées (rendu 3D, hors QCM)

Reconstitution du **test des formes imbriquées** des sélections EOPAN. Un
**assemblage** de pièces enchevêtrées est montré ; quatre jeux de pièces
**désassemblées** sont proposés, un seul a servi à le construire. Format
officiel : **20 assemblages en 8 minutes**, soit 24 s l'unité.

- **Aucun modèle 3D importé**, comme pour les appareils photos, et pour la même
  raison. Chaque pièce est une **primitive paramétrique** : un anneau ouvert est
  un tore d'arc partiel, un disque entaillé un cylindre d'angle partiel, un tube
  un profil annulaire révolutionné, une barre une boîte. C'est exactement le
  vocabulaire de formes de l'épreuve réelle, sans téléchargement, sans échelle à
  recaler et sans licence à créditer. Aucune opération booléenne n'est
  nécessaire — donc aucune dépendance de géométrie constructive.
- **L'imbrication est construite, pas tirée au sort.** Les pièces de révolution
  sont **enfilées sur un axe commun** en se chevauchant ; les barres traversent
  l'enfilade de part en part. Un premier modèle qui plaçait les pièces au hasard
  dans une sphère donnait des pièces flottant côte à côte, sans imbrication : il
  a été remplacé.
- **Trois garanties, tenues par construction et vérifiées par les tests.**
  - _Aucune pièce avalée_ : une pièce entièrement contenue dans une autre serait
    invisible, et deux jeux différents produiraient alors la même image. Le
    chevauchement axial est partiel, jamais une inclusion.
  - _Assemblage d'un seul tenant_ : chaque pièce enfilée chevauche sa voisine,
    et chaque barre dépasse de l'enfilade — donc reste visible.
  - _Entaille tournée vers l'observateur_ : la rotation d'une pièce autour de
    l'axe reste dans une fourchette qui garde le creux face à la vue. Une
    entaille passée derrière rendrait deux jeux également défendables.
- **Un distracteur diffère du bon jeu par une pièce et une seule**, et cette
  différence doit dépasser un **écart minimal mesuré** (`shapeDistance`), qui se
  resserre avec le niveau. Les altérations sans effet visible à l'écran ont été
  retirées : la section d'une barre fait deux ou trois pixels, la modifier
  produirait une différence indécelable — seule sa longueur est jouée.
- **Le cadrage est commun aux quatre propositions.** Cadrer chaque image sur son
  propre contenu aurait grossi le jeu contenant la pièce la plus courte : le
  zoom aurait trahi la réponse sans qu'on ait à regarder les formes.
- **Les quatre propositions montrent les mêmes pièces sous les mêmes angles** —
  l'orientation ne dépend que de la question et du rang de la pièce, jamais de
  la proposition. Seule la forme les distingue.
- **Difficulté progressive au fil de la session** : niveau 1, trois pièces
  franches sans basculement ; niveau 2, quatre pièces et basculement libre ;
  niveau 3, cinq pièces et un seul détail qui tranche. Au-delà de trois pièces,
  les propositions passent sur **deux rangs** — en une seule rangée elles
  seraient minuscules.
- **L'assemblage n'est pas manipulable.** C'est la projection mentale qui est
  évaluée, et un score doit rester comparable à celui de l'épreuve.
- **Logique pure** : `src/lib/psychotech/formes.ts` (pièces, signatures,
  distances, imbrication, distracteurs, notation), testée dans
  `formes.test.ts` (22 tests). Rendu dans `forme-scene.tsx` (Three.js importé
  dynamiquement).
- **Route** : `/psychotechnique/formes-imbriquees` ; méthode rattachée à la
  fiche `la-vision-spatiale`, section « Les formes imbriquées ».

## L'entraîneur de calcul mental (hors QCM du moteur)

L'épreuve jugée la plus difficile des sélections — et celle qui se travaille le
mieux. Format officiel : **24 questions en 8 minutes, quatre propositions**,
difficulté croissante, décimaux, fractions et pourcentages, et **pas de
brouillon**.

Deux conséquences structurent le générateur : la plupart des questions se
traitent par **encadrement** plutôt que par calcul exact, et les distracteurs
sont les **erreurs qu'on commet vraiment de tête** (virgule décalée, retenue
oubliée, opération inversée) — jamais des nombres au hasard, qui se
laisseraient éliminer sans réfléchir.

- **Neuf thèmes** : additions/soustractions · multiplications · divisions ·
  les quatre opérations · **grilles 3×3** · **ordres de grandeur** ·
  **fractions et pourcentages** · **calculs du métier** · tout mélangé.
- **Les grilles 3×3** : une grille de nombres avec les totaux en marge, une
  case vide. On tient cinq nombres en tête et on croise deux chemins (ligne et
  colonne). Au **niveau 3, le total de la ligne disparaît aussi** — le
  raccourci évident est coupé, il faut passer par la colonne. Un test vérifie
  que tous les totaux affichés sont cohérents et qu'un chemin de résolution
  subsiste toujours.
- **Les ordres de grandeur** ne demandent pas le résultat exact : les
  propositions sont écartées d'au moins 30 %, seul l'encadrement tranche.
  C'est la compétence que décrit la source, et qu'aucune opération exacte ne
  travaille.
- **Les calculs du métier** n'emploient que des facteurs **déjà consignés dans
  les fiches Fondamentaux** (1 nœud = 1,852 km/h, 1 pied = 0,3048 m, 1 mille
  marin = 1852 m). Les règles d'estimation (1 en 60, pente à 3° ≈ 300 ft/NM)
  sont présentées comme les approximations qu'elles sont — un test l'exige.
- **Quatre niveaux de difficulté** : 1, 2, 3 et **progressif**, qui monte au
  fil de la session comme à l'épreuve réelle.
- **Quatre longueurs** : 10, 20, **officiel** (24 en 8 min) et **sans fin**,
  que l'on arrête quand on veut — pensé pour enchaîner deux cents calculs. Les
  formats courts gardent la cadence officielle (20 s la question), si bien
  qu'un score reste comparable.
- **Les questions ne sont jamais stockées** : elles se recalculent à partir de
  la graine de session et de leur rang. C'est ce qui permet au format sans fin
  de n'accumuler aucune mémoire, et à la correction finale de les retrouver
  toutes.
- **Deux modes** : test (correction à la fin) et entraînement (réponse et
  méthode après chaque question — celui à prendre pour le format sans fin).
  Au-delà de 30 questions, la correction ne liste **que les erreurs**.
- **Logique pure** : `src/lib/psychotech/calcul.ts`, testée dans
  `calcul.test.ts` (60 tests, dont la vérification arithmétique de chaque
  thème).
- **Route** : `/psychotechnique/calcul-mental` ; méthode rattachée à la fiche
  `le-calcul-mental`.

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
