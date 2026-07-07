<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Papilote — Règles de projet

Plateforme web de préparation aux concours **EOPAN** (Élève Officier Pilote de l'Aéronautique Navale), **EOPN** (Élève Officier du Personnel Navigant, Armée de l'Air) et **ALAT** (Aviation Légère de l'Armée de Terre). Projet de grande taille : plusieurs centaines de pages de contenu pédagogique, tests, quiz et schémas interactifs.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn/ui (radix-nova) · Framer Motion · Lucide · TanStack Table · React Hook Form + Zod · Recharts · React Flow (@xyflow/react) · react-zoom-pan-pinch · Fuse.js · Vitest + Testing Library · Playwright.

## Skills de projet

Dix skills spécialisées sont définies dans `.claude/skills/` (nextjs-expert, react-ui-architect, tailwind-expert, framer-motion, design-system, accessibility-responsive, performance-optimizer, svg-interactive-graphics, testing-quality, documentation-generator). Les consulter et les respecter dès que leur domaine est touché.

## Règles non négociables

1. **Langue** : interface et contenu en français (`lang="fr"`). Code, noms de variables et commits en anglais.
2. **Qualité avant commit** : `npm run check` (lint + typecheck + format + tests) doit passer. Jamais de commit rouge.
3. **Server Components par défaut** ; `"use client"` uniquement justifié, poussé en feuille d'arbre.
4. **Design system obligatoire** : composants `src/components/ui/` + tokens sémantiques de `globals.css`. Pas de couleur brute, pas de composant UI dupliqué.
5. **Mobile-first et accessible** : WCAG AA, navigation clavier, `getByRole` dans les tests.
6. **Pas de `any`**, imports absolus `@/…`, données externes validées par Zod.
7. **Documentation synchrone** : `docs/CHANGELOG.md` et `docs/` mis à jour dans le même commit que le code.

## Structure

```
src/app/          → routes (App Router) ; groupes (concours)/eopan|eopn|alat à venir
src/components/ui → primitives shadcn (ne pas réécrire)
src/components/   → layout/, shared/ (composants promus à la 2e utilisation)
src/lib/          → logique métier pure et testée
src/hooks/        → hooks partagés
src/test/         → setup Vitest
e2e/              → tests Playwright
docs/             → ARCHITECTURE.md, CHANGELOG.md, components.md
```

## Commandes

`npm run dev` · `npm run build` · `npm run check` · `npm run test:e2e` — détail dans la skill testing-quality.
