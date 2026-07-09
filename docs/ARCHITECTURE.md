# Architecture — PrépaPilote

Complément technique de [VISION.md](VISION.md). Ce document décrit _comment_ la plateforme est construite et _pourquoi_.

## Vue d'ensemble : quatre couches

```
┌─ COUCHE CONTENU (dépôt Git) ──────────────────────────────┐
│ content/ : référentiels, fiches, questions, quiz,         │
│ glossaire, notices de documents. Texte structuré validé    │
│ par schémas Zod. Source de vérité unique du documentaire.  │
└──────────────────────┬────────────────────────────────────┘
                       │ lecture au build uniquement
┌─ COUCHE APPLICATION (Next.js App Router, Vercel) ─────────┐
│ Pages statiques générées depuis le contenu (RSC).          │
│ Moteurs horizontaux : rendu de fiche, quiz, recherche,     │
│ progression, exercices psychotechniques (src/features/).   │
└──────┬───────────────────────────────┬────────────────────┘
       │ anonyme, zéro requête          │ authentifié uniquement
┌─ COUCHE RECHERCHE ──────────┐  ┌─ COUCHE UTILISATEUR ─────┐
│ Index construit au build,   │  │ Supabase (région UE) :    │
│ servi statiquement,         │  │ Auth, PostgreSQL (RLS),   │
│ interface unique            │  │ Storage. Référence le     │
│ remplaçable.                │  │ contenu par ID stable.    │
└─────────────────────────────┘  └───────────────────────────┘
```

Principes transverses :

- **Server Components par défaut** ; le JS client n'existe que pour l'interactivité réelle.
- **Le contenu ne va jamais en base ; l'utilisateur ne va jamais dans le contenu.** La consultation documentaire n'instancie jamais le client Supabase.
- Toute donnée traversant une frontière (fichier de contenu, formulaire, réponse Supabase) est validée par **Zod**.
- La logique métier vit en **fonctions pures testées** (`src/lib`, `src/features/*/lib`) ; l'UI orchestre.

## Stack technique

| Couche        | Choix                                                                                                                        | Raison                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Framework     | Next.js 16, App Router, `src/`                                                                                               | Statique + streaming, SEO natif, adapté aux très gros sites de contenu |
| Langage       | TypeScript strict                                                                                                            | Fiabilité sur un gros volume de code                                   |
| Styles        | Tailwind CSS v4 (tokens CSS dans `globals.css`)                                                                              | Design tokens, thème clair/sombre                                      |
| Composants UI | shadcn/ui (radix-nova)                                                                                                       | Primitives accessibles, possédées dans le repo                         |
| Animations    | Framer Motion (+ transitions CSS simples)                                                                                    | Micro-interactions sobres                                              |
| Icônes        | Lucide                                                                                                                       | Cohérent avec shadcn                                                   |
| Tableaux      | TanStack Table                                                                                                               | Tri/filtres headless                                                   |
| Formulaires   | React Hook Form + Zod (pattern `field` shadcn)                                                                               | Schéma = source de vérité                                              |
| Graphiques    | Recharts                                                                                                                     | Dashboards de progression                                              |
| Diagrammes    | React Flow · react-zoom-pan-pinch                                                                                            | Procédures, schémas techniques                                         |
| Recherche     | Index build-time derrière une interface unique (Fuse.js pour la palette ; index plein texte fragmenté type Pagefind à terme) | Pas de serveur de recherche à opérer                                   |
| Utilisateur   | Supabase : Auth + PostgreSQL + Storage, région UE                                                                            | Postgres standard, RLS, types générés                                  |
| Hébergement   | Vercel                                                                                                                       | Déploiements de prévisualisation par PR, natif Next.js                 |
| Tests         | Vitest + Testing Library · Playwright (desktop + mobile)                                                                     | Porte de qualité `npm run check`                                       |

## Structure du dépôt

```
content/                        ← la richesse du projet (texte structuré)
  _referentiels/                modules, catégories, tags, synonymes
  eopan/ eopn/ alat/            fiches par module puis catégorie
  fondamentaux/
  psychotechnique/              configs d'exercices + fiches méthode
  glossaire/  questions/  quiz/  documents/
src/
  app/                          routes = gabarits
  components/ui                 primitives shadcn (design system)
  components/layout              header, footer, sidebar, breadcrumb
  components/content             rendu du contenu structuré (RSC purs)
  components/shared              cartes et blocs métier réutilisés
  features/                     moteurs verticaux (composants + logique colocalisés)
    search/  quiz/  progression/  psychotech/
  lib/content                   schémas Zod, chargeurs, résolution des relations
  lib/supabase                  clients serveur/navigateur, garde de configuration
  lib/                          logique pure (scoring, SRS…)
  hooks/  types/  test/
supabase/migrations/            SQL versionné = seul canal de modification du schéma
scripts/                        validation, index de recherche, intégrité
docs/                           VISION, ARCHITECTURE, design-system, components, CHANGELOG
e2e/
```

