---
name: nextjs-expert
description: Expertise Next.js (App Router, architecture, SEO, optimisation). Utiliser pour toute création de page, route, layout, metadata, ou décision d'architecture serveur/client dans ce projet Next.js.
---

# Next.js Expert

Ce projet utilise **Next.js 16 (App Router) + React 19 + TypeScript strict**. La documentation embarquée de la version exacte est dans `node_modules/next/dist/docs/` — la consulter en cas de doute sur une API.

## Architecture

- Tout le code applicatif vit dans `src/`. Les routes dans `src/app/`, les composants dans `src/components/`, la logique dans `src/lib/`, les hooks dans `src/hooks/`.
- **Server Components par défaut.** N'ajouter `"use client"` que pour l'interactivité réelle (état, événements, hooks navigateur, Framer Motion, Recharts, React Flow).
- Pousser la frontière client le plus bas possible : un petit composant client feuille plutôt qu'une page entière cliente.
- Colocaliser les fichiers propres à une route dans son dossier (`_components/`, `_lib/` préfixés underscore pour éviter le routage).
- Pour un site de plusieurs centaines de pages : utiliser des routes dynamiques (`[slug]`) alimentées par du contenu structuré (MDX/JSON/DB) + `generateStaticParams`, jamais des centaines de fichiers page dupliqués.
- Grouper les sections par route groups : `(marketing)`, `(app)`, `(concours)/eopan`, `(concours)/eopn`, `(concours)/alat`, chacun avec son layout.

## SEO

- Chaque page exporte `metadata` ou `generateMetadata` (title, description, openGraph, alternates.canonical).
- Définir un `title.template` dans le layout racine (ex. `"%s | Papilote"`).
- Ajouter `sitemap.ts` et `robots.ts` dans `src/app/` dès que les routes se stabilisent.
- Données structurées JSON-LD pour les contenus pédagogiques (Course, FAQPage, BreadcrumbList).
- URLs propres, en français, en kebab-case : `/concours/eopan/tests-psychotechniques`.

## Optimisation

- `next/image` pour toute image, `next/font` pour les polices (déjà configuré avec Geist).
- `loading.tsx` + Suspense pour le streaming ; `error.tsx` et `not-found.tsx` par section.
- `dynamic(() => import(...))` pour les composants lourds client-only (React Flow, Recharts, éditeurs).
- Statique par défaut : ne pas utiliser `cookies()`/`headers()`/`searchParams` sans nécessité, cela bascule la route en dynamique.

## Vérification

Après toute modification significative : `npm run lint && npm run typecheck && npm run build`.
