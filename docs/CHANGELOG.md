# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/). Dates au format AAAA-MM-JJ.

## [Non publié]

### Ajouté

- 2026-07-07 — Architecture des données consacrée (Volume II ch. 5, doctrine `docs/editorial/architecture-des-donnees.md`) : base documentaire logique unique sur deux supports (Git pour le documentaire, PostgreSQL pour le dynamique — arbitrage confirmé, migration éventuelle soumise à présentation séparée) ; champs `relecteur` et `version` au contrat ; entité `image` indépendante et validée (auteur, source, licence, alt, date, description) ; thème explicite des questions ; checklist de mise en service (`docs/mise-en-service.md`) incluant PITR Supabase, versioning Storage et test de restauration.
- 2026-07-07 — Moteur de recherche v2 (Volume II ch. 4, doctrine `docs/editorial/moteur-de-recherche.md`) : normalisation française (accents, casse, pluriels — « porte avion » = « Porte-avions »), alias d'objets au contrat (CDG → Charles de Gaulle), classement pondéré (correspondance, type, contexte de module en boost, priorité éditoriale), correction « Vouliez-vous dire », politique zéro impasse (recherche élargie annoncée + portes de sortie), résultats riches (icône de famille, type, résumé, contexte) dans la palette et sur `/recherche` avec filtres facultatifs, barre de recherche sobre sur l'accueil. Métriques anonymes différées à l'intégration Supabase. 9 tests unitaires + 5 scénarios E2E dédiés.
- 2026-07-07 — Les cinq fiches pilotes, premiers nœuds réels du graphe (statut relecture, sources officielles consultées) : Rafale M, porte-avions Charles de Gaulle, Appontage, Flottille 11F, CATOBAR + termes de dictionnaire CATOBAR et Appontage. Pipeline de contenu complet : format YAML+Markdown validé par Zod, chargeurs à intégrité bloquante, route réelle `/[module]/[categorie]/[slug]` sur le gabarit officiel avec liens intelligents calculés du graphe, hubs de catégories alimentés, dictionnaire (`/dictionnaire`), recherche étendue aux fiches et termes. 7 tests d'intégrité des pilotes + 4 tests E2E (18 au total).
- 2026-07-07 — Graphe documentaire consacré cœur du projet (Volume II ch. 3) : doctrine `docs/editorial/graphe-documentaire.md` (objets, familles, deux registres de relations, trois niveaux de poids, liens intelligents calculés) ; référentiel fermé des prédicats factuels (6 prédicats initiaux avec libellés inverses et familles autorisées) ; 5 familles d'objets ajoutées au contrat (organisation, unité, grade, infrastructure, concept — 24 types de fiches) ; arêtes factuelles pondérées dans les schémas ; résolveur de graphe pur (`graph.ts`, liens bidirectionnels + erreurs bloquantes) couvert par 5 tests.
- 2026-07-07 — Gabarit officiel de fiche (validé) : `docs/editorial/gabarit-fiche.md` (quatre niveaux de lecture 30 s / 5 min / 20–30 min / approfondissement, règles arbitrées : séparation stricte des modes avec seule action « liste de révision » discrète, « Maîtriser » badgé Expert, infobox latérale desktop / après L'essentiel en mobile, vue impression) ; 15 composants du gabarit dans `src/components/content/` (en-tête, infobox 2 variantes, essentiel, sections, pièges, sommaire actif, relations, sources, documents, entraînement, pied, infobulle de terme, pastille passerelle) ; prévisualisation interne `/design-system/fiche` avec données explicitement fictives ; 6 tests unitaires + 2 tests E2E dédiés.

### Modifié

- 2026-07-07 — Arbitrages post-pilotes : familles documentaires distinctes dans le référentiel des concours (Navires, Bases aériennes, BAN, Unités, Concepts aéronautiques, Histoire, Personnalités ajoutés — 20 catégories) avec recatégorisation des pilotes (Charles de Gaulle → Navires, 11F → Unités, CATOBAR → Concepts) démontrant les garanties du système : IDs gelés (graphe intact) et redirections permanentes (3 entrées, aucune URL cassée) ; workflow éditorial étendu à six statuts (brouillon, relecture, validée, publiée, à mettre à jour, archivée) avec bannières dédiées ; règle cardinale consignée (chaque fiche publiée = une référence).

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