## Modèle de contenu

Sept entités (fiche, question, quiz, document, schéma, terme, exercice psychotechnique), chacune avec un **identifiant stable gelé à vie** (ex. `eopn.appareils.rafale-b`) — c'est cet ID que la base utilisateur référence ; slug et titre peuvent changer, l'ID jamais.

**Relations typées** (générant automatiquement les encarts UI) :

- `approfondit` — fiche spécifique → fiche fondamentale (RBE2 → Radar) ;
- `variante-de` — symétrique (Rafale B ↔ Rafale M), génère les « Voir également » bidirectionnels ;
- `illustre` — schéma → fiches ; `évalue` — question → fiche(s) ; `source` — contenu → document.

**Propriété** : chaque contenu a un module propriétaire unique → URL canonique unique (SEO). Les autres modules y accèdent par relations, jamais par copie. Test éditorial anti-doublon : _sujet indépendant de l'armée → Fondamentaux ; objet propre à une armée → son module._

**Référentiels** (`content/_referentiels/`) : modules (5), catégories par module (référentiel fermé), tags contrôlés, synonymes/acronymes pour la recherche. Ajouter une catégorie = ajouter une entrée de données ; hubs, navigation et recherche suivent automatiquement.

## Routes

```
/                               Accueil (5 portes)
/{eopan,eopn,alat,fondamentaux,psychotechnique}          Hub de module
/[module]/[categorie]           Hub de catégorie
/[module]/[categorie]/[slug]    Fiche (à venir)
/dictionnaire/[terme]           Glossaire (à venir)
/recherche                      Recherche globale
/connexion /inscription /mot-de-passe-oublie             Auth
/progression                    Tableau de bord global (authentifié)
/progression/[module]           Les cinq progressions (authentifié)
/compte                         Profil (authentifié)
/design-system                  Catalogue interne (hors production)
```

Gabarits limités (~11) : accueil, hub module, hub catégorie, fiche, fiche-objet, notice document, lecteur quiz, restitution, moteur psychotechnique, progression, recherche. Toute nouvelle page doit répondre à « quel gabarit ? ».

## Base de données (données utilisateur uniquement)

