# Clôture du Banc — procès-verbal

**Document daté. Il ne sera pas rectifié.** Il atteste l'état du chantier « Le
Banc » au moment de sa clôture ; ce qui bougera ensuite se lit dans
[`etat-actuel.md`](etat-actuel.md), qui a vocation à bouger. Un procès-verbal
qu'on corrige a posteriori ne prouve plus rien de ce qu'il attestait.

- **Clos le** : 2026-08-04
- **Branche d'intégration** : `banc/integration`
- **Lots** : F0a, F0b (audit) · F1a, F1b (fondations) · F2a, F2b, F3, F4, F5, F6,
  F7a, F7b, F7c, F7d, F9 (migrations et arbitrages) · F11 (stockage) · F12 (clôture)
- **Campagne finale** : 996 réussis, 14 ignorés, **0 échec**, sur compilation de
  production, deux projets (Desktop Chrome et Pixel 7)

---

## 1. Ce que le chantier a corrigé

L'audit F0b avait relevé un défaut unique, répété sur toutes les surfaces
interactives : **le chapeau éditorial reste empilé au-dessus de l'aire de jeu
une fois la séance lancée.** L'utilisateur devait faire défiler pour atteindre
le premier contrôle de réponse d'un exercice qu'il venait lui-même de démarrer.

Le Banc n'est donc pas une charte graphique. C'est une réponse à un défaut
mesuré, et le critère qui décide de son application a été arbitré au lot F4 :

> un registre visuel distinct est déclenché par un **changement de tâche
> principale**, pas par la simple présence d'une interaction.

D'où deux registres, et deux seulement : `banc` pour les séances autonomes,
`documentaire` pour les exercices subordonnés à leur document. Le second n'est
pas une étape vers le premier — c'est un classement définitif.

## 2. Le résultat mesuré

Toutes les mesures ci-dessous ont été prises **avec `git stash` pour seule
variable**, sur la même machine, en compilation de production, document remonté
en haut avant relevé. Le point de mesure est le bas du premier contrôle de
réponse, sauf mention contraire.

### Le module psychotechnique — le plus atteint, et le plus amélioré

| Épreuve           | 1440 × 900 avant → après | 390 × 844 avant → après |
| ----------------- | ------------------------ | ----------------------- |
| Dominos           | 1004 → **547 px**        | 962 → **531 px**        |
| Calcul mental     | 842 → **357 px**         | 1268 → **361 px**       |
| Codage            | 950 → **465 px**         | 1482 → **841 px**       |
| Appareils photos  | 1083 → **550 px**        | 1410 → **785 px**       |
| Formes imbriquées | 1527 → **967 px**        | 1427 → **729 px**       |
| Triangles         | 1363 → **853 px**        | 1347 → **775 px**       |
| Orientation       | 1068 → **630 px**        | 1151 → **590 px**       |

**Treize des quatorze relevés sont désormais dans le premier écran, contre un
seul avant le chantier.**

### Les autres surfaces

| Surface                         | Viewport   | Avant   | Après      |
| ------------------------------- | ---------- | ------- | ---------- |
| `/entrainement/eopan` (F2a)     | 390 × 844  | 670 px  | **403 px** |
| `/entrainement/eopn` (F3)       | 390 × 844  | 783 px  | **489 px** |
| `/bia/examen-blanc` (F5)        | 412 × 839  | 639 px  | **523 px** |
| `/psychotechnique/entrainement` | 390 × 844  | 779 px  | **367 px** |
| `/psychotechnique/secpil` (F9)  | 1440 × 900 | 1254 px | **749 px** |

Le plus gros gain unitaire du chantier est **−685 px** (triangles, mobile) ; le
plus gros gain relatif est l'entraînement psychotechnique, qui empilait **deux**
écrans d'avant-séance au-dessus de l'aire de jeu.

### Ce qui a été gagné et qui ne se mesure pas en pixels

- **Le chronomètre existe pour les techniques d'assistance.** Sur SECPIL —
  l'épreuve la plus chronométrée du produit — le temps restant et la précision
  étaient dessinés **dans** un `<svg>` portant `role="img"` et un libellé
  statique. Aucune des deux valeurs n'atteignait un lecteur d'écran. Elles sont
  désormais exposées hors du dessin ; le dessin reste, il n'est simplement plus
  le seul porteur de l'information.
- **Le focus a un contrat** (F1a) : `deplacerFocus` avec règle de non-vol — le
  système ne reprend jamais un focus que la personne a déplacé entre-temps.
- **La séance porte son propre titre de niveau 1** (F7d) : quand le chapeau
  éditorial se replie, la séance devient fonctionnellement une nouvelle vue et
  doit en exposer la structure. Un nom accessible sur un groupe complète cette
  structure ; il ne la remplace pas.
