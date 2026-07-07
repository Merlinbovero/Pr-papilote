# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/). Dates au format AAAA-MM-JJ.

## [Non publié]

### Ajouté

- 2026-07-07 — Système éditorial complet (`docs/editorial/`) : taxonomie unique (sous-catégorie = métadonnée, hors URL), 17 modèles de fiches en 5 familles, dictionnaire des métadonnées, graphe de relations typées, stratégie de quiz (banque centrale + sélecteurs + carnet d'erreurs SRS), pipeline d'ingestion documentaire (« enrichir avant créer »), règles éditoriales et de rédaction, risques et parades à l'échelle. Contrat implémenté en schémas Zod (`content-schemas.ts`, 15 tests).
- 2026-07-07 — Intégration continue : workflow GitHub Actions (lint + types + format + tests unitaires + build, puis E2E Playwright) sur chaque PR.
- 2026-07-07 — Fondations Supabase (sans clés — état « non configuré » propre) :
  - Migration SQL fondatrice : profils, sessions de travail, tentatives de quiz, réponses individuelles (append-only), répétition espacée, avancement de lecture, résultats psychotechniques, agrégats anonymes — RLS activée partout, politiques « propriétaire uniquement ».
  - Pages d'authentification (connexion, inscription, mot de passe oublié) sur Server Actions validées par Zod.
  - Espace `/progression` protégé : tableau de bord global + cinq vues par module ; page `/compte`.
- 2026-07-07 — Fondations V1 de la plateforme :
  - Design system : accent bleu institutionnel, tokens succès/avertissement et marqueurs concours (clair + sombre), thème clair/sombre/système, route interne `/design-system`.
  - Référentiels de contenu (`content/_referentiels/`) : 5 modules et leurs catégories (structure identique garantie entre les trois concours), chargeurs validés par Zod.
  - Layout global : header (logo, recherche, thème, connexion), footer sobre, fil d'Ariane accessible, page 404.
  - Accueil sobre : trois cartes concours verticales + deux cartes transverses horizontales, placeholders remplaçables par configuration.
  - Routes de modules générées depuis les référentiels : 73 pages statiques (hubs de modules et de catégories avec états vides).
  - Fondations de la recherche : contrat `SearchEntry`/provider, fonction pure Fuse.js testée, palette Ctrl/Cmd+K groupée par type, page `/recherche` avec requête dans l'URL.
- 2026-07-07 — Consignation de la conception validée (Prompts 1–3) : `docs/VISION.md` (vision officielle + 16 arbitrages), refonte de `docs/ARCHITECTURE.md` (quatre couches, modèle de contenu, routes, base de données, recherche), création de `docs/design-system.md`, mise à jour des règles projet (`AGENTS.md`).

- 2026-07-07 — Initialisation de l'environnement de développement professionnel :
  - Projet Next.js 16 (App Router, `src/`, TypeScript strict, ESLint) + Tailwind CSS v4.
  - shadcn/ui (style radix-nova) avec 30 composants de base dans `src/components/ui/`.
  - Bibliothèques : Framer Motion, Lucide, TanStack Table, React Hook Form + Zod, Recharts, React Flow, react-zoom-pan-pinch, Fuse.js.
  - Outillage qualité : Prettier (+ tri des classes Tailwind), Vitest + Testing Library, Playwright (desktop + mobile), scripts `check`, `typecheck`, `format`, `test`, `test:e2e`.
  - 10 skills Claude Code de projet dans `.claude/skills/` et règles de projet dans `AGENTS.md`.
  - Documentation initiale : `docs/ARCHITECTURE.md`, `docs/CHANGELOG.md`, `docs/components.md`.

### Corrigé

- 2026-07-07 — Vulnérabilité modérée postcss (transitive via Next) corrigée par override npm.
