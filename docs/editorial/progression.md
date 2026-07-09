# Progression utilisateur — le carnet d'entraînement personnel

**Doctrine officielle (Volume II, chapitre 7 — validé).** La progression est le carnet d'entraînement personnel du candidat. Elle vit exclusivement dans l'espace `/progression` (jamais en mode Documentation) et n'existe que pour un utilisateur connecté.

## Une source, six vues

La progression n'est **jamais stockée en compteurs** : elle est **dérivée** à la demande de `question_attempts` (source de vérité append-only), `study_sessions`, `review_items`, `psychotech_results`. Aucune statistique ne peut diverger ; une correction rétroactive se propage partout. Le tableau de bord global et les cinq vues par module (EOPAN, EOPN, ALAT, Fondamentaux, Psychotechnique) sont la même dérivation, filtrée (arbitrage 9).

## Seuils de maîtrise — configurables, jamais codés en dur

Par thème, sur un nombre minimal de questions récentes : **à revoir < 60 % · en cours 60–79 % · maîtrisé ≥ 80 %**. Ces valeurs sont des **paramètres de configuration** (`src/lib/progression/config.ts`), ajustables sans refonte — un thème à 5 questions et un thème à 200 ne pèsent pas pareil, le seuil minimal de questions évite les faux jugements.

## Le parcours dans le temps (axe motivant central)

Une préparation dure 8 à 18 mois. Le tableau de bord montre **le chemin parcouru**, jamais une pression quotidienne :

- **depuis quand** le candidat prépare (première activité) ;
- **heures réellement investies** (cumul des `study_sessions`) ;
- **évolution dans le temps** (courbe hebdomadaire du taux de réussite).

Objectif : constater le progrès, pas se juger.

## Pas de streak

**Aucun système de série de jours** en V1. PrépaPilote n'a pas vocation à créer une dépendance ni une pression quotidienne. On affiche : temps total travaillé, dernière session, moyenne hebdomadaire, objectifs en cours. Un streak éventuel resterait un jour totalement optionnel.

## Tout est privé

Aucune comparaison entre utilisateurs, aucune compétition, aucun classement, aucun score public, aucune moyenne visible. Données de progression strictement privées (RLS). Tout agrégat futur sera strictement anonyme et réservé à l'amélioration de la plateforme.

## Statistiques conservées (toutes dérivées)

Questions réalisées · taux de réussite (global, module, thème, niveau, concours) · temps moyen · thèmes maîtrisés / à revoir · heures de travail · parcours (depuis, total, évolution) · état du carnet d'erreurs.

## Recommandations — règles explicables

1. **Réviser** : questions dues du carnet d'erreurs (priorité à la consolidation).
2. **Renforcer** : thèmes au taux le plus faible → quiz ciblé + fiches (relation `évalue`).
3. **Découvrir** : thèmes non commencés du concours préparé.

Chaque recommandation affiche **son motif**. L'IA pourra raffiner plus tard sans changer le modèle.

## Carnet d'erreurs et liste de révision

Carnet : vue de `review_items` (SRS du chapitre 6). Liste de révision : favoris alimentés par l'action discrète du gabarit de fiche → table `revision_list` (migration 0002, seul ajout de schéma du chapitre).

## Construit maintenant vs différé

- **Maintenant** : fonctions de dérivation pures et testées, composants de tableau de bord au design system, prévisualisation `/design-system/progression` (données fictives), migration 0002.
- **Différé à l'intégration Supabase réelle** : lecture/écriture effective. `/progression` conserve son état « non configuré » propre.
