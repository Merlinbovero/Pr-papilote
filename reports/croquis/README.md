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
décrivent exactement la même chose. Les versionner rend donc leurs évolutions
lisibles dans l'historique, ce qui est précisément l'intérêt : une fiche qui
gagne un croquis, un SVG qui devient orphelin, un statut qui bascule se voient
alors dans un diff.

## Comment le déterminisme se prouve

`contentDigest` est l'empreinte SHA-256 de tout le rapport **sauf sa
provenance**. Deux exécutions sur le même contenu donnent la même empreinte ;
un diff qui ne toucherait que `generatedAt` est donc démontrablement sans
effet.

**La première version datait au jour UTC** et se disait identique à l'octet
près. C'était vrai le même jour, et cela créait une ambiguïté le lendemain : un
rapport inchangé affichait la veille, sans qu'on puisse distinguer « le contenu
n'a pas bougé » de « le rapport n'a pas été régénéré ». Tronquer une date au
jour n'apporte rien et coûte cette confusion. `generatedAt` porte donc
l'**instant complet**, et la preuve de reproductibilité est passée à
l'empreinte — qui la démontre au lieu de l'affirmer.

L'état réellement mesuré est identifié par `sourceCommit` — et il n'est pas
`HEAD` : c'est le dernier commit ayant touché les entrées lues (`content/` et
le registre des interactions). Sans cela, le commit qui enregistre le rapport
modifierait le rapport suivant, et celui-ci n'aurait aucun point fixe.

## Ce que compte l'inventaire

`yamlFilesScanned` compte **tous les fichiers YAML de `content/`**, banque de
questions comprise — ce n'est ni le nombre de fiches, ni le total employé par
les rapports antérieurs à ce chantier. La répartition `yamlDocumentsByKind` du
rapport donne le détail, et « fiche » y est défini comme le chargeur le
définit : un YAML placé sous un dossier de module de `modules.json`.

## Reconstruction

Ce dossier a été perdu une première fois avec l'ensemble du lot C1, faute
d'avoir été poussé. La règle qui en découle : **aucun travail significatif ne
reste uniquement dans le conteneur local.**
