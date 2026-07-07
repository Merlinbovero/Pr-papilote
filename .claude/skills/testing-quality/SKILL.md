---
name: testing-quality
description: Tests, linting, vérification automatique et structure de projet. Utiliser après toute modification de code, avant tout commit, et pour écrire des tests unitaires ou E2E.
---

# Testing & Code Quality

## Commandes

| Commande                                        | Rôle                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm run check`                                 | **Porte de qualité complète** : lint + typecheck + format + tests unitaires  |
| `npm run lint` / `lint:fix`                     | ESLint (config Next.js core-web-vitals + TypeScript)                         |
| `npm run typecheck`                             | `tsc --noEmit` (mode strict)                                                 |
| `npm run format` / `format:check`               | Prettier (+ tri des classes Tailwind)                                        |
| `npm run test` / `test:watch` / `test:coverage` | Vitest + Testing Library (jsdom)                                             |
| `npm run test:e2e`                              | Playwright (Chromium desktop + mobile, lance le serveur dev automatiquement) |

**Règle : exécuter `npm run check` avant chaque commit.** Un commit ne part jamais avec un check rouge.

## Tests unitaires (Vitest + Testing Library)

- Fichiers colocalisés : `xxx.test.ts(x)` à côté du code testé (voir `src/lib/utils.test.ts`, `src/components/ui/button.test.tsx`).
- Tester le **comportement observable par l'utilisateur**, pas l'implémentation : requêtes par rôle (`getByRole`, `getByLabelText`), interactions via `@testing-library/user-event`.
- Prioriser : logique métier de `src/lib/` (calculs de scores, barèmes de concours, parsing de contenu) → couverture élevée ; composants interactifs (quiz, formulaires) → tests de comportement ; composants purement présentatiels → pas de test systématique.
- Le setup (`src/test/setup.ts`) fournit jest-dom, cleanup, et les mocks `matchMedia`/`ResizeObserver`.

## Tests E2E (Playwright)

- Fichiers dans `e2e/*.spec.ts`. Couvrir les parcours critiques : navigation principale, recherche, déroulé d'un quiz/test, changement de thème.
- Sélecteurs par rôle/texte visible, pas de classes CSS. Deux projets configurés : desktop et mobile (Pixel 7).

## Structure de projet

- `src/lib/` : fonctions pures, testables sans DOM. La logique métier ne vit JAMAIS dans un composant.
- Pas de `any` ; les données externes sont validées par un schéma Zod à la frontière.
- Imports absolus `@/…` uniquement (pas de `../../..`).
- En cas d'erreur de build/test inexpliquée : `rm -rf .next` puis relancer.
