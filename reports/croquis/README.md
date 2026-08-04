# Rapports du chantier Croquis

**Tous les fichiers de ce dossier sont générés.** La source de vérité est le
script qui les produit, jamais le fichier lui-même :

| Fichier                           | Producteur                            | Commande                    |
| --------------------------------- | ------------------------------------- | --------------------------- |
| `inventory.json` · `inventory.md` | `scripts/audit-croquis-inventory.mjs` | `npm run croquis:inventory` |
| `validation-humaine/*`            | `scripts/audit-croquis-sample.mjs`    | `npm run croquis:sample`    |

Ne pas les modifier à la main : la génération suivante écraserait la retouche.
Ils sont exclus de Prettier (`.prettierignore`, nommés un par un) — sans quoi
Prettier les réécrirait, le générateur les réécrirait à son tour, et
`format:check` resterait rouge indéfiniment.

## Pourquoi ce dossier est versionné

Ces rapports sont **déterministes** — deux exécutions sur le même contenu
donnent des fichiers identiques à l'octet près. Les versionner rend donc leurs
évolutions lisibles dans l'historique, ce qui est précisément l'intérêt : une
fiche qui gagne un croquis, un SVG qui devient orphelin, un statut qui bascule
se voient alors dans un diff.

Le déterminisme a **une limite, et une seule** : le champ `generatedAt` porte la
date UTC du jour, donc une régénération le lendemain change ce champ même si
rien n'a bougé. Le champ qui identifie l'état réellement mesuré est
`sourceCommit` — et il n'est pas `HEAD` : c'est le dernier commit ayant touché
les entrées lues (`content/` et le registre des interactions). Sans cela, le
commit qui enregistre le rapport modifierait le rapport suivant, et celui-ci
n'aurait aucun point fixe.

## Reconstruction

Ce dossier a été perdu une première fois avec l'ensemble du lot C1, faute
d'avoir été poussé. La règle qui en découle : **aucun travail significatif ne
reste uniquement dans le conteneur local.**