- **DT-002 est soldée** (F12) : le lien « Pour approfondir » est souligné au
  repos partout, seul repère non chromatique qu'exige WCAG 1.4.1. La campagne
  axe tourne désormais **sans aucune exclusion**.

## 3. Ce que la clôture elle-même a changé (lot F12)

Le lot de clôture n'était pas une formalité : il restait quatre surfaces en
registre `legacy`, c'est-à-dire **non arbitrées**, et une valeur par défaut qui
permettait à une cinquième d'apparaître sans que personne ne le remarque.

| Surface                       | Arbitrage                                                        |
| ----------------------------- | ---------------------------------------------------------------- |
| `/entrainement/[concours]`    | branche `legacy` **morte depuis F3** — supprimée                 |
| Quiz d'anglais                | **séance** → route propre `/anglais/quiz`, au Banc               |
| Quiz de cours                 | **documentaire** — section « Se tester » d'une leçon             |
| Vitrine `/design-system/quiz` | **documentaire** — lecteur déposé dans une page de documentation |

**La branche morte était démontrable, pas supposée** : `concoursSchema` est
`z.enum(["eopan","eopn","alat"])`, `generateStaticParams` n'énumère que ces
trois valeurs, `dynamicParams = false` interdit toute autre URL, et l'ensemble
`CONCOURS_BANC` contenait exactement ces trois valeurs. Le drapeau était donc
toujours vrai et la moitié du gabarit inatteignable.

**Le quiz d'anglais est le seul changement de structure du chantier**, et il
applique une règle que le projet avait écrite dès F4 sans encore avoir à s'en
servir : _si un quiz encastré devient long, chronométré, persistant ou doté d'un
résultat autonome, il doit proposer une entrée explicite vers le Banc, jamais
transformer silencieusement la page documentaire._ Dix à quarante questions
tirées dans toute la banque, avec un résultat final : ce n'était ni court ni
contextuel. Le hub garde son registre et gagne une entrée nommée ; la séance
obtient sa page.

**Puis la valeur par défaut a été retirée.** `variant` est désormais
**obligatoire** sur le lecteur de quiz. Un défaut était le bon choix pendant la
migration — un appelant non examiné ne changeait pas d'apparence tout seul —
et le mauvais une fois la migration finie : un défaut permet d'omettre le choix,
et une omission ne se lit pas dans le code, elle se déduit de son absence.
Désormais le compilateur pose la question à la place d'une relecture.

Conséquence directe et principal acquis : **le contrat d'accessibilité devient
inconditionnel.** Il était porté par un booléen vrai pour `banc` et
`documentaire`, faux pour `legacy` ; les deux registres restants le tenant, le
booléen n'a plus d'objet et disparaît.

## 4. La méthode, et ce qu'elle a coûté

Une recette s'est stabilisée dès F2b et n'a plus changé :

1. **Écrire la référence comportementale AVANT la migration**, la faire passer
   sur la surface non migrée, la rejouer **sans une retouche** après. Ce que la
   migration ne doit pas toucher se prouve alors par un `git diff` vide, pas par
   une affirmation. Aucune de ces références ne nomme une classe CSS — une
   assertion sur `.banc-*` passerait après et échouerait avant, et la preuve
   s'évanouirait.
2. **Mesurer avec une seule variable**, `git stash`, sur compilation de
   production.
3. **Nommer chaque défaut résiduel** plutôt que de l'omettre.

Deux surfaces majeures n'avaient **aucune couverture end-to-end** avant leur
migration : les sept épreuves de famille psychotechniques et SECPIL — le moteur
le plus lourd du produit. Leur référence a donc dû être écrite d'abord.

### Les erreurs commises pendant le chantier, et ce qui les a rattrapées

Elles sont consignées ici parce qu'elles disent où la vérification était
faible, et que les taire rendrait le reste du document moins crédible.

| Erreur                                                                                      | Rattrapée par                         |
| ------------------------------------------------------------------------------------------- | ------------------------------------- |
| Attribution d'un échec CI au lot F4 — reproduit ensuite sur l'arbre de `main` lui-même      | reproduction, puis rétractation       |
| Hypothèse de saturation du pool libuv par Sharp comme cause racine CI                       | ma propre mesure, qui l'a réfutée     |
| Première campagne de mesure psychotechnique déclarant « visibles » des contrôles hors écran | remesure avec `window.scrollTo(0,0)`  |
| Contraste tombé à 4,38:1 en F5 (variante destructive sur surface du Banc)                   | axe, puis correction **à la cause**   |
| Mesure de contraste prise **pendant** une transition CSS (échec 1 fois sur 3)               | attente bornée sur les transitions    |
| Troncature de l'historique de trois épreuves en F11 (borne 20 imposée là où elle valait 10) | **relecture du diff — aucun test**    |
| Prop `entete` ajoutée sans être rendue (la page perdait son `<h1>`)                         | avertissement ESLint, avant tout test |
| Plantage de prérendu en F7b (calcul des trois écrans dans toutes les phases)                | le build                              |
| Contrôle de référence écrit à l'envers (faux pour les dominos, qui montrent un exemple)     | relecture avant intégration           |

