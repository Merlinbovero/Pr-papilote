# ADR-0004 — Examens blancs générés par moteur paramétrique

- Statut : accepté
- Date : 2026-07-07 (ch. 6)

## Problème

Comment produire les examens blancs : collections de questions figées, ou génération depuis la banque ?

## Options étudiées

1. **Collections statiques** : chaque examen est une liste de questions écrite à la main.
2. **Moteur paramétrique** : l'examen est défini par des épreuves (thèmes, compétences, concours, niveaux, nombre, durée, barème) qui sélectionnent dans la **banque unique**.

## Choix retenu

Option 2. `examSchema` décrit des épreuves paramétriques ; la sélection est déterministe par graine, pondérée (jamais-vues > anciennes > récentes), avec scoring par format et barème à plancher zéro. Une liste explicite reste possible pour **reproduire un format officiel** sourcé et daté.

## Raisons

- Les examens blancs ne doivent **jamais** être des quiz différents : ils doivent refléter la banque et rester frais à chaque passage.
- Une seule source (la banque) évite la duplication et garde les statistiques cohérentes.
- Les statistiques d'examen n'alimentent que le mode Progression.

## Conséquences

- Moteur pur et testé (`src/features/quiz/engine.ts`).
- Ajouter un concours ou un thème enrichit automatiquement les examens sans réécriture.
