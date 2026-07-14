# Plan V1 — bascule vers la première mise en ligne testable

Consigné le 2026-07-14. Directive : **arrêt de la production éditoriale
générale à 150 fiches publiées**, puis construction des fonctionnalités
cruciales de la V1, dans l'ordre :

1. atteindre 150 fiches (18 fiches à forte valeur, sélectionnées sur audit) ;
2. **gel éditorial** + rapport consolidé ;
3. module **BIA** complet (parcours, quiz thématiques, examens blancs de
   100 questions, erreurs, progression par matière) ;
4. premier socle **psychotechnique** (moteur générateur, chronométrage,
   historique — exercices originaux uniquement) ;
5. **cartes** des bases des trois armées (données publiques uniquement) ;
6. audit de préproduction, puis **mise en ligne V1 testable**.

Au-delà de 150, une fiche n'est créée que si elle est indispensable au BIA,
aux psychotechniques ou aux cartes — nécessité justifiée, enrichissement
d'une fiche existante privilégié.

## Audit des 132 fiches (2026-07-14)

Répartition constatée sur disque :

| Module          | Fiches | Observations                                                                                                                                                                                                                                                      |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EOPAN           | 32     | Branche la plus complète (6 appareils, 6 flottilles, 4 BAN). Angle mort : la composante hélicoptères (une seule fiche NH90, aucune flottille hélico) ; la présélection en vol (50S) n'a pas de fiche dédiée.                                                      |
| EOPN            | 19     | Appareils désormais solides (7). Manques structurels : la dissuasion/FAS n'a **aucune fiche** (alors que Mirage IV, 2000N, 1/4 Gascogne y renvoient), pas de ravitailleur (MRTT), 3 bases seulement pour la future carte.                                         |
| ALAT            | 14     | Module le plus mince. Manques : l'**EALAT** (écoles Dax/Le Luc — cœur du cursus et de la carte), la **4e BAC** (référencée par les 4 régiments via le glossaire, sans fiche).                                                                                     |
| Fondamentaux    | 60     | Anglais très fourni (18). Au regard du programme BIA : domaine « étude des aéronefs et engins spatiaux » quasi vide côté français (pas de fiche propulsion, pas d'hélicoptère, pas d'espace), pas d'aérostatique, pas de fronts en météo, pas de radionavigation. |
| Psychotechnique | 7      | Familles couvertes : calcul, suites, dominos, mémoire, attention, vision spatiale + méthodologie. Manquent pour la phase 3 : **matrices** et **lecture d'instruments**.                                                                                           |

Couverture quiz : 669 questions, toutes les fiches ≥ 5 questions. Glossaire :
62 termes. Catégories du référentiel encore vides : `performances`,
`histoire`, `dictionnaire` (fondamentaux) — assumé, pas de fiche de
remplissage.

## Sélection des 18 dernières fiches

Critères : lacunes EOPN/ALAT, cursus et sélections, programme BIA, notions
psychotechniques, bases pour les cartes, nœuds centraux du graphe. Aucune
fiche périphérique ou de remplissage.

### Combler le programme BIA — Fondamentaux (7)

| #   | Fiche                                                 | Justification                                                                                                                           |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `mecanique-du-vol/la-propulsion`                      | Moteurs piston/turbopropulseur/réacteur — domaine 3 du BIA, nœud central (PC-21, Rafale, Atar… y renvoient tous).                       |
| 2   | `mecanique-du-vol/le-vol-de-l-helicoptere`            | Rotor, pas cyclique/collectif, couple — domaine 3 du BIA ET socle commun de toute la branche ALAT (5 appareils sans fiche de principe). |
| 3   | `aerodynamique/l-aerostatique`                        | « Aérodynamique, aérostatique » — au programme officiel du BIA, absent du site.                                                         |
| 4   | `meteorologie/masses-d-air-et-fronts`                 | Domaine 1 du BIA, grand classique de QCM, chaînon manquant entre nuages et phénomènes dangereux.                                        |
| 5   | `navigation/la-radionavigation`                       | VOR/DME/GPS — domaine 4 du BIA, complète la navigation à l'estime existante.                                                            |
| 6   | `culture-aeronautique/les-pionniers-et-l-aeropostale` | Blériot, Lindbergh, Mermoz, Saint-Exupéry — domaine 5 du BIA + culture d'entretien universelle.                                         |
| 7   | `culture-aeronautique/la-conquete-de-l-espace`        | Spoutnik→Apollo→Ariane→ISS — « engins spatiaux » du BIA, totalement absent du site.                                                     |

### Notions psychotechniques — phase 3 (2)

| #   | Fiche                                                | Justification                                                                           |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 8   | `psychotechnique/exercices/les-matrices`             | Famille prioritaire de la phase 3 sans fiche de méthode.                                |
| 9   | `psychotechnique/exercices/la-lecture-d-instruments` | Épreuve emblématique des sélections pilote ; pont direct vers les 5 fiches instruments. |

### Cursus et sélections (2)

| #   | Fiche                                                           | Justification                                                                                                                                 |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | `fondamentaux/facteurs-humains/l-aptitude-medicale-du-navigant` | La visite CEMPN concerne les trois concours — étape redoutée, informations publiques, aucune fiche.                                           |
| 11  | `eopan/selection/la-preselection-en-vol`                        | L'étape 50S/Cap 10 (~7 mois) est une phase réelle et distincte du parcours EOPAN, aujourd'hui résumée en trois lignes dans la fiche concours. |

### EOPN (4)

| #   | Fiche                                                 | Justification                                                                                                                          |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 12  | `eopn/organisation/les-forces-aeriennes-strategiques` | Nœud central manquant du graphe dissuasion (Mirage IV → 2000N → Rafale, 1/4, C-135→MRTT).                                              |
| 13  | `eopn/appareils/mrtt-phenix`                          | Le ravitailleur A330 MRTT — pilier de la dissuasion et de la projection, filière pilote de transport ; données actuelles re-vérifiées. |
| 14  | `eopn/bases/istres`                                   | BA 125 — FAS/MRTT, EPNER, essais en vol ; indispensable à la carte AAE.                                                                |
| 15  | `eopn/bases/mont-de-marsan`                           | BA 118 — expérimentation (CEAM), Rafale ; grande base carte AAE.                                                                       |

### ALAT (2)

| #   | Fiche                                                              | Justification                                                                                    |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 16  | `alat/organisation/ecole-de-l-aviation-legere-de-l-armee-de-terre` | L'EALAT (Dax, Le Luc) — cœur du cursus ALAT et de la future carte des écoles.                    |
| 17  | `alat/organisation/la-4e-brigade-d-aerocombat`                     | Référencée par les 4 fiches régiments (via glossaire) sans fiche cible — trou de graphe évident. |

### EOPAN (1)

| #   | Fiche                        | Justification                                                                                           |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| 18  | `eopan/unites/flottille-33f` | Rééquilibre la composante hélicoptères de l'aéronavale (Caïman, Lanvéoc) — lie BAN + NH90 sur la carte. |

Total après production : **150 fiches** (EOPAN 34 · EOPN 23 · ALAT 16 ·
Fondamentaux 67 · Psychotechnique 9) → **gel éditorial** et passage en
phase 2 (BIA).

## Production

Lots de 3-4 fiches avec le protocole habituel complet (sources vérifiées,
≥5 questions, relations, portes qualité, CHANGELOG). Ordre de production :
F1 (BIA-fondamentaux 1-4), F2 (BIA-culture 5-7 + 11), F3 (psychotechnique
8-9 + 10), F4 (EOPN 12-15), F5 (ALAT 16-17 + EOPAN 18).
