# Relations entre contenus et stratégie des quiz

## Le graphe documentaire

Une fiche ne déclare jamais de « liens » libres : elle déclare des **relations typées** vers des IDs de contenu. Le graphe qui en résulte alimente automatiquement les encarts, la navigation, les recommandations et les quiz.

### Relations dérivées (jamais déclarées)

- **Parent** : la hiérarchie taxonomique (module → catégorie → sous-catégorie) donne la fiche parente de navigation.
- **Enfants** : les fiches rattachées à la même branche (le hub les liste).
- **Questions associées** : inverse de la relation `evalue` portée par les questions.
- **Miroir des relations symétriques** : déclarées d'un seul côté, reflétées au build (règle anti-divergence).

### Relations déclarées (dans les métadonnées)

| Relation         | Sens                                                 | Génère                                                                      | Contrainte CI                                               |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `prerequis`      | fiche → notions à connaître avant                    | encart « Notions préalables » + parcours guidés                             | **graphe acyclique** (un cycle de prérequis casse le build) |
| `complementaire` | symétrique                                           | encart « Notions complémentaires »                                          | cible existante                                             |
| `approfondit`    | fiche spécifique → fiche fondamentale (RBE2 → Radar) | « Notions de base » sur la spécifique, « Applications » sur la fondamentale | cible existante                                             |
| `variante-de`    | symétrique (Rafale B ↔ Rafale M)                     | « Voir également » bidirectionnel + pastille retour de passerelle           | cible existante                                             |
| `illustre`       | schéma → fiches                                      | insertion du schéma, galerie                                                | cible existante                                             |
| `evalue`         | question → fiche(s)                                  | « Questions associées », boucle erreur → fiche                              | **toute question évalue ≥ 1 fiche**                         |
| `source`         | contenu → notice de document                         | encart « Documents », traçabilité                                           | cible existante                                             |

Validation CI sur tout le graphe : chaque cible existe ; aucune fiche publiée orpheline (zéro relation entrante et sortante) ; rapport des nœuds isolés.

## Stratégie des quiz

### La banque centrale est la seule source de questions

Chaque question vit dans `content/questions/`, autonome et auto-porteuse :

- énoncé + type (`qcm`, `vrai-faux`, `association`, `legende-schema`, `calcul`) ;
- réponse(s) correcte(s) et distracteurs plausibles ;
- **explication obligatoire** (c'est elle qui enseigne) + lien `evalue` vers la ou les fiches ;
- `difficulty` 1–5, `tags`, `concours[]`, source éventuelle, `status`.

### Comment une fiche alimente les quiz

1. À la rédaction d'une fiche, la section « Pièges et confusions » et l'infobox fournissent les premières questions (rédigées ou générées).
2. Les questions déclarent `evalue: [fiche]` — jamais l'inverse : la fiche ignore ses questions, l'encart est calculé. Ajouter une question n'exige donc **aucune modification de fiche**.
3. Les données structurées (infobox, grades, bases) permettent une **génération assistée** (« Quel est le code de la BA 118 ? ») : questions marquées `generator`, soumises à la même validation humaine avant `publie`.

### Les quiz sont des règles, pas des listes

Un quiz est défini par un **sélecteur** sur la banque : `{ module?, categories?, sousCategories?, tags?, concours?, difficulty: [min,max], count, timing?, bareme? }` — ou par une liste explicite d'IDs pour les formats à reproduire fidèlement.

- **Quiz de catégorie** : sélecteur sur la catégorie, tirage aléatoire pondéré (questions jamais vues > anciennes > récentes), difficulté adaptée au niveau.
- **Concours blanc** : composition de plusieurs épreuves, chacune avec son sélecteur, son chronométrage et son barème, calqués sur le format officiel du concours (le format lui-même est un contenu sourcé et daté).
- Un même stock de questions sert ainsi un nombre illimité de quiz sans duplication.

### Le module erreurs (carnet d'erreurs)

1. Chaque réponse est enregistrée individuellement (`question_attempts`, append-only — migration 0001).
2. Une réponse fausse crée/actualise un `review_item` avec une échéance de répétition espacée : 1 j → 3 j → 7 j → 14 j → 30 j → 90 j (réinitialisée en cas de nouvel échec).
3. Le quiz « Mes erreurs » est un sélecteur particulier : les questions **dues** (`due_at ≤ maintenant`), les plus anciennes d'abord, filtrables par module.
4. La correction relie chaque erreur à sa fiche (`evalue`) : erreur → lecture → re-test. C'est la boucle d'apprentissage centrale de PrépaPilote.

### Équilibre de la banque

Le rapport éditorial (`content:report`) publie la couverture par catégorie (questions/fiche, répartition des difficultés, part de questions générées). Objectif indicatif à terme : **≥ 5 questions par fiche-notion**, toutes difficultés représentées dans chaque catégorie.
