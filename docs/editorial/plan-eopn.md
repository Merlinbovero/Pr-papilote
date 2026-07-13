# Plan directeur — Famille EOPN

**Référence officielle de production (ouverte 2026-07-13).** Ce document gouverne la production de la famille **EOPN** (Élève-officier du personnel navigant — Armée de l'air et de l'Espace), troisième famille produite (ordre `docs/roadmap.md` : Fondamentaux → EOPAN → EOPN → ALAT → Dictionnaire). Production en **lots** sous responsabilité éditoriale (mandat V1), la qualité restant prioritaire sur la vitesse. Même standard gelé que les familles précédentes.

## 1. Principes

- **Famille de concours** : EOPN décrit l'univers concret du **personnel navigant** de l'**Armée de l'air et de l'Espace** — le concours, les appareils, les bases aériennes, les escadrons, les procédures.
- **Pilotes ET NOSA** : l'EOPN recrute le **personnel navigant** au sens large — pilotes (chasse, transport, hélicoptère) **et** navigateurs officiers systèmes d'armes (NOSA).
- **URL / ID** : `/eopn/<catégorie>/<slug>` · id gelé `eopn.<catégorie>.<slug>`.
- **Catégories partagées** : `eopan`, `eopn` et `alat` partagent la **même liste de catégories** (`_referentiels/categories.json`, section `concours`).
- **Modèles de référence** : les fiches EOPAN publiées servent de gabarit (concours, appareil, base, unité, procédure, concept, organisation).

## 2. Différences de vocabulaire avec EOPAN (à ne pas confondre)

L'Armée de l'air et de l'Espace n'emploie pas les mêmes mots que la Marine. Le contenu doit refléter ces différences :

| Notion        | EOPAN (Marine)                   | EOPN (Air et Espace)                          |
| ------------- | -------------------------------- | --------------------------------------------- |
| Base          | **BAN** (type `ban`)             | **Base aérienne (BA)** (type `base-aerienne`) |
| Unité volante | **Flottille** (type `flottille`) | **Escadron** (type `escadron`)                |
| Décollage     | Catapultage (embarqué)           | Décollage sur piste                           |
| Milieu        | La mer, le porte-avions          | La terre, les bases aériennes                 |

Le type de fiche doit suivre : une base aérienne EOPN est de type `base-aerienne` (clés d'infobox : `nomComplet`, `code`, `localisation`, `armee`), un escadron de type `escadron` (`appellation`, `base`, `appareils`, `missions`).

## 3. Règle de données EOPN — sourcé ou omis

Identique à la règle EOPAN (`plan-eopan.md` §2) : **toute donnée chiffrée d'une fiche-objet est sourcée ou omise**, aucune approximation. Codes de base (BA n° / OACI), effectifs, dates : vérifiés sur source officielle (air.defense.gouv.fr, devenir-aviateur.fr, Wikipédia) ou retirés.

## 4. Ordre de production (le cadre d'abord, puis un ancrage par catégorie)

Stratégie validée : établir un **ancrage solide par catégorie** avant d'approfondir chaque groupe.

1. **Le concours** (`presentation`) — cadre général, métier, conditions et sélection (CIRFA → présélection → CSSA Tours → Salon-de-Provence). _Ancre d'ouverture._
2. **Les appareils** (`appareils`) — chasse (Rafale, Mirage 2000), transport (A400M Atlas), entraînement (Alphajet, PC-21), hélicoptère…
3. **Les bases aériennes** (`base-aerienne`) — Salon-de-Provence (BA 701, formation), Tours (BA 705, sélection), bases de chasse (Saint-Dizier, Mont-de-Marsan)…
4. **Les escadrons** (`escadron`) — escadrons de chasse et de transport emblématiques.
5. **Procédures / concepts** — spécificités du vol de chasse, formation en vol, orientation chasse/transport/hélicoptère.
6. **Organisation** — l'Armée de l'air et de l'Espace comme cadre.

## 5. Relations et quiz

Mêmes conventions que les familles précédentes : registres pédagogique **et** factuel ; ≥ 5 questions par fiche, difficultés représentées ; thèmes propres à la famille ; compétence `culture-militaire` pour le cadre, compétences aéronautiques pour les objets techniques.

## 6. Suivi

L'avancement détaillé est tenu dans `docs/CHANGELOG.md` (un lot = une entrée). Ce plan fixe le cadre.