**Les deux plus instructives ne sont pas les plus graves.** La troncature
d'historique de F11 aurait effacé le travail d'utilisateurs, et **aucun test ne
l'a vue** : les contrôles portaient sur le contrat du module, pas sur la
fidélité de la reprise site par site. La rétractation du diagnostic CI, elle,
rappelle qu'un mécanisme démontré n'est pas une cause établie.

## 5. Ce qui reste ouvert, et qui n'est pas fermé par ce document

Rien de ce qui suit n'est un oubli : chaque point a été relevé, examiné, et
laissé ouvert pour une raison écrite.

| Sujet                                                                                                   | Pourquoi il reste ouvert                                                                 |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Formes imbriquées à 967 px en 1440 × 900** — seul relevé encore hors du premier écran                 | son tutoriel est le plus haut des sept ; le raccourcir est une décision **éditoriale**   |
| **`sizes` fautif sur `dossier`, `cahier`, `situation`, `lecon-fiche`**                                  | défaut systémique nommé au lot R-01, hors périmètre du registre                          |
| **Défauts d'audit R-03 à R-10**                                                                         | **Ligne erronée — voir la rectification ci-dessous**                                     |
| **Contention CI intermittente**                                                                         | cause racine non établie ; reproduite sur l'arbre de `main`, donc antérieure au chantier |
| **Branches distantes obsolètes** (`correctif/index-recherche-vercel`, `diagnostic/planche-notice-load`) | ménage, sans effet sur le produit                                                        |

> **Rectification du 2026-08-04, le jour même.** La ligne « défauts d'audit
> R-03 à R-10 » est **fausse**. Cette numérotation n'existe nulle part dans le
> dépôt : le registre des défauts de recette ne compte que **R-01** (CI rouge
> sur `main`) et **R-02** (deux titres de niveau 1 sur
> `/psychotechnique/orientation`), **tous deux soldés**. Je l'ai écrite de
> mémoire sans la vérifier, et rien ne la soutenait.
>
> Elle est rectifiée plutôt que laissée en place, malgré l'engagement de
> non-rectification annoncé en tête de ce document. La raison : cet engagement
> protège les **constats** — mesures, dates, arbitrages — contre une réécriture
> commode a posteriori. Il ne couvre pas une référence inventée, dont le
> maintien ferait chercher à un lecteur un registre qui n'existe pas. Le
> constat n'est pas corrigé ; une invention est retirée, en le disant.
>
> Ce qui reste réellement ouvert du côté de la recette est consigné ailleurs,
> et sous une autre forme : les **quatre limites assumées de la V1** listées
> dans [`audit-preproduction.md`](audit-preproduction.md) §« Limites connues »
> — historiques locaux à l'appareil en attendant Supabase, examen blanc en QCM
> pur, lecture d'instruments et multi-tâches psychotechniques reportées,
> cartes sans implantations outre-mer. Ce sont des **reports de périmètre**,
> pas des défauts.

## 6. État de la déploiabilité

**Mis en ligne le 2026-08-04**, immédiatement après cette clôture : `main` est
passé de `61a9499` (lot F3) à `0ebef57` (lot F12) en avance rapide, 23 commits.
Avant ce déploiement, seules `/entrainement/eopan` et `/reviser` étaient
vérifiées en production ; tout le reste du chantier attendait, la mise en ligne
ayant été explicitement suspendue à cette clôture.

Vérifié en production après déploiement : `/anglais/quiz` répond 200 et **sert
réellement le registre** (`main class="… banc"`, `.banc-cadre` présents dans le
HTML servi — la vérification porte sur le style servi, pas sur la seule présence
d'une classe, conformément à la garde du lot F2a).

- `npm run check` : vert — 837 tests unitaires, 0 erreur, 2 avertissements
  préexistants (`formes.ts`, `triangles.ts`, variable `int` non utilisée).
- Campagne Playwright complète : **996 réussis, 14 ignorés, 0 échec**, sur
  compilation de production.
- Aucune exclusion axe sur l'ensemble de la campagne.

---

## Annexe — les documents qui font autorité après cette clôture

- [`design-system.md`](design-system.md) — la doctrine des registres, la règle
  du titre principal, les jetons `--bc-*`.
- [`etat-actuel.md`](etat-actuel.md) — l'état du jour, avec la définition de
  chaque nombre.
- [`dette-technique.md`](dette-technique.md) — DT-002 y figure désormais parmi
  les dettes **soldées**, avec ce qui l'a fermée.
- [`CHANGELOG.md`](CHANGELOG.md) — le détail lot par lot.
