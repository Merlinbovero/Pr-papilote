# Croquis pilotes du lot C2

Aucun chiffre de ce document n'est saisi à la main : les croquis existants et
les fiches citées sont ceux de `reports/croquis/inventory.json`, produit par
`npm run croquis:inventory`.

## Ce que ce document décide, et ce qu'il ne décide pas

Il **spécifie** deux croquis avant de les dessiner : famille, fonction, niveau,
portée, sources, hypothèses, domaine de validité, critères d'acceptation. Il ne
contient aucun dessin, aucune consigne graphique détaillée, aucune valeur
numérique non sourcée.

La raison de cet ordre est le principal enseignement de C0 : les défauts
relevés (**A-01** un bilan de forces énoncé comme général alors qu'il n'est vrai
qu'en palier stabilisé, **A-03** une polaire muette sur sa portée 2D ou aile
finie) ne sont pas des fautes de tracé. Ce sont des **omissions décidées avant
le tracé**, et jamais rattrapées ensuite. Un croquis qui commence par son
dessin ne porte ses hypothèses que si quelqu'un pense à les ajouter ; un croquis
qui commence par sa fiche de métadonnées ne peut pas être publié sans elles —
`figureMetaSchema` le refuse.

**C1 ne produit ni ne modifie aucun SVG.** Ce document est la commande, pas la
livraison.

## Pourquoi ces deux-là

Les deux sujets existent déjà en production. Ce ne sont donc pas des créations,
ce sont les **deux premiers croquis à passer sous contrat** — et c'est
volontaire : un pilote sur un sujet neuf n'aurait rien prouvé sur les cent six
croquis en place.

| Pilote  | Sujet                        | Croquis existants sur le sujet                       | Fiche propriétaire                                                                                           |
| ------- | ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **P-4** | Circuit Pitot-statique       | `pitot-statique-sources`, `chaine-anemobarometrique` | `content/fondamentaux/instruments/chaine-pitot-statique.yaml`                                                |
| **P-6** | Triangle des vitesses (vent) | `triangle-des-vitesses`, `cap-route-derive`          | `content/fondamentaux/meteorologie/le-vent.yaml`, `content/fondamentaux/navigation/cap-route-et-derive.yaml` |

Ils ont été retenus parce qu'ils **mettent le contrat en tension sur deux points
opposés** :

- **P-4 est une chaîne fonctionnelle qui porte une relation quantitative.** Le
  circuit lui-même est une plomberie — famille F7, rien à démontrer. Mais dès
  que le croquis écrit `q = pt − ps`, il engage un modèle, donc des hypothèses
  et un domaine de validité. C'est le cas limite où l'on est tenté de croire
  qu'un schéma d'installation n'engage rien.
- **P-6 est une construction géométrique exacte.** Le triangle des vitesses est
  une somme vectorielle : il est juste ou faux, sans nuance qualitative
  possible. C'est le cas où le contrat doit empêcher un dessin « à peu près
  proportionnel » de passer pour une construction.

Si le contrat tient sur ces deux-là, il tient sur les familles intermédiaires.

## P-4 · Circuit Pitot-statique

### Métadonnées pré-déclarées

| Champ                      | Valeur                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `family`                   | `F7` — chaîne fonctionnelle                                                                |
| `function`                 | `scientific_diagram`                                                                       |
| `level`                    | `P2` — la relation entre pressions est exploitée, pas seulement illustrée                  |
| `modality`                 | `static`                                                                                   |
| `scientificNatures`        | `["analytical"]`                                                                           |
| `scope`                    | `system`                                                                                   |
| `sources`                  | **F-02** (FAA PHAK ch. 8, source principale) ; **N-05** (NASA Glenn, exposé de la méthode) |
| `assumptions`              | voir ci-dessous — au moins quatre, explicites                                              |
| `validityDomain`           | voir ci-dessous                                                                            |
| `scientificallyVerifiedAt` | à renseigner à la relecture, jamais à l'avance                                             |

### Hypothèses à écrire dans `assumptions`

1. Écoulement **incompressible** — la relation `q = ½·ρ·V²` cesse d'être exacte
   quand la compressibilité intervient.
2. Prise statique **non perturbée** par l'écoulement local autour du fuselage.
3. Tube de Pitot **aligné** sur le vent relatif (incidence et dérapage faibles).
4. Masse volumique `ρ` prise à la valeur **atmosphère standard**, ce qui est
   précisément pourquoi l'indication est une vitesse **indiquée** et non une
   vitesse vraie.

### Domaine de validité

Régime subsonique bas, incidence et dérapage faibles, circuit non obstrué. Hors
de ce domaine — givrage, obstruction, forte incidence — la chaîne ne mesure plus
ce qu'elle affiche, et c'est **cela** que le croquis doit rendre lisible plutôt
que de le taire.

### État de vérification des sources — à corriger avant publication

