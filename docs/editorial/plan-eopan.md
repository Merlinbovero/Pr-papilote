# Plan directeur — Famille EOPAN

**Référence officielle de production (ouverte 2026-07-12).** Ce document gouverne la production de la famille **EOPAN** (Élève Officier Pilote de l'Aéronautique Navale — Marine nationale), deuxième famille produite après les Fondamentaux (ordre `docs/roadmap.md` : Fondamentaux → EOPAN → EOPN → ALAT → Dictionnaire). Production en **lots** sous responsabilité éditoriale (mandat V1), la qualité restant prioritaire sur la vitesse.

## 1. Principes

- **Famille de concours, pas de savoir transverse** : contrairement aux Fondamentaux (savoir partagé), EOPAN décrit un **univers concret** — le concours, les appareils, les navires, les bases, les unités, les procédures propres à l'aéronautique navale.
- **URL / ID** : `/eopan/<catégorie>/<slug>` · id gelé `eopan.<catégorie>.<slug>`.
- **Catégories partagées** : `eopan`, `eopn` et `alat` sont des modules `concours` et partagent la **même liste de catégories** (`_referentiels/categories.json`, section `concours`) : `presentation`, `appareils`, `bases`, `unites`, `procedures`, etc. La catégorie est portée par le champ `category:` de la fiche, indépendamment du dossier de rangement.
- **Fiches-objet à infobox** : appareils, navires, bases, unités sont des **objets** → infobox obligatoire (clés requises par type). Le concours et les procédures sont des `concept` / `procedure` (sans infobox).
- **Modèles de référence gelés** : les cinq fiches pilotes (Rafale M, porte-avions Charles de Gaulle, Flottille 11F, CATOBAR, Appontage) sont les modèles officiels de la famille.

## 2. Règle de données EOPAN — sourcé ou omis (validée 2026-07-12)

**Toute donnée chiffrée d'une fiche-objet EOPAN — vitesse, plafond, effectif, dimension, date, quantité — est soit sourcée sur une référence vérifiée, soit omise.** Aucune approximation, aucune valeur « de mémoire », aucun ordre de grandeur inventé pour « remplir » une infobox. Une infobox partielle mais exacte vaut mieux qu'une infobox complète mais approximative. Cette règle applique au périmètre EOPAN la règle-projet « on n'invente jamais une donnée » (AGENTS.md) et le choix éditorial acté par l'utilisateur à l'ouverture de la famille.

Conséquences pratiques :

- une clé d'infobox dont la valeur n'est pas confirmée par une source est **retirée**, pas laissée vide ni approchée ;
- les données sensibles au temps (effectifs, appareils en parc, dates de service) sont datées et rattachées à leur source ;
- en cas de sources divergentes, on retient la plus officielle et on le signale, ou on omet.

## 3. Ordre de production (le cadre d'abord)

1. **Le concours** (`presentation`) — cadre général, métier, conditions et sélection. _Fait : `le-concours-eopan` (lot 13)._
2. **Les appareils** (`appareils`) — sur le modèle du Rafale M : Rafale Marine (déjà pilote), E-2C Hawkeye, NH90 Caïman, Atlantique 2 (ATL2)…
3. **Les navires et bases** (`bases`) — porte-avions Charles de Gaulle (déjà pilote), bases d'aéronautique navale (Lanvéoc-Poulmic, Landivisiau, Lann-Bihoué…).
4. **Les unités** (`unites`) — flottilles (11F déjà pilote), organisation de l'aéronavale.
5. **Les procédures et concepts** (`procedures`) — CATOBAR (déjà pilote), appontage (déjà pilote), catapultage, brin d'arrêt, tour de piste embarqué…

Chaque sous-bloc valide sa cohérence pédagogique avant le suivant ; à l'intérieur d'un sous-bloc validé, production libre en lots.

## 4. Relations et graphe

- Registre **pédagogique** (prérequis/liées) **et** registre **factuel** (prédicats du référentiel) : la famille concours est le terrain naturel des relations factuelles (un appareil _est mis en œuvre par_ une flottille, _opère depuis_ un navire…).
- Les fiches EOPAN s'appuient sur les **Fondamentaux** en prérequis (aérodynamique, instruments, navigation) — jamais de duplication du savoir.

## 5. Quiz

Convention inchangée (`relations-et-quiz.md`) : ≥ 5 questions par fiche, difficultés représentées. Thèmes propres à la famille (`concours-eopan`, puis un thème par sous-bloc), compétence `culture-militaire` pour le cadre du concours, compétences aéronautiques pour les objets techniques.

## 6. Suivi

L'avancement détaillé est tenu dans `docs/CHANGELOG.md` (un lot = une entrée). Ce plan fixe le cadre ; il n'est pas un journal.
