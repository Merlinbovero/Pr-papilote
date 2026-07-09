# Progression utilisateur — le carnet d'entraînement personnel

**Doctrine officielle (Volume II, chapitre 7 — validé).** La progression est le carnet d'entraînement personnel du candidat. Elle vit exclusivement dans l'espace `/progression` (jamais en mode Documentation) et n'existe que pour un utilisateur connecté.

## Une source, six vues

La progression n'est **jamais stockée en compteurs** : elle est **dérivée** à la demande de `question_attempts` (source de vérité append-only), `study_sessions`, `review_items`, `psychotech_results`. Aucune statistique ne peut diverger ; une correction rétroactive se propage partout. Le tableau de bord global et les cinq vues par module (EOPAN, EOPN, ALAT, Fondamentaux, Psychotechnique) sont la même dérivation, filtrée (arbitrage 9).

## Seuils de maîtrise — configurables, jamais codés en dur

Par thème, sur un nombre minimal de questions récentes : **à revoir < 60 % · en cours 60–79 % · maîtrisé ≥ 80 %**. Ces valeurs sont des **paramètres de configuration** (`src/lib/progression/config.ts`), ajustables sans refonte — un thème à 5 questions et un thème à 200 ne pèsent pas pareil, le seuil minimal de questions évite les faux jugements.

## Compétences transversales (delta validé)

En plus des thèmes, les concours évaluent des **compétences transversales** (calcul mental, raisonnement logique, vision spatiale, mémoire, connaissances aéronautiques…). Elles forment un **référentiel fermé** (`content/_referentiels/competences.json`). Les questions les portent via `competencies[]` ; une question peut solliciter plusieurs compétences. Chaque compétence a sa **progression indépendante**, calculée par **exactement la même logique de maîtrise configurable** que les thèmes (`competencyMastery`, cœur `masteryOf` partagé). Une tentative alimente toutes les compétences qu'elle sollicite.

## Objectifs personnels (delta validé)

Volontairement **simples** et strictement personnels (aucune comparaison, aucun classement). Cinq types fermés : **terminer un domaine**, **réviser un concours**, **réaliser un examen blanc**, **consulter N fiches**, **effectuer N quiz**. L'**avancement est dérivé** à la demande (jamais un compteur stocké) : la table `objectives` ne mémorise que l'intention et une éventuelle date de complétion. L'IA pourra suggérer des objectifs plus tard sans changer le modèle.

## Favoris — une seule notion (delta validé)

**Un seul mécanisme** de mise de côté : les favoris. L'utilisateur ajoute n'importe quel contenu — **fiche, document, carte, quiz** — via l'action discrète du gabarit. « Réviser mes favoris » n'est **qu'une vue** de cette collection, pas un système distinct. Table `favorites` (migration 0002), contenu référencé par ID stable, sans FK vers le contenu.

## Le parcours dans le temps (axe motivant central)

Une préparation dure 8 à 18 mois. Le tableau de bord montre **le chemin parcouru**, jamais une pression quotidienne :

- **depuis quand** le candidat prépare (première activité) ;
- **heures réellement investies** (cumul des `study_sessions`) ;
- **évolution dans le temps** (courbe hebdomadaire du taux de réussite).

Objectif : constater le progrès, pas se juger.

## Pas de streak — mais une mémoire du travail (delta confirmé)

**Aucun système de série de jours** en V1. PrépaPilote n'a pas vocation à créer une dépendance ni une pression quotidienne. Le système **mémorise** en revanche le point de reprise : dernière session, dernier module travaillé, révisions interrompues, dernière activité (`resumePoint`). Il **n'affiche jamais** de compteur de jours consécutifs. Le bloc « Reprendre » traduit cette mémoire en une action immédiate. On affiche par ailleurs : temps total travaillé, dernière session, moyenne hebdomadaire, objectifs en cours. Un streak éventuel resterait un jour totalement optionnel.

## Sobriété du tableau de bord (règle fondamentale)

Le tableau de bord **reste sobre** : il donne immédiatement l'information utile plutôt que d'empiler les graphiques. L'utilisateur comprend en quelques secondes **où il en est**, **ce qu'il devrait travailler aujourd'hui**, **ce qu'il peut reprendre immédiatement**. Ordre d'affichage : _Reprendre_ (action immédiate) → repères du parcours → _À travailler aujourd'hui_ (recommandations, objectifs) → détail secondaire (maîtrise par thème et par compétence).

## Tout est privé

Aucune comparaison entre utilisateurs, aucune compétition, aucun classement, aucun score public, aucune moyenne visible. Données de progression strictement privées (RLS). Tout agrégat futur sera strictement anonyme et réservé à l'amélioration de la plateforme.

## Statistiques conservées (toutes dérivées)

Questions réalisées · taux de réussite (global, module, thème, niveau, concours) · temps moyen · thèmes maîtrisés / à revoir · heures de travail · parcours (depuis, total, évolution) · état du carnet d'erreurs.

## Recommandations — règles explicables

1. **Réviser** : questions dues du carnet d'erreurs (priorité à la consolidation).
2. **Renforcer** : thèmes au taux le plus faible → quiz ciblé + fiches (relation `évalue`).
3. **Découvrir** : thèmes non commencés du concours préparé.

Chaque recommandation affiche **son motif**. L'IA pourra raffiner plus tard sans changer le modèle.

## Carnet d'erreurs et favoris

Carnet : vue de `review_items` (SRS du chapitre 6). Favoris : notion unique alimentée par l'action discrète du gabarit → table `favorites` (migration 0002). « Réviser mes favoris » n'est qu'une vue de cette collection.

## Construit maintenant vs différé

- **Maintenant** : fonctions de dérivation pures et testées (thèmes, compétences, objectifs, reprise, parcours, recommandations), référentiel des compétences, composants de tableau de bord sobre au design system, prévisualisation `/design-system/progression` (données fictives), migrations 0002 (favoris) et 0003 (objectifs).
- **Différé à l'intégration Supabase réelle** : lecture/écriture effective, ajout d'un favori, création/complétion d'un objectif. `/progression` conserve son état « non configuré » propre.
