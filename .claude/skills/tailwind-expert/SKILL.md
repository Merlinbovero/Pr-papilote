---
name: tailwind-expert
description: Tailwind CSS v4 — responsive, variables de thème, organisation du design system. Utiliser pour tout stylage, ajout de tokens de thème, ou question de mise en page responsive.
---

# Tailwind CSS Expert

Ce projet utilise **Tailwind CSS v4** (configuration CSS-first : PAS de `tailwind.config.ts` — tout se passe dans `src/app/globals.css`).

## Variables de thème

- Les tokens sont des variables CSS dans `globals.css` : `:root` (clair) et `.dark` (sombre), exposés à Tailwind via `@theme inline`.
- **Toujours utiliser les tokens sémantiques** : `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`…
- **Interdit** : couleurs brutes (`bg-blue-500`, `#hex`, `text-white`) dans les composants — toute nouvelle couleur passe par un token dans `globals.css` (définir la variante claire ET sombre).
- Nouveau token : ajouter `--color-xxx: var(--xxx);` dans `@theme inline` + valeurs dans `:root` et `.dark`.

## Responsive

- **Mobile-first obligatoire** : styles de base pour mobile, puis `sm:` (640) `md:` (768) `lg:` (1024) `xl:` (1280).
- Largeur de contenu via un conteneur cohérent : `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` (à factoriser dans le layout, pas répété partout).
- Grilles fluides : `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` ; éviter les hauteurs fixes, préférer `min-h-*` et le flux naturel.
- Tester mentalement chaque écran à 360 px, 768 px et 1440 px.

## Organisation

- Espacement sur l'échelle 4/8 : `gap-2/4/6/8`, `p-4/6/8`, `space-y-*` — pas de valeurs arbitraires (`p-[13px]`) sauf contrainte technique documentée.
- Ordre des classes géré par `prettier-plugin-tailwindcss` (automatique via `npm run format`).
- Classes conditionnelles avec `cn()` de `src/lib/utils.ts`, jamais de concaténation de chaînes.
- Pas de `@apply` sauf styles globaux inévitables ; la réutilisation passe par les composants React, pas par des classes CSS custom.
- Animations utilitaires : `tw-animate-css` est disponible ; les animations complexes vont à Framer Motion.
