# Inventaire des croquis

<!-- Fichier généré par scripts/audit-croquis-inventory.mjs — ne pas modifier à la main. -->

| Provenance | Valeur |
| ---------- | ------ |
| Instant de génération (UTC) | 2026-08-05T14:33:32.811Z |
| Empreinte du contenu | `4074ef8c694a3e55c91cf8312f84d504a1c70f52d0a675fda54a5e0907463ff2` |
| Commit source | `7dc4e26e07813c3edb067265af3a6aceb2c43998` |
| Date du commit source | 2026-08-05T14:31:18+00:00 |
| Entrées mesurées inchangées | oui |

L'instant de génération change à chaque exécution ; **l'empreinte du contenu
ne change que si le contenu change**. Deux rapports de même empreinte disent
exactement la même chose, quelle que soit leur date.

## Ce que compte ce rapport

`yamlFilesScanned` compte **tous les fichiers YAML de `content/`**, banque de
questions comprise. Ce n'est ni le nombre de fiches, ni le total employé par
les rapports antérieurs à ce chantier : la répartition `yamlDocumentsByKind`
ci-dessous donne le détail, et une fiche y est définie comme le chargeur la
définit — un YAML placé sous un dossier de module de `modules.json`.

## Totaux

| Mesure | Valeur |
| ------ | ------ |
| yamlFilesScanned | 1569 |
| yamlFilesParsed | 1569 |
| yamlRootDocuments | 1569 |
| multiDocumentFiles | 0 |
| parseErrors | 0 |
| svgFilesOnDisk | 106 |
| distinctSchemaIdsReferenced | 106 |
| figureReferences | 107 |
| documentsWithAtLeastOneFigure | 73 |
| orphanSvg | 0 |
| brokenReferences | 0 |
| sharedSchemas | 1 |
| figuresWithMeta | 2 |
| figuresWithoutMeta | 105 |
| figuresWithoutAlt | 0 |
| interactions | 7 |

## Répartitions

### yamlFilesByFolder

| Clé | Nombre |
| --- | ------ |
| alat | 21 |
| cours | 14 |
| culture | 31 |
| eopan | 42 |
| eopn | 30 |
| exercices | 45 |
| fondamentaux | 93 |
| glossaire | 136 |
| lectures | 4 |
| psychotechnique | 21 |
| questions | 1127 |
| videos | 5 |

### yamlDocumentsByKind

| Clé | Nombre |
| --- | ------ |
| cours | 14 |
| exercices | 45 |
| fiche | 238 |
| glossaire | 136 |
| lectures | 4 |
| questions | 1127 |
| videos | 5 |

### documentsWithFigureByModule

| Clé | Nombre |
| --- | ------ |
| alat | 3 |
| eopan | 15 |
| eopn | 3 |
| fondamentaux | 50 |
| psychotechnique | 2 |

### figureReferencesByModule

| Clé | Nombre |
| --- | ------ |
| alat | 3 |
| eopan | 15 |
| eopn | 3 |
| fondamentaux | 84 |
| psychotechnique | 2 |

### figureReferencesByLevel

| Clé | Nombre |
| --- | ------ |
| 1 | 85 |
| 2 | 22 |

## Anomalies

### Erreurs d'analyse YAML (0)

_(liste vide)_

### Fichiers portant plusieurs documents YAML (le second serait ignoré en silence) (0)

_(liste vide)_

### SVG orphelins (présents sur disque, cités par aucun contenu) (0)

_(liste vide)_

### Références cassées (citées, absentes du disque) (0)

_(liste vide)_

### Figures sans texte alternatif (0)

_(liste vide)_

## Couverture des métadonnées scientifiques

### Figures portant le contrat `meta` (2)

- `chaine-anemobarometrique` — `content/fondamentaux/instruments/chaine-pitot-statique.yaml`
- `triangle-des-vitesses` — `content/fondamentaux/meteorologie/le-vent.yaml`

### Croquis partagés par plusieurs contenus (1)

- `nord-vrai-magnetique` — `content/fondamentaux/navigation/cap-route-et-derive.yaml`, `content/fondamentaux/navigation/declinaison-magnetique.yaml`

## Interactions enregistrées

- `axes-gouvernes`
- `centrage`
- `forces-et-vecteurs`
- `incidence-decrochage`
- `polaire`
- `soufflerie-zones`
- `venturi`
