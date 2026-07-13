# Plan directeur — Famille ALAT

**Référence officielle de production (ouverte 2026-07-13).** Ce document gouverne la production de la famille **ALAT** (Aviation légère de l'Armée de terre), quatrième et dernière famille de concours avant le Dictionnaire (ordre `docs/roadmap.md` : Fondamentaux → EOPAN → EOPN → ALAT → Dictionnaire). Production en **lots** sous responsabilité éditoriale, même standard gelé. Stratégie validée : **un ancrage solide par catégorie** avant approfondissement (les informations détaillées viendront après la V1).

## 1. Principes

- **Famille de l'aérocombat terrestre** : l'ALAT est la composante **hélicoptères** de l'**Armée de terre**. Elle décrit l'univers de l'**aérocombat** — les machines, les régiments, les écoles, les missions.
- **Pas un « concours » unique** : contrairement à l'EOPN, devenir pilote ALAT passe par le **recrutement** de l'Armée de terre (officier via l'École spéciale militaire de Saint-Cyr, ou sous-officier), **puis** le choix de l'arme ALAT et la **formation à l'EALAT**. La fiche d'ouverture décrit donc la **voie du pilote**, pas un concours au sens strict.
- **URL / ID** : `/alat/<catégorie>/<slug>` · id gelé `alat.<catégorie>.<slug>`.
- **Catégories partagées** : mêmes catégories `concours` que EOPAN/EOPN.

## 2. Différences de vocabulaire (à ne pas confondre)

| Notion  | EOPAN (Marine)               | EOPN (Air)                  | ALAT (Terre)                                                |
| ------- | ---------------------------- | --------------------------- | ----------------------------------------------------------- |
| Aéronef | Avion / hélicoptère embarqué | Avion de chasse / transport | **Hélicoptère** (Tigre, Caïman, Gazelle…)                   |
| Unité   | Flottille (`flottille`)      | Escadron (`escadron`)       | **Régiment** — RHC (`regiment`)                             |
| Milieu  | La mer                       | Le ciel                     | **Le champ de bataille terrestre** (vol tactique, très bas) |
| École   | Lanvéoc / Salon              | Salon-de-Provence           | **EALAT** (Dax + Le Cannet-des-Maures)                      |

Le type de fiche suit : un hélicoptère de combat est de type `helicoptere` ; un régiment d'hélicoptères de combat de type `regiment` (clés d'infobox : `appellation`, `garnison`, `appareils`, `missions`).

## 3. Règle de données ALAT — sourcé ou omis

Identique aux familles précédentes : toute donnée chiffrée est **sourcée ou omise**. Sources : terre.defense.gouv.fr, sengager.fr, Wikipédia.

## 4. Ordre de production (le cadre d'abord, puis un ancrage par catégorie)

1. **La voie du pilote** (`presentation`) — l'ALAT, le métier de pilote d'hélicoptère de l'armée de terre, la formation (recrutement → EALAT Dax → Le Luc → régiment). _Ancre d'ouverture._
2. **Les appareils** (`appareils`) — Tigre (combat), NH90 Caïman (manœuvre/transport), Gazelle, Cougar/Caracal, H120 (école)…
3. **Les régiments** (`unites`, type `regiment`) — les RHC (régiments d'hélicoptères de combat).
4. **Les bases / écoles** — l'EALAT (Dax, Le Cannet-des-Maures), garnisons de l'ALAT.
5. **Concepts / procédures** — l'aérocombat, le vol tactique, l'appui-feu.
6. **Organisation** — l'ALAT au sein de l'Armée de terre.

## 5. Relations et quiz

Mêmes conventions : registres pédagogique **et** factuel ; ≥ 5 questions par fiche, difficultés représentées ; thèmes propres ; compétence `culture-militaire` pour le cadre. Ponts inter-familles bienvenus (le NH90 existe en version Marine _et_ Terre).

## 6. Suivi

L'avancement détaillé est tenu dans `docs/CHANGELOG.md` (un lot = une entrée).
