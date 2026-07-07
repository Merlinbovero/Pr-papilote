# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/). Dates au format AAAA-MM-JJ.

## [Non publié]

### Ajouté

- 2026-07-07 — Graphe documentaire consacré cœur du projet (Volume II ch. 3) : doctrine `docs/editorial/graphe-documentaire.md` (objets, familles, deux registres de relations, trois niveaux de poids, liens intelligents calculés) ; référentiel fermé des prédicats factuels (6 prédicats initiaux avec libellés inverses et familles autorisées) ; 5 familles d'objets ajoutées au contrat (organisation, unité, grade, infrastructure, concept — 24 types de fiches) ; arêtes factuelles pondérées dans les schémas ; résolveur de graphe pur (`graph.ts`, liens bidirectionnels + erreurs bloquantes) couvert par 5 tests.
- 2026-07-07 — Gabarit officiel de fiche (validé) : `docs/editorial/gabarit-fiche.md` (quatre niveaux de lecture 30 s / 5 min / 20–30 min / approfondissement, règles arbitrées : séparation stricte des modes avec seule action « liste de révision » discrète, « Maîtriser » badgé Expert, infobox latérale desktop / après L'essentiel en mobile, vue impression) ; 15 composants du gabarit dans `src/components/content/` (en-tête, infobox 2 variantes, essentiel, sections, pièges, sommaire actif, relations, sources, documents, entraînement, pied, infobulle de terme, pastille passerelle) ; prévisualisation interne `/design-system/fiche` avec données explicitement fictives ; 6 tests unitaires + 2 tests E2E dédiés.

### Modifié

- 2026-07-07 — Design System officiel (Volume II ch. 2) : `docs/design-system.md` réécrit en référence absolue (tokens complets avec règle unique des variantes d'état, échelles typographie/espacements/rayons/ombres/bordures, breakpoints officiels, conventions de nommage, gabarit de documentation de composant, risques) ; token `info` ajouté (clair + sombre) ; bibliothèque d'animations commune `src/lib/motion.ts` (durées, courbes, variants partagés).

- 2026-07-07 — Doctrine du Framework UI consignée (`docs/ui-framework.md`, Volume II ch. 1) : six questions avant toute décision, pages sans logique, justification obligatoire des nouveaux composants et dépendances, sémantique des couleurs, critère de complétude du framework (les 11 gabarits constructibles sans nouveau composant). Règle 10 ajoutée à `AGENTS.md`.

- 2026-07-07 — Arbitrages éditoriaux intégrés : trois nouveaux types de fiches-objet (`helicoptere`, `navire`, `flottille`) avec leurs modèles d'infobox ; champs d'infobox optionnels formalisés et **valeurs d'approximation rejetées par la validation** (on n'invente jamais une donnée) ; cycles de fraîcheur différenciés (6/12/24 mois selon la nature, `freshness.ts`) avec mise à jour exceptionnelle possible ; référentiel de redirections permanentes (`redirects.json` branché sur la plateforme) pour fusionner ou déplacer des catégories sans casser d'URL.

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
