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

## Dettes soldées

| ID     | Soldée au | Ce qui la fermait                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DT-002 | Lot F12   | **`link-in-text-block` — le lien « Pour approfondir » n'était distingué que par la couleur.** Relevé à l'audit F0b §1 : `hover:underline`, donc aucun soulignement au repos, et une teinte à **1,06:1** contre le gris environnant en registre sombre (`#67a6fb` sur `#a3aab5`, minimum 3:1) — WCAG 1.4.1. Remboursée par étapes : `LienApprofondir` et son soulignement permanent sur le rendu Banc dès F2a, étendue au registre `documentaire` en F4, **puis close en F12 par la disparition de `legacy`**. C'est l'ordre qui compte : tant qu'un appelant pouvait retomber sur le rendu historique **par omission**, la dette restait atteignable, et la fermer aurait été une déclaration, pas un fait. L'exclusion `HORS_PERIMETRE_F1A` de `e2e/fondations-a11y.spec.ts` et le test de dette `e2e/dette-lien-correction.spec.ts` sont supprimés au même commit ; axe tourne désormais **sans aucune exclusion** sur toute la campagne. |

## Convention

Toute nouvelle dette acceptée est ajoutée ici **dans le commit qui l'introduit**, avec un identifiant `DT-NNN`, son impact et son plan de remboursement. Une dette non consignée est un défaut de gouvernance.
