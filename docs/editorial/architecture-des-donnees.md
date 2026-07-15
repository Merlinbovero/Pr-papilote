# Architecture des données

**Doctrine officielle (Volume II, chapitre 5 — validé).** La base documentaire logique de PrépaPilote est la source de vérité : toutes les interfaces, recherches, fiches, quiz et tableaux de bord s'appuient sur elle. Chaque information existe une seule fois et se réutilise partout. La base ne dépend jamais de l'interface ; l'interface dépend de la base. Elle n'est jamais organisée autour des pages.

## Une base logique, deux supports physiques (arbitrage confirmé)

| Support                    | Contenu                                                                                                                  | Pourquoi                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Dépôt Git (`content/`)** | Objets documentaires : fiches (24 familles), termes, documents, images/schémas, questions, quiz, référentiels, relations | Relecture par PR, historique natif (date/auteur/motif/diff), génération statique, sauvegarde par nature |
| **PostgreSQL (Supabase)**  | Données dynamiques : profils, sessions, tentatives, erreurs, progression, résultats psychotechniques, agrégats anonymes  | Transactionnel, multi-appareils, RLS                                                                    |

**Pont** : l'identifiant de contenu — permanent, gelé à vie, jamais de clé étrangère SQL vers le contenu. Titre, URL et alias évoluent ; l'ID jamais (démontré : la recatégorisation des pilotes n'a déplacé aucune relation).

**Règle de migration** : toute proposition de bascule du contenu éditorial vers PostgreSQL devra être présentée séparément — coûts, avantages, risques — avant toute action. Ce n'est pas la trajectoire actuelle.

## Socle commun de métadonnées (tous les objets)

id · titre · slug · résumé · famille · concours[] · statut éditorial (6 états) · date de création · **auteur** · **relecteur** (valideur, distinct de l'auteur) · **version** (compteur incrémenté à chaque évolution significative) · mots-clés (tags) · alias · niveau (si pertinent) · sources · date de vérification. La date de mise à jour est **calculée** depuis Git, jamais déclarée. Les champs spécifiques viennent ensuite (modèles d'infobox par famille).

## Ressources indépendantes

- **Documents** : objets autonomes (notice + binaire en Storage selon droits), associés à N fiches par la relation `source`, importés une seule fois.
- **Images** : objets autonomes (`image.slug`) avec **auteur, source, licence, texte alternatif, date, description** obligatoires ; binaire en Storage ; réutilisables par la relation `illustre`. Aucune image sans licence vérifiée.
- **Questions** : autonomes, avec **thème** explicite + niveau + fiches liées (`evalue`, ≥ 1) + réponse + explication + références. Jamais liées à une page.

## Relations

Stockées séparément du contenu rédigé (bloc `relations` des métadonnées, jamais dans la prose). Chaque arête : source, cible, type (prédicat fermé ou relation pédagogique), importance (3 niveaux, surchargeable), sens (inverse calculé). Le site reconstruit tous les liens ; la CI valide chaque arête.

## Intégrité, suppression, sauvegarde

- **Contraintes** : schémas Zod bloquants côté contenu (l'équivalent des contraintes de colonnes) ; FK `ON DELETE CASCADE` limitées aux tables utilisateur ; RLS refus par défaut.
- **Suppression contrôlée** : un objet ne se supprime pas, il s'archive (`archivee`) ; la CI interdit la disparition d'un ID référencé. La suppression d'un compte utilisateur ne touche jamais les contenus (aucune FK dans ce sens).
- **Sauvegardes** : Git = sauvegarde complète du documentaire par nature ; Supabase = sauvegardes automatiques + **PITR à activer** ; Storage = **versioning de bucket à activer** — inscrits dans `docs/mise-en-service.md`.

## Index

SQL : composites `(user_id, …)` posés en migration 0001. Contenu : structures pré-calculées au build (id→objet, liens du graphe, index de recherche normalisé sur identifiants, slugs, alias, titres, familles, concours, statuts). Temps de réponse constants après build ; le facteur d'échelle surveillé est le temps de build (génération incrémentale prévue).

## Évolutivité

Nouvelle famille = extension versionnée du contrat, sans toucher aux familles existantes. Nouveaux concours/armées/pays = objets + référentiels. Nouvelles langues = dimension de traduction par objet, IDs inchangés. Côté SQL : `entitlements`/JSONB réservent l'avenir sans migration lourde.