Tables : `profiles`, `study_sessions`, `quiz_attempts`, `question_attempts` (table maîtresse, append-only), `review_items` (répétition espacée), `fiche_progress`, `psychotech_results`, `question_stats` (agrégats anonymes, écrits par rôle de service), `favorites` (notion unique de favori — fiche/document/carte/quiz, migration 0002), `objectives` (objectifs personnels, intention seulement — l'avancement reste dérivé, migration 0003).

Règles :

- **RLS sur toutes les tables**, politique par défaut « refuser », `user_id = auth.uid()` ;
- carnet d'erreurs, cinq progressions, **maîtrise par thème et par compétence**, **avancement des objectifs** et **point de reprise** = **vues calculées** sur `question_attempts`/`study_sessions` (jamais de compteurs stockés qui divergent) ; compétences transversales portées par les questions (`competencies[]`, référentiel fermé `content/_referentiels/competences.json`) ;
- références au contenu par **ID texte stable, sans clé étrangère** (le contenu n'est pas en base) ; intégrité garantie par script CI côté contenu ;
- index composites `(user_id, content_id)` et `(user_id, created_at)` dès le départ.

## Recherche

Interface unique `(requête, filtres) → résultats typés`, deux surfaces (palette Ctrl/Cmd+K instantanée ; page `/recherche` plein texte filtrable), implémentation évolutive derrière l'interface. Recherche contextuelle = pré-filtre sur le module courant + bascule « chercher partout ». Requêtes sans résultat journalisées anonymement (pilotage éditorial).

## Journal des décisions

### 2026-07-07 — Contenu à grande échelle par routes dynamiques

Pages générées par routes dynamiques + `generateStaticParams` depuis le contenu structuré. Pas de duplication de `page.tsx`.

### 2026-07-07 — Vulnérabilité postcss transitive corrigée par override

`next@16.2.10` embarque `postcss@8.4.31` (GHSA-qx2v-qp2m-jg93). Corrigé via `overrides` (`postcss ^8.5.10`). À retirer quand Next mettra à jour.

### 2026-07-07 — Composants formulaire shadcn : pattern `field`

shadcn v4 remplace `form` par `field.tsx` (compatible React Hook Form). Formulaires = `Field` + RHF + Zod.

### 2026-07-07 — Contenu dans le dépôt, utilisateur dans Supabase (Arbitrage 13)

Le contenu en base détruirait le flux éditorial par PR, la génération statique et la sauvegarde par Git. Les entités de contenu sont des schémas Zod validés en CI, pas des tables.

### 2026-07-07 — Pas de proxy/middleware pour l'auth en V1

Next 16 renomme middleware en `proxy.ts`. Les contrôles d'accès se font dans les layouts serveur des routes protégées (suffisant tant que seules `/progression` et `/compte` sont privées). Un proxy de rafraîchissement de session pourra être ajouté à l'intégration Supabase réelle.

### 2026-07-07 — Supabase non configuré = état dégradé propre

Tant que les clés ne sont pas fournies (variables d'environnement), les pages d'authentification et l'espace progression affichent un état « non configuré » explicite. Le build et les tests ne dépendent jamais des secrets.

### 2026-07-07 — La sous-catégorie est une métadonnée, pas un segment d'URL

Les fiches restent à `/{module}/{categorie}/{slug}` ; la sous-catégorie (référentiel fermé) groupe, filtre et structure sans jamais casser d'URL lors des réorganisations. Détail : `docs/editorial/taxonomie-et-metadonnees.md`.

### 2026-07-07 — Système éditorial consigné et machine-vérifiable

L'architecture documentaire complète vit dans `docs/editorial/` (taxonomie, 17 modèles de fiches en 5 familles, métadonnées, graphe de relations, stratégie quiz et documentaire, règles de rédaction). Son contrat exécutoire est implémenté dans `src/lib/content/content-schemas.ts` : fiches (infobox exigée par type d'objet), questions (union discriminée par type, explication et relation « évalue » obligatoires), quiz (sélecteur XOR liste explicite), termes, notices de documents (droits de rediffusion contrôlés).

### 2026-07-07 — Gabarit de fiche : composants prop-pilotés, format de contenu différé

Le gabarit officiel (docs/editorial/gabarit-fiche.md) est implémenté en composants recevant des props typées (`src/components/content/`), validés sur la prévisualisation interne `/design-system/fiche` avec des données explicitement fictives. Le format de fichier du corps des fiches (MDX vs structure JSON) sera arrêté avec les cinq fiches pilotes : les composants n'en dépendent pas, la décision reste réversible à coût nul.

### 2026-07-07 — Le graphe documentaire devient le modèle central (Volume II, ch. 3)

PrépaPilote est une base de connaissances ; le site n'est que l'interface qui l'explore. Tout contenu est un objet documentaire (famille, relations, gabarit) ; les pages sont des projections. Deux registres de relations : pédagogique (existant) et factuel — prédicats fermés (`content/_referentiels/predicats.json`) avec libellé inverse, familles autorisées et poids par défaut (forte/moyenne/complémentaire), résolus par `src/lib/content/graph.ts` (arête déclarée d'un côté, liens des deux côtés, erreurs bloquantes en CI). Cinq familles ajoutées : organisation, unité, grade, infrastructure, concept. Doctrine complète : docs/editorial/graphe-documentaire.md.

### 2026-07-07 — Format de contenu des fiches : YAML + Markdown

Décidé avec les cinq fiches pilotes. Un fichier `.yaml` par fiche : métadonnées + corps en blocs Markdown (`|`) — diffable pour la relecture par PR, agréable à rédiger, validé intégralement par Zod au chargement (`ficheFileSchema`). Chargeurs dans `src/lib/content/fiches.ts` : intégrité bloquante (schéma, module/catégorie, IDs uniques, relations pédagogiques, graphe factuel). Statuts : seul `publie` sort en production ; `relecture` visible hors production et sur les prévisualisations via `NEXT_PUBLIC_SHOW_DRAFTS=1`. Dépendances ajoutées et justifiées : `yaml` (parseur du format retenu), `react-markdown` + `remark-gfm` (rendu du Markdown de contenu avec tableaux, mappé sur le design system) — alternatives écartées : MDX (pipeline plus lourd, non nécessaire tant que le corps n'embarque pas de composants), JSON (illisible en relecture de prose).

### 2026-07-07 — Moteur de recherche v2 (Volume II, ch. 4)

La recherche est l'accès principal à la connaissance (doctrine : docs/editorial/moteur-de-recherche.md). Implémentation : normalisation française index+requête (accents, casse, pluriels — `normalize.ts`), alias au contrat des objets (`aliases[]`, `searchPriority`), scorer maison pondéré (exact > préfixe > contenu ; titre > alias > tags > résumé ; boost type et contexte de module, jamais filtre) complété par Fuse.js pour le flou, correction « Vouliez-vous dire » (distance d'édition bornée), politique zéro impasse, résultat riche au design system (icône de famille, type, résumé, contexte), barre unique (header + accueil + palette Ctrl/K). Métriques anonymes différées à l'intégration Supabase. Popularité interne exclue du classement au lancement (démarrage à froid) — ajoutée plus tard comme facteur plafonné.

### 2026-07-07 — Architecture des données consacrée (Volume II, ch. 5)

La base documentaire logique est la source de vérité, sur deux supports physiques confirmés : dépôt Git pour les objets documentaires, PostgreSQL pour les données dynamiques (utilisateurs, progression, tentatives) — pont par ID de contenu gelé, jamais de FK vers le contenu. Toute proposition future de migration du contenu vers PostgreSQL devra être présentée séparément (coûts/avantages/risques) avant action. Ajouts au contrat : `reviewer` (relecteur) et `version` sur les fiches, `theme` explicite sur les questions, entité `image` indépendante (auteur, source, licence, alt, date, description — aucune image sans droit établi). Checklist de mise en service créée (docs/mise-en-service.md) : PITR Supabase, versioning Storage, test de restauration, RLS testée, droits des images. Doctrine complète : docs/editorial/architecture-des-donnees.md.

### 2026-07-07 — Moteur pédagogique (Volume II, ch. 6)

Système de quiz consigné (docs/editorial/moteur-pedagogique.md). Contrat étendu : libellés de niveaux (Découverte→Expert), notes de distracteurs, formats `ordre` et `texte-a-trous` (union discriminée extensible), thèmes/familles dans les sélecteurs. Examen blanc = MOTEUR paramétrique (`examSchema` : épreuves définies par thèmes, compétences, concours, niveaux, nombre, durée, barème) sur la banque unique — jamais une collection statique ; liste explicite possible pour reproduire un format officiel sourcé et daté. Moteur pur testé (`src/features/quiz/engine.ts`) : sélection pondérée (jamais-vues > anciennes > récentes), mélange déterministe par graine, scoring par format, barème plancher zéro. Lecteur de quiz au design system (`quiz-player.tsx`) : question, réponses, correction pédagogique, chronomètre, progression, restitution ; jouable sans compte (rien enregistré). Prévisualisation fictive `/design-system/quiz`. Statistiques réservées au mode Progression. Répétition espacée déjà en base (migration 0001).

### 2026-07-07 — Progression utilisateur (Volume II, ch. 7)

Progression consignée (docs/editorial/progression.md). Dérivée à la demande de question_attempts/study_sessions/review_items (jamais de compteurs stockés) : tableau de bord global + 5 vues par module. Seuils de maîtrise CONFIGURABLES (src/lib/progression/config.ts, défauts < 60 / 60–79 / ≥ 80 %, jamais codés en dur). Axe motivant = le parcours dans le temps (depuis quand, heures investies, évolution) — PAS de streak (décision : aucune pression quotidienne). Tout est privé : aucune comparaison, classement ni moyenne entre utilisateurs. Moteur de dérivation pur testé (src/lib/progression/derive.ts : stats, maîtrise par thème, forces/faiblesses, tendance hebdo, journey, recommandations par règles explicables avec motif affiché). Composants au design system (StatCard, ThemeMasteryList, RecommendationList) ; prévisualisation fictive /design-system/progression. Migration 0002 : table revision_list (favoris, RLS). Câblage Supabase (lecture réelle) différé à l'intégration.

Deltas validés (2026-07-09) : (1) **Compétences** — référentiel fermé competences.json + getCompetences(), champ competencies[] sur les questions, competencyMastery à progression indépendante réutilisant le cœur masteryOf (même logique configurable que les thèmes). (2) **Objectifs** — cinq types fermés (terminer un domaine, réviser un concours, examen blanc, consulter N fiches, effectuer N quiz), avancement dérivé (objectiveProgress), migration 0003 (objectives) ne mémorisant que l'intention. (3) **Favoris** — notion UNIQUE : revision_list renommée favorites avec type de contenu (fiche/document/carte/quiz) ; « Réviser mes favoris » = simple vue. (4) **Séries** — pas de streak confirmé, mais resumePoint mémorise le point de reprise (dernier module, dernière activité, révisions dues) sans compteur de jours. Composant générique MasteryList (thèmes + compétences), ObjectiveList, ResumeBlock. Tableau de bord réorganisé selon la règle de sobriété : Reprendre → repères → à travailler aujourd'hui → détail.
