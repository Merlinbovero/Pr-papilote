<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PrépaPilote — Règles de projet

Plateforme web de préparation aux concours **EOPAN** (Marine nationale), **EOPN** (Armée de l'Air et de l'Espace) et **ALAT** (Armée de Terre). Vision officielle : `docs/VISION.md`. Architecture : `docs/ARCHITECTURE.md`. Design system : `docs/design-system.md`. Framework UI : `docs/ui-framework.md`. Système éditorial : `docs/editorial/`. Ces documents font autorité.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn/ui (radix-nova) · Framer Motion · Lucide · TanStack Table · React Hook Form + Zod · Recharts · React Flow · react-zoom-pan-pinch · Fuse.js · Supabase (Auth/PostgreSQL/Storage, région UE) · Vercel · Vitest + Testing Library · Playwright.

## Skills de projet

Dix skills dans `.claude/skills/` (nextjs-expert, react-ui-architect, tailwind-expert, framer-motion, design-system, accessibility-responsive, performance-optimizer, svg-interactive-graphics, testing-quality, documentation-generator). Les consulter dès que leur domaine est touché.

## Règles non négociables

1. **Langue** : interface et contenu en français (`lang="fr"`). Code, noms de variables et commits en anglais.
2. **Qualité avant commit** : `npm run check` doit passer. Jamais de commit rouge.
3. **Server Components par défaut** ; `"use client"` justifié, poussé en feuille d'arbre.
4. **Design system obligatoire** : primitives `src/components/ui/` + tokens de `globals.css`. Pas de couleur brute, pas de composant UI dupliqué.
5. **Responsive** : conception desktop-first, implémentation CSS mobile-first. Aucune fonctionnalité ne disparaît sur mobile. WCAG AA, navigation clavier, `getByRole` dans les tests.
6. **Pas de `any`**, imports absolus `@/…`, données externes validées par Zod.
7. **Documentation synchrone** : `docs/CHANGELOG.md` et docs concernées mises à jour dans le même commit que le code.
8. **Frontière des données** : le contenu vit dans `content/` (jamais en base) ; Supabase ne stocke que les données utilisateur, référencées par ID de contenu stables et gelés. Les routes documentaires n'instancient jamais le client Supabase.
9. **Secrets** : uniquement en variables d'environnement. Le build et les tests ne dépendent jamais des secrets (état « non configuré » propre).
10. **Framework UI** (`docs/ui-framework.md`) : toute page est une composition de composants du catalogue ; créer un composant exige de justifier pourquoi les existants ne suffisent pas ; toute nouvelle dépendance est justifiée dans ARCHITECTURE.md ; les couleurs portent un sens (bleu=navigation, vert=validation, orange=attention, rouge=erreur, gris=secondaire) ; les pages ne contiennent presque aucune logique.

## Structure

```
content/            → contenu structuré (référentiels, fiches, questions…) — source de vérité
src/app/            → routes (gabarits) ; /progression et /compte = espace authentifié
src/components/ui   → primitives shadcn (ne pas réécrire)
src/components/     → layout/, content/ (rendu RSC du contenu), shared/ (promus à la 2e utilisation)
src/features/       → moteurs verticaux (search, quiz, progression, psychotech) : UI + logique colocalisées
src/lib/content     → schémas Zod + chargeurs du contenu
src/lib/supabase    → clients Supabase + garde de configuration
src/lib/            → logique métier pure et testée
supabase/migrations → SQL versionné (seul canal de modification du schéma)
scripts/            → validation de contenu, index de recherche
e2e/ · docs/        → tests Playwright · documentation
```

## Commandes

`npm run dev` · `npm run build` · `npm run check` · `npm run test:e2e` — détail dans la skill testing-quality.
