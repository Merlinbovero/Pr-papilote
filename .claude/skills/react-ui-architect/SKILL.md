---
name: react-ui-architect
description: Architecture de composants React réutilisables et modulaires. Utiliser lors de la création ou refactorisation de composants, de la structuration de features, ou de choix de gestion d'état.
---

# React UI Architect

## Organisation des composants

```
src/components/
  ui/          → primitives shadcn/ui (ne PAS modifier sauf besoin design system)
  layout/      → Header, Footer, Sidebar, Shell
  shared/      → composants métier réutilisables (StatCard, QuizCard, …)
src/app/<route>/_components/ → composants propres à une route
```

Règle de promotion : un composant naît dans `_components/` de sa route ; il n'est promu dans `shared/` qu'à partir de sa **deuxième** utilisation. Ne jamais créer d'abstraction spéculative.

## Principes de conception

- Composants **petits et à responsabilité unique** ; extraire dès qu'un composant dépasse ~150 lignes ou mélange logique et présentation.
- **Props typées explicitement** (`interface XxxProps`), pas de `any`, pas de spread opaque. Étendre les props natives via `React.ComponentProps<"button">` quand pertinent.
- Préférer la **composition** (children, slots, compound components) à la configuration par booléens. Trois props booléennes d'affichage = signal de refactorisation.
- Variantes visuelles gérées par `class-variance-authority` (cva), comme dans `src/components/ui/button.tsx` — suivre ce modèle.
- Extraire la logique réutilisable dans des hooks `src/hooks/use-xxx.ts`.

## État

- État serveur/contenu → Server Components + props.
- État local UI → `useState`/`useReducer` au plus près de l'usage.
- État d'URL (filtres, onglets, pagination) → `searchParams` / `useSearchParams`, pour des pages partageables.
- Éviter les contexts globaux fourre-tout ; un context par préoccupation (thème via next-themes déjà en place).

## Formulaires et tableaux

- Formulaires : React Hook Form + Zod (`@hookform/resolvers/zod`) + composants `field.tsx` de shadcn. Le schéma Zod est la source de vérité, typé via `z.infer`.
- Tableaux de données : TanStack Table + primitives `table.tsx` de shadcn ; définir les colonnes dans un fichier `columns.tsx` séparé.
