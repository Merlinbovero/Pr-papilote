# Dette technique

La dette technique reste **visible** (ch. 10 §8). Toute simplification provisoire est documentée ici : une petite dette **connue** vaut mieux qu'une architecture compliquée et incomprise. Ce registre distingue les **reports assumés** (décisions de séquencement, sans dette réelle) de la **dette** proprement dite (raccourcis à rembourser).

## Reports assumés (différés par décision, pas de dette)

| Sujet                                                               | État actuel                                                          | Levée prévue                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| Câblage Supabase (lecture/écriture progression, favoris, objectifs) | Fonctions pures et migrations prêtes ; état « non configuré » propre | Intégration Supabase (V1)      |
| Authentification effective                                          | Pages et Server Actions prêtes, sans clés                            | Intégration Supabase (V1)      |
| Lighthouse CI                                                       | Budgets consignés (`qualite-technique.md`)                           | Après premier déploiement (V2) |
| Monitoring runtime (Sentry) + analytics anonymes                    | Point d'accroche `console.error` dans les frontières d'erreur        | Intégration (V2)               |
| Métriques de recherche anonymes                                     | Contrat prévu, non branché                                           | Intégration (V2)               |

Ces éléments sont des **choix de séquencement** validés (le build et les tests ne dépendent jamais des secrets). Ils ne constituent pas une dette : rien n'est à « défaire ».

## Dette réelle (raccourcis à rembourser)

| ID     | Description                                                                                                                             | Impact | Remboursement envisagé                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| DT-001 | `content:check` s'exécute via Vitest (le rapport complet s'affiche surtout à l'échec) plutôt qu'en CLI dédiée avec sortie systématique. | Faible | CLI dédiée si le volume de contenu le justifie (évite d'ajouter `tsx` prématurément). |

## Convention

Toute nouvelle dette acceptée est ajoutée ici **dans le commit qui l'introduit**, avec un identifiant `DT-NNN`, son impact et son plan de remboursement. Une dette non consignée est un défaut de gouvernance.
