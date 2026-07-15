# ADR-0001 — Le contenu vit en Git, jamais en base

- Statut : accepté
- Date : 2026-07-07 (consacré ch. 5 et 8)

## Problème

Où stocker le contenu documentaire (fiches, questions, documents, images) : base de données ou fichiers versionnés ?

## Options étudiées

1. **Tout en PostgreSQL** : contenu et données utilisateur dans la même base.
2. **Contenu en Git (fichiers), données utilisateur en PostgreSQL** : deux supports, une frontière stricte.

## Choix retenu

Option 2. Le contenu est du texte structuré (YAML + Markdown) versionné dans `content/`, validé par schémas Zod au chargement. PostgreSQL ne stocke que les données utilisateur, référençant le contenu par ID texte **sans clé étrangère**.

## Raisons

- Le contenu est **relu, diffé, tracé** comme du code (workflow éditorial, historique Git, motifs de révision).
- **Aucun secret requis** pour lire le contenu → build et tests reproductibles, cache CDN maximal.
- Séparation nette des responsabilités : l'éditorial n'est jamais couplé aux données personnelles.

## Conséquences

- Une migration du contenu vers PostgreSQL resterait possible mais exige une présentation/ADR séparée et chiffrée (arbitrage ch. 5).
- Les routes documentaires n'instancient jamais le client Supabase (AGENTS.md règle 8).
