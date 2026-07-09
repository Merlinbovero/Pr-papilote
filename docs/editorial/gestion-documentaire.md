# Gestion documentaire et qualité éditoriale

**Doctrine officielle (Volume II, chapitre 8 — validé).** Le contenu est l'actif principal de PrépaPilote : le code permet de le consulter, il est le produit. Toute décision technique protège sa **qualité**, sa **pérennité** et sa **cohérence**. On préfère publier **moins mais mieux** : chaque fiche publiée est une référence.

Ce chapitre **consacre** une chaîne éditoriale construite aux chapitres 3 à 7 et comble quatre manques (historique/motif, état éditorial unifié, notice de document consultable, contrôle qualité outillé).

## Workflow éditorial (déjà en vigueur)

Six statuts (`contentStatusSchema`) : `brouillon → relecture → validee → publie`, plus `a-mettre-a-jour` (servie avec avertissement) et `archivee`. En production, seuls `publie` et `a-mettre-a-jour` sortent ; hors production, `relecture`/`validee` sont prévisualisables. Une fiche **incomplète reste en relecture** — jamais publiée par précipitation.

## Sources

Toute information factuelle importante est reliée à une source (`sourceSchema` : `title`, `url?`, `kind`, `consultedAt`). Hiérarchie de fiabilité (§2) portée par `kind` : `officiel` > `institutionnel` > `ouvrage` > `presse`. Minimum **une source**, la première est principale.

## Documents (notice consultable — §3, §10)

Un document public est un objet documentaire (`documentNoticeSchema`) : `title`, `issuer`, `publishedAt`, `kind`, **`summary`** (résumé de consultation), `officialUrl`, `rights` (`lien-seul` / `rediffusion-autorisee` / `rediffusion-accordee`), `storagePath?`. Un document `lien-seul` ne peut pas héberger de binaire.

La **notice se consulte sur le site** (`/documents/[id]`, composant `NoticeDocument`) : titre, émetteur, date, résumé, fiches associées. Le lien officiel et le téléchargement (si le droit est établi) **s'ajoutent** à la consultation, ils ne la remplacent jamais. Les fiches déclarent leurs documents via `relations.documents` ; l'existence de chaque document est vérifiée au chargement (erreur bloquante).

## Images (§4)

`imageSchema` : `author`, `source`, `license`, `date`, `description`, `alt` (obligatoire). **Aucune image sans droit établi.** Binaires en Storage, jamais en Git. Visuels officiels ou librement diffusables privilégiés.

## Versions et historique (§5)

`version` (compteur d'évolutions significatives), `author`, `reviewer?`, `createdAt`, `verifiedAt`. Git reste la vérité des diffs ; un registre structuré **`revisions[]`** porte le **motif** de chaque évolution (`date`, `version`, `motif`, `author`, `reviewer?`), affiché sur la fiche (`RevisionHistory`) et vérifié par le contrôle qualité. Règle d'intégrité : la dernière révision doit coïncider avec `version`, versions uniques, dates croissantes. Une fiche n'est jamais modifiée sans laisser de trace.

## État éditorial unifié (§6)

Les trois marqueurs « À jour / À vérifier / Mise à jour nécessaire » dérivent d'**une seule source** (`editorialState`, statut × fraîcheur) :

- `mise-a-jour-necessaire` : décision humaine explicite (`status = a-mettre-a-jour`), prioritaire ;
- `a-verifier` : cycle de fraîcheur dépassé (`freshness.ts`, 6 / 12 / 24 mois selon la nature) ;
- `a-jour` : dans les délais, sans signalement.

On ne juge jamais la même fiche de deux façons.

## Références croisées (§7)

Dérivées du graphe documentaire : fiches liées, documents liés, quiz liés (relation `évalue`), compétences concernées (`competencies[]` des questions), termes du glossaire. Aucune fiche ne vit seule.

## Niveaux de lecture (§8, gabarit)

Hiérarchie obligatoire : **N1** comprendre en < 30 s (« L'essentiel »), **N2** réviser en quelques minutes (sections), **N3** étudier en profondeur (strate « Maîtriser »), **N4** consulter documents, sources et références. Détaillé dans `gabarit-fiche.md`.

## Contenus obsolètes (§9)

Jamais de suppression pour cause d'ancienneté : une information obsolète est **archivée**, son historique Git conservé, ses relations maintenues quand c'est pertinent.

## Contrôle qualité outillé (§11)

Commande `npm run content:check` (`content-check.ts`, testée). Le **chargement** valide déjà schémas, unicité des IDs, intégrité du graphe et des relations (erreurs bloquantes). Le contrôle ajoute les règles éditoriales transverses :

- **erreurs** : document associé inexistant, date de vérification dans le futur ;
- **avertissements** : fraîcheur dépassée, fiche publiée sans question d'entraînement, document rediffusable sans binaire.

La commande échoue (et affiche le rapport formaté) dès qu'une erreur subsiste ; branchée sur la CI et couverte par `npm run check`.

## Évolutivité (§12)

Le système accueillera plus tard **plusieurs langues**, plusieurs niveaux de lecture et des **variantes par concours** sans toucher aux fondations. Chemin réservé, **sans champ mort aujourd'hui** (règle YAGNI) : langue « fr » implicite (`lang="fr"`), variantes exprimables par IDs stables dédiés, `schemaVersion` déjà présent pour faire évoluer le contrat de façon versionnée. Aucun champ multilingue ou de variante n'est ajouté tant qu'il n'a pas d'usage réel.

## Règle absolue

Le contenu est l'actif principal. On préfère une **architecture éditoriale exigeante** à une production rapide.
