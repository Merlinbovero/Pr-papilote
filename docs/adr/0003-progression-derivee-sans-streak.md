# ADR-0003 — Progression dérivée, jamais stockée, sans streak

- Statut : accepté
- Date : 2026-07-07 (ch. 7)

## Problème

Comment calculer et présenter la progression (taux de réussite, maîtrise, objectifs) sans incohérences, et sans créer de pression malsaine ?

## Options étudiées

1. **Compteurs stockés** (nombres de bonnes réponses, séries de jours) mis à jour à chaque action.
2. **Dérivation à la demande** depuis les faits bruts (`question_attempts`, `study_sessions`), plus **aucun streak**.

## Choix retenu

Option 2. Toute statistique est **dérivée** de la source de vérité append-only ; aucun compteur n'est stocké. Les seuils de maîtrise sont **configurables** (jamais codés en dur). **Aucun système de série de jours** ; on mémorise un point de reprise, jamais un compteur de jours consécutifs. Tout est strictement privé.

## Raisons

- Un compteur stocké **diverge** tôt ou tard ; une correction rétroactive du contenu se propage partout avec la dérivation.
- Un streak crée une pression quotidienne contraire à la philosophie (préparation de 8–18 mois : montrer le chemin parcouru, pas juger).
- La confidentialité (RLS, aucune comparaison) est un principe, pas une option.

## Conséquences

- Fonctions pures et testées (`src/lib/progression/`) ; câblage lecture différé à l'intégration.
- Un streak resterait un jour possible, mais totalement optionnel.
