# Rapports du chantier Croquis

**Tous les fichiers de ce dossier sont générés.** La source de vérité est le
script qui les produit, jamais le fichier lui-même :

| Fichier                           | Producteur                            |
| --------------------------------- | ------------------------------------- |
| `inventory.json` · `inventory.md` | `scripts/audit-croquis-inventory.mjs` |
| `validation-humaine/*`            | `scripts/audit-croquis-sample.mjs`    |

Ne pas les modifier à la main : la génération suivante écraserait la retouche.

## Pourquoi ce dossier est versionné

Ces rapports sont **déterministes** — deux exécutions sur le même contenu
donnent des fichiers identiques à l'octet près. Les versionner rend donc leurs
évolutions lisibles dans l'historique, ce qui est précisément l'intérêt : une
fiche qui gagne un croquis, un SVG qui devient orphelin, un statut qui bascule
se voient alors dans un diff.

## Reconstruction

Ce dossier a été perdu une première fois avec l'ensemble du lot C1, faute
d'avoir été poussé. La règle qui en découle : **aucun travail significatif ne
reste uniquement dans le conteneur local.**
