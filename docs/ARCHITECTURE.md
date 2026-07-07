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

Tables : `profiles`, `study_sessions`, `quiz_attempts`, `question_attempts` (table maîtresse, append-only), `review_items` (répétition espacée), `fiche_progress`, `psychotech_results`, `question_stats` (agrégats anonymes, écrits par rôle de service).

Règles :

- **RLS sur toutes les tables**, politique par défaut « refuser », `user_id = auth.uid()` ;
- carnet d'erreurs et cinq progressions = **vues calculées** sur `question_attempts` (jamais de compteurs stockés qui divergent) ;
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
