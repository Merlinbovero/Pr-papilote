# Architecture — Papilote

Plateforme de préparation aux concours EOPAN, EOPN et ALAT. Objectif : plusieurs centaines de pages de cours, tests psychotechniques, quiz et schémas interactifs (instruments, cockpits, mécanique du vol).

## Stack technique

| Couche          | Choix                                                                              | Raison                                                                                 |
| --------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Framework       | Next.js 16, App Router, `src/`                                                     | Rendu serveur + statique, SEO natif, streaming ; adapté aux très gros sites de contenu |
| Langage         | TypeScript strict                                                                  | Fiabilité sur un gros volume de code                                                   |
| Styles          | Tailwind CSS v4 (config CSS-first dans `globals.css`)                              | Design tokens par variables CSS, thème clair/sombre                                    |
| Composants UI   | shadcn/ui (style radix-nova)                                                       | Primitives accessibles (Radix), possédées dans le repo, personnalisables               |
| Animations      | Framer Motion                                                                      | Transitions et micro-interactions déclaratives                                         |
| Icônes          | Lucide                                                                             | Cohérent avec shadcn                                                                   |
| Tableaux        | TanStack Table                                                                     | Tri/filtres/pagination headless sur les banques de données                             |
| Formulaires     | React Hook Form + Zod                                                              | Validation typée, schéma = source de vérité                                            |
| Graphiques      | Recharts                                                                           | Dashboards de progression                                                              |
| Diagrammes      | React Flow (@xyflow/react)                                                         | Arbres de décision, procédures                                                         |
| Zoom/Pan        | react-zoom-pan-pinch                                                               | Exploration des schémas techniques SVG                                                 |
| Recherche       | Fuse.js                                                                            | Recherche floue côté client sur le contenu                                             |
| Tests unitaires | Vitest + Testing Library (jsdom)                                                   | Rapide, API Jest-compatible                                                            |
| Tests E2E       | Playwright (Chromium desktop + mobile)                                             | Parcours critiques                                                                     |
| Qualité         | ESLint (next/core-web-vitals) + Prettier (+ tri classes Tailwind) + `tsc --noEmit` | Porte de qualité unique : `npm run check`                                              |

## Décisions

### 2026-07-07 — Contenu à grande échelle par routes dynamiques

Les centaines de pages seront générées par des routes dynamiques (`[slug]`) alimentées par du contenu structuré + `generateStaticParams`, groupées par concours : `(concours)/eopan`, `(concours)/eopn`, `(concours)/alat`. Pas de duplication de fichiers `page.tsx`. Le choix du support de contenu (MDX vs base de données) sera arrêté au démarrage du développement du contenu.

### 2026-07-07 — Vulnérabilité postcss transitive corrigée par override

`next@16.2.10` embarque `postcss@8.4.31` (GHSA-qx2v-qp2m-jg93). Corrigé via `overrides` dans `package.json` (`postcss ^8.5.10`). À retirer quand Next mettra à jour sa dépendance.

### 2026-07-07 — Composants formulaire shadcn : pattern `field`

shadcn v4 remplace l'ancien composant `form` par `field.tsx`, compatible React Hook Form. Les formulaires utilisent `Field` + RHF + Zod.
