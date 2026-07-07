# Taxonomie et métadonnées

## Hiérarchie unique

```
Module (5, référentiel)
└─ Catégorie (référentiel fermé, identique entre les 3 concours)
   └─ Sous-catégorie (référentiel fermé, optionnelle)
      └─ Fiche (unité documentaire)
         ├─ Documents associés   (relation « source »)
         ├─ Questions associées  (relation « évalue », inversée)
         ├─ Quiz                 (assemblages sur la banque)
         ├─ Sources              (métadonnée obligatoire)
         └─ Liens associés       (relations typées, voir relations-et-quiz.md)
```

### Décision structurante : la sous-catégorie n'est PAS un segment d'URL

Une fiche reste à `/{module}/{categorie}/{slug}` quelle que soit sa sous-catégorie. La sous-catégorie est une **métadonnée d'organisation** : elle groupe les fiches dans les hubs de catégorie, filtre la recherche, structure les quiz. Raison : les regroupements évoluent (on scindera « Appareils » en avions de chasse / transport / hélicoptères / drones quand le volume l'exigera) — si la sous-catégorie était dans l'URL, chaque réorganisation casserait des liens. Ici, réorganiser = modifier une métadonnée.

Exemples de sous-catégories initiales (référentiel à enrichir à la demande, jamais à la volée) :

| Catégorie                      | Sous-catégories                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `appareils` (concours)         | avions-de-chasse · avions-de-transport · helicopteres · drones · avions-ecole · patrouille-maritime        |
| `meteorologie` (fondamentaux)  | atmosphere · masses-d-air-et-fronts · nuages-et-precipitations · phenomenes-dangereux · cartes-et-messages |
| `culture-militaire` (concours) | traditions · organisation-generale · operations                                                            |

## Identifiants

- **ID de contenu** : `module.categorie.slug` au moment de la création (ex. `eopn.appareils.rafale-b`), **gelé à vie**. Après création il est opaque : si la fiche change de catégorie ou de titre, l'ID ne bouge pas — c'est lui que la base utilisateur, les relations et les questions référencent. La CI interdit la disparition d'un ID référencé.
- **Slug d'URL** : kebab-case français, stable sauf nécessité ; un changement de slug impose une redirection permanente (à consigner dans la config).
- **Questions** : `q.` + domaine + numéro libre gelé (ex. `q.meteo.0042`). **Termes** : `terme.finesse`. **Documents** : `doc.` + slug (ex. `doc.arrete-eopan-2026`). **Quiz** : `quiz.` + slug. **Schémas** : `schema.` + slug.

## Tags

Vocabulaire **contrôlé** dans `content/_referentiels/tags.json` : `{ slug, label, synonymes[] }`. Quelques centaines au maximum, transverses aux modules (`rafale`, `porte-avions`, `navigation-estime`, `bia`…). Créer un tag = modifier le référentiel (relu en PR), jamais un champ libre dans une fiche. Les synonymes alimentent la recherche (« CDG » → Charles de Gaulle).

## Dictionnaire des métadonnées

### Identité (obligatoires)

| Champ                 | Rôle                                                                         | Exploité par                                     |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `id`                  | Identifiant gelé                                                             | tout (progression, relations, quiz)              |
| `type`                | Un des 17 types de fiche (voir modeles-de-fiches.md)                         | rendu (gabarit), recherche (filtre)              |
| `title` / `slug`      | Titre affiché / segment d'URL                                                | SEO, recherche                                   |
| `summary`             | Résumé d'une à deux phrases                                                  | résultats de recherche, cartes, meta description |
| `module` / `category` | Rattachement taxonomique                                                     | navigation, recherche contextuelle, progression  |
| `subcategory`         | Optionnelle (référentiel)                                                    | hubs, filtres, quiz                              |
| `tags[]`              | Slugs du référentiel                                                         | recherche, recommandations, sélecteurs de quiz   |
| `concours[]`          | Concours concernés (`eopan`/`eopn`/`alat`), même pour une fiche Fondamentaux | filtres, quiz par concours, progression          |

### Pédagogie

| Champ         | Valeurs                                           | Exploité par                          |
| ------------- | ------------------------------------------------- | ------------------------------------- |
| `level`       | 1 découverte · 2 concours · 3 expert              | recommandations, parcours guidés      |
| `difficulty`  | 1–5 (questions uniquement)                        | sélecteurs de quiz, SRS, statistiques |
| `readingTime` | **Calculé au build** (mots / 200), jamais déclaré | affichage, recommandations            |

### Traçabilité

| Champ           | Règle                                                                                                                                 | Exploité par                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `createdAt`     | Déclaré à la création                                                                                                                 | tri, rapports                                       |
| `updatedAt`     | **Calculé** depuis l'historique Git                                                                                                   | affichage, flux « récemment mis à jour »            |
| `verifiedAt`    | Déclaré **à chaque vérification humaine** ; affiché sur la fiche                                                                      | confiance, rapport de fraîcheur                     |
| `author`        | Identifiant du rédacteur-valideur                                                                                                     | audit                                               |
| `sources[]`     | ≥ 1 obligatoire : `{ title, url?, kind: officiel/institutionnel/presse/ouvrage, consultedAt }` ; la première est la source principale | affichage, crédibilité                              |
| `status`        | `brouillon` → `relecture` → `publie` → `a-reverifier`                                                                                 | publication (seul `publie` sort au build), rapports |
| `schemaVersion` | Version du modèle de fiche                                                                                                            | migrations de contenu                               |

### Règle de validité périssable

`geopolitique`, `retex`, `conditions`, `selection` : une fiche dont `verifiedAt` dépasse **12 mois** passe automatiquement en `a-reverifier` au rapport (6 mois pour les conditions d'un concours). Les autres catégories : 24 mois.
