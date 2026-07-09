# Processus officiel de production des fiches

**Règle officielle de PrépaPilote (validée 2026-07-09).** Toute fiche suit ce processus : **on valide avant de produire**. Le dossier de conception est présenté et validé _avant_ toute rédaction. Cette méthode a guidé tout le projet ; elle devient le standard permanent.

## 1. Dossier de conception (à valider avant rédaction)

Pour chaque fiche, on présente :

1. **La question centrale** à laquelle la fiche répond.
2. **L'objectif pédagogique** général.
3. **La place dans le parcours** de progression.
4. **Les compétences couvertes**, exprimées en **objectifs opérationnels** (verbes d'action — « ce que l'utilisateur sait faire »), avec leur rattachement au référentiel de progression.
5. **Les prérequis**.
6. **Les notions qui en dépendent**.
7. **Les relations prévues** dans le graphe documentaire.
8. **Les documents officiels pressentis** (le cas échéant).
9. **Les illustrations / schémas prévus**.
10. **Les sources principales** (à vérifier avant rédaction).
11. **La structure détaillée** de la fiche (gabarit).
12. **Les quiz dérivables**.

Le propriétaire **valide ce dossier**. Ensuite seulement, la fiche est rédigée.

## 2. Le champ `objectifs[]` — acquis structurés (règle officielle)

Chaque fiche possède des **objectifs pédagogiques explicites et indépendants du contenu rédigé** (`objectifs[]`, champ **obligatoire** du contrat).

- **`objectifs[]` est destiné au système** ; le bloc **« À retenir » est destiné au lecteur**. Les deux sont complémentaires.
- Les objectifs sont des **verbes d'action** précis (« Identifier… », « Convertir… », « Expliquer… ») — jamais des compétences trop générales.
- `objectifs[]` est **réutilisable** par le moteur de progression, les compétences, les quiz, les recommandations et les futurs parcours pédagogiques.
- Distinction des deux couches de compétences : les **objectifs** (précis, par fiche) se **rattachent** au **référentiel fermé de compétences transverses** (`competences.json`) que les questions portent (`competencies[]`) pour l'agrégation de progression.

## 3. Rédaction, vérification, publication

1. **Vérifier les sources** (officiel > institutionnel > ouvrage > presse) avant d'écrire ; on n'invente jamais une donnée ni une source.
2. **Rédiger** sur le gabarit officiel (`gabarit-fiche.md`) : L'essentiel + À retenir, sections (strates _approfondir_ / _maîtriser_), pièges, sources.
   - **Schémas obligatoires dès que leur absence pénalise la compréhension** : les schémas font partie intégrante de la pédagogie. Ils sont **produits en même temps que la fiche** (on ne « repasse » jamais dessus des mois plus tard), sous forme de **SVG originaux, sobres, homogènes au design system et libres de droits** (`content/schemas/`, insérés en ligne, traits en `currentColor` adaptés au thème). Contrat : champ `figures[]` par section (`schemaId`, `alt`, `caption?`, dimensions).
3. **Relations** : une fiche peut rester **temporairement seule** dans le graphe (option validée) ; les relations se créent naturellement à mesure de la production. Jamais de relation vers un ID inexistant.
4. **`content:check`** avant publication (documents, fraîcheur, couverture) ; puis passage en `publie` après validation éditoriale du contenu rédigé.
5. **Une fiche validée avant la suivante** — production progressive, jamais de masse.

## 4. Contrôle qualité avant publication (obligatoire)

Avant tout passage en `publie`, chaque fiche est évaluée sur **neuf critères** :

1. **Exactitude** scientifique et technique.
2. **Qualité et fiabilité des sources**.
3. **Clarté** des explications.
4. **Progression pédagogique**.
5. **Cohérence** avec les autres fiches.
6. **Qualité des illustrations et des schémas**.
7. **Qualité des liens** du graphe documentaire.
8. **Pertinence des objectifs pédagogiques** (`objectifs[]`).
9. **Potentiel de création de quiz**.

## 5. Auto-évaluation critique (à la fin de chaque fiche)

À la fin de chaque fiche, une **auto-évaluation critique honnête** est produite :

- les **points forts** ;
- les **limites** éventuelles ;
- les **améliorations possibles** ;
- un **score global sur 100**, **justifié**.

L'objectif **n'est pas** d'atteindre artificiellement 100/100, mais de **maintenir un niveau de qualité constant** sur tout PrépaPilote. Si l'auto-évaluation révèle une **faiblesse importante**, la fiche est **corrigée avant** publication.

## 6. Portée

Ce processus s'applique à **toutes** les familles (Fondamentaux → EOPAN → EOPN → ALAT → Dictionnaire) et à toute fiche future. Il complète `plan-fondamentaux.md` (le plan directeur de la première famille) et `gestion-documentaire.md` (la chaîne éditoriale).