Le registre le dit : **F-02 est marquée `document_consulted: non`**. Le PDF
répond HTTP 200, personne ne l'a ouvert. Le pilote P-4 ne peut donc pas être
déclaré `figure_verified` tant que le chapitre 8 n'a pas été lu et la page
notée. C'est la première tâche de C2 sur ce pilote, avant tout tracé.

### Critères d'acceptation

- Le croquis distingue **pression totale**, **pression statique** et **pression
  dynamique** sans les confondre graphiquement ni verbalement.
- La relation `pt = ps + q` est **lisible avec ses unités et ses hypothèses** :
  c'est ce que P2 exige (doctrine §3), et c'est ce qui distingue ce croquis d'un
  simple plan de plomberie.
- Chacun des trois instruments alimentés est relié à la source qui l'alimente
  réellement — une erreur de branchement sur ce schéma est une erreur
  d'enseignement.
- Aucune valeur numérique n'apparaît sans figurer dans une source citée.
- `alt` décrit la **chaîne**, pas l'apparence : ce qui alimente quoi.

### Ce qui ferait échouer le pilote

Un croquis exact où `assumptions` resterait vide. La réussite du pilote ne se
juge pas au dessin seul : elle se juge à ce que le contrat a forcé à écrire.
Un P-4 magnifique et muet sur ses hypothèses est un échec de C2, pas une
réussite graphique.

## P-6 · Triangle des vitesses

### Métadonnées pré-déclarées

| Champ               | Valeur                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| `family`            | `F3` — décomposition vectorielle                                          |
| `function`          | `scientific_diagram`                                                      |
| `level`             | `P2`                                                                      |
| `modality`          | `static`                                                                  |
| `scientificNatures` | `["analytical"]`                                                          |
| `scope`             | `operational_environment`                                                 |
| `sources`           | **F-03** (FAA PHAK complet, source du pilote) — édition exacte à trancher |
| `assumptions`       | voir ci-dessous                                                           |
| `validityDomain`    | voir ci-dessous                                                           |

### Hypothèses à écrire dans `assumptions`

1. Vent **uniforme et constant** sur le segment considéré.
2. Vitesse propre **constante**.
3. Construction dans le **plan horizontal** : ni montée, ni descente.
4. Cap et route exprimés dans **le même repère** — vrai ou magnétique, jamais un
   mélange des deux.

La quatrième n'est pas une précaution rhétorique : c'est l'erreur la plus
fréquente sur ce sujet, et un croquis qui ne dit pas son repère la rend
indétectable.

### Domaine de validité

Navigation à l'estime en vol horizontal, vent homogène. La construction ne dit
rien d'un vent tournant ni d'un profil de vent variable en altitude.

### Contrainte de construction, propre à ce pilote

Le triangle **doit être une somme vectorielle exacte** : vitesse propre + vent =
vitesse sol. Un triangle dessiné « à peu près » est faux, et il le reste même
s'il est joli. Les longueurs sont donc construites à l'échelle, et cette échelle
est déclarée.

La doctrine §8 ne s'applique pas ici : elle ne parle que des **cartes**, et elle
n'y rend l'échelle obligatoire que si les distances portent une fonction
pédagogique. L'obligation, sur P-6, vient d'ailleurs — de la nature
`analytical` déclarée. Le raisonnement est le même, la règle invoquée n'est pas
la même, et les confondre serait étendre une clause au-delà de ce qu'elle dit.

### Critères d'acceptation

- Les trois vecteurs se lisent comme des vecteurs : origine, direction, norme.
- L'angle de dérive apparaît comme **l'écart entre cap et route**, pas comme un
  angle décoratif entre deux traits.
- Le repère (vrai ou magnétique) est nommé sur le croquis.
- L'échelle est déclarée et respectée.
- Aucun vecteur n'a une longueur incohérente avec les autres.

### Ce qui ferait échouer le pilote

Une construction à main levée présentée comme une construction. Sur ce sujet, le
`scientificNatures: ["analytical"]` engage : si le dessin n'est pas à l'échelle,
il n'est pas analytique, et déclarer `analytical` devient un mensonge de
métadonnée — exactement ce que le contrat existe pour rendre impossible.

## Ordre des opérations en C2

1. **Lire les sources**, et mettre à jour `docs/editorial/references-schemas.md`
   avec l'état réel (`document_consulted`, puis `figure_verified`, avec la page).
2. **Écrire le bloc `meta`** dans la fiche, avant tout tracé. Si le contrat le
   refuse, c'est que la spécification est incomplète — pas que le contrat est
   trop strict.
3. **Dessiner**, en respectant le contrat graphique (doctrine §10) et les
   contrastes (§7).
4. **Faire relire** : la relecture porte sur la justesse scientifique, que ni le
   schéma Zod ni le classifieur lexical ne peuvent établir.
5. **Renseigner `scientificallyVerifiedAt`** — et seulement alors.

Un pilote qui saute l'étape 1 ou l'étape 2 n'est pas un pilote : c'est un
croquis de plus, produit exactement comme les cent six précédents.
