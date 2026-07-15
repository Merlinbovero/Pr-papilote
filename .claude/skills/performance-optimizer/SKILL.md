---
name: performance-optimizer
description: Optimisation des performances — lazy loading, images, code splitting, analyse Lighthouse et taille de bundle. Utiliser avant toute mise en production et quand une page devient lourde ou lente.
---

# Performance Optimizer

Objectifs : LCP < 2.5 s, INP < 200 ms, CLS < 0.1, Lighthouse Performance ≥ 90.

## Réflexes par défaut (gratuits avec ce stack)

- Server Components par défaut → moins de JS client. Chaque `"use client"` doit se justifier.
- `next/image` (jamais `<img>`) : dimensionnement, lazy loading et formats modernes automatiques. `priority` uniquement sur l'image LCP au-dessus de la ligne de flottaison ; `sizes` correct sur les images en grille.
- `next/font` : pas de layout shift, pas de requête externe.
- Pages statiques par défaut ; streaming avec `loading.tsx`/`Suspense` pour les parties lentes.

## Code splitting

- Next.js splitte déjà par route. Ajouter `next/dynamic` pour les composants lourds et non critiques :
  React Flow, Recharts, react-zoom-pan-pinch, éditeurs — avec `loading: () => <Skeleton …/>` et, si besoin, `ssr: false`.
- Charger sous condition ce qui n'apparaît qu'après interaction (modale complexe, palette de commande).
- Imports ciblés uniquement — pas de barrel files (`index.ts` réexportant tout un dossier) dans `src/`.

## Analyse

- Taille de bundle : `npm run build` affiche la First Load JS par route — surveiller ce tableau à chaque ajout de dépendance ; > 200 kB sur une route = investiguer (`@next/bundle-analyzer` si besoin).
- Lighthouse : `npm run build && npm run start` puis `npx lighthouse http://localhost:3000 --preset=desktop --view` (et sans preset pour mobile). Auditer les 4 catégories.
- Re-render React : pas de `useMemo`/`memo` spéculatifs ; mesurer d'abord (React DevTools Profiler), optimiser ensuite. Clés stables dans les listes.

## Données volumineuses (banques de questions, listes de pages)

- Pagination ou virtualisation au-delà de ~100 lignes affichées.
- Recherche Fuse.js : construire l'index une fois (`useMemo` ou côté serveur), pas à chaque frappe ; debouncer la saisie (~150 ms).
