# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/). Dates au format AAAA-MM-JJ.

## [Non publié]

### Ajouté

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
